/**
 * Verificación de políticas RLS contra el proyecto Supabase remoto.
 * Uso: npx tsx scripts/test-rls.ts
 *
 * Todo dato creado usa el prefijo __test__ en slug/nombre.
 * limpiar_datos_prueba() (migration 000007) los borra al finalizar,
 * incluso si alguna prueba falla.
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/database'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON_KEY    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const anon = createClient<Database>(SUPABASE_URL, ANON_KEY)

// Slugs con prefijo __test__ para que limpiar_datos_prueba() los identifique
const ts           = Date.now()
const SLUG_ACTIVE  = '__test__rls-active'
const SLUG_DRAFT   = '__test__rls-draft'
const SLUG_STOCK   = `__test__stock-${ts}`
const SKU_STOCK    = `__TEST__STOCK-${ts}`

let passed = 0
let failed = 0

async function check(label: string, fn: () => Promise<boolean>) {
  try {
    const ok = await fn()
    if (ok) { console.log(`  ✓  ${label}`); passed++ }
    else     { console.error(`  ✗  ${label}`); failed++ }
  } catch (err) {
    console.error(`  ✗  ${label}  — lanzó: ${String(err)}`)
    failed++
  }
}

async function limpiar(admin: ReturnType<typeof createClient<Database>>) {
  console.log('\nLimpiando datos de prueba...')
  const { error } = await (admin as any).rpc('limpiar_datos_prueba')
  if (error) {
    console.error(`  ⚠  limpiar_datos_prueba() falló: ${error.message}`)
    return
  }
  await check('no quedan productos __test__ en la BD', async () => {
    const { data } = await admin
      .from('products')
      .select('id')
      .in('slug', [SLUG_ACTIVE, SLUG_DRAFT, SLUG_STOCK])
    return !data || data.length === 0
  })
}

function printSummary() {
  console.log(`\n${'─'.repeat(50)}`)
  console.log(`Resultado: ${passed} pasaron, ${failed} fallaron`)
  if (failed > 0) process.exit(1)
}

async function main() {
  console.log('\n=== Verificación RLS (anon key) ===\n')

  // ── Tablas bloqueadas para anon ─────────────────────────────
  console.log('Tablas bloqueadas para anon:')
  for (const tbl of ['orders', 'customers', 'payments', 'inventory_movements', 'profiles'] as const) {
    await check(`${tbl} → 0 filas`, async () => {
      const { data } = await anon.from(tbl).select('id').limit(1)
      return !data || data.length === 0
    })
  }
  await check('variant_stock → 0 filas para anon (security_invoker = true)', async () => {
    const { data } = await (anon as any).from('variant_stock').select('*').limit(1)
    return !data || data.length === 0
  })

  // ── Tablas legibles para anon ───────────────────────────────
  console.log('\nTablas legibles para anon:')
  await check('store_settings → legible', async () => {
    const { error } = await anon.from('store_settings').select('store_name').eq('id', 1).single()
    return !error
  })
  await check('categories (activas) → legibles', async () => {
    const { error } = await anon.from('categories').select('id').eq('is_active', true)
    return !error
  })
  await check('attributes → legibles', async () => {
    const { error } = await anon.from('attributes').select('id')
    return !error
  })

  if (!SERVICE_KEY) {
    console.log('\n  (sin SUPABASE_SERVICE_ROLE_KEY — omitiendo pruebas con service_role)')
    printSummary()
    return
  }

  const admin = createClient<Database>(SUPABASE_URL, SERVICE_KEY)

  try {
    // ── Filtrado por status de producto ──────────────────────────
    console.log('\nFiltrado por status de producto:')

    // Limpiar posibles restos de ejecuciones previas
    await admin.from('products').delete().in('slug', [SLUG_ACTIVE, SLUG_DRAFT])

    const { data: activeProd } = await admin.from('products').insert({
      name: '__Test__ RLS Active', slug: SLUG_ACTIVE, base_price: 1000, status: 'active',
    }).select('id').single()

    const { data: draftProd } = await admin.from('products').insert({
      name: '__Test__ RLS Draft', slug: SLUG_DRAFT, base_price: 1000, status: 'draft',
    }).select('id').single()

    await check('producto activo → legible para anon', async () => {
      if (!activeProd) return false
      const { data } = await anon.from('products').select('id').eq('id', activeProd.id).single()
      return !!data
    })
    await check('producto draft → NO legible para anon', async () => {
      if (!draftProd) return false
      const { data } = await anon.from('products').select('id').eq('id', draftProd.id)
      return !data || data.length === 0
    })

    // ── vista variant_stock + trigger de inmutabilidad ───────────
    console.log('\nvista variant_stock + inmutabilidad de inventario:')

    const { data: prod } = await admin.from('products').insert({
      name: '__Test__ Stock', slug: SLUG_STOCK, base_price: 1000, status: 'active',
    }).select('id').single()

    const { data: variant } = await admin.from('product_variants').insert({
      product_id: prod!.id, sku: SKU_STOCK, price: 1000,
    }).select('id').single()

    const vid = variant!.id

    await admin.from('inventory_movements').insert([
      { variant_id: vid, quantity:  5, type: 'purchase' as const },
      { variant_id: vid, quantity:  3, type: 'purchase' as const },
      { variant_id: vid, quantity: -2, type: 'sale'     as const },
    ])

    await check('variant_stock suma correcta (5+3-2 = 6) vía admin', async () => {
      const { data } = await admin.from('variant_stock').select('stock').eq('variant_id', vid).single()
      return (data as any)?.stock === 6
    })

    // ── get_variant_availability (SECURITY DEFINER) ──────────────
    console.log('\nget_variant_availability (SECURITY DEFINER):')

    await check('anon PUEDE llamar get_variant_availability', async () => {
      const { data, error } = await anon.rpc('get_variant_availability', { variant_ids: [vid] })
      return !error && Array.isArray(data) && data.length === 1
    })
    await check('resultado tiene in_stock/low_stock/allow_made_to_order — sin cantidad raw', async () => {
      const { data } = await anon.rpc('get_variant_availability', { variant_ids: [vid] })
      if (!Array.isArray(data) || data.length === 0) return false
      const row = (data as any[])[0]
      return (
        'in_stock'            in row &&
        'low_stock'           in row &&
        'allow_made_to_order' in row &&
        !('stock'    in row)         &&
        !('quantity' in row)
      )
    })
    await check('in_stock=true, low_stock=false para stock=6', async () => {
      const { data } = await anon.rpc('get_variant_availability', { variant_ids: [vid] })
      const row = (data as any[])?.[0]
      return row?.in_stock === true && row?.low_stock === false
    })

    // ── Trigger de inmutabilidad ─────────────────────────────────
    console.log('\nTrigger de inmutabilidad de inventario:')

    const { data: movement } = await admin
      .from('inventory_movements').select('id').eq('variant_id', vid).limit(1).single()

    await check('UPDATE en inventory_movements lanza excepción', async () => {
      const { error } = await admin
        .from('inventory_movements').update({ note: 'intento de mutación' }).eq('id', movement!.id)
      return !!error && error.message.includes('inmutable')
    })
    await check('DELETE directo en inventory_movements lanza excepción', async () => {
      const { error } = await admin
        .from('inventory_movements').delete().eq('id', movement!.id)
      return !!error && error.message.includes('inmutable')
    })

  } catch (err) {
    console.error(`\n  ✗  Error inesperado en pruebas: ${err}`)
    failed++
  } finally {
    await limpiar(admin)
  }

  printSummary()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
