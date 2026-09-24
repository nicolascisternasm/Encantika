/**
 * Verificacion de politicas RLS contra el proyecto Supabase remoto.
 * Uso: npx tsx scripts/test-rls.ts
 *
 * Todo dato creado usa el prefijo __test__ en slug/nombre.
 * limpiar_datos_prueba() (migracion 000007) los borra al finalizar,
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
const SLUG_ACTIVO  = '__test__rls-activo'
const SLUG_BORRADOR = '__test__rls-borrador'
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
    console.error(`  ✗  ${label}  — lanzo: ${String(err)}`)
    failed++
  }
}

async function limpiar(admin: ReturnType<typeof createClient<Database>>) {
  console.log('\nLimpiando datos de prueba...')
  const { error } = await (admin as any).rpc('limpiar_datos_prueba')
  if (error) {
    console.error(`  ⚠  limpiar_datos_prueba() fallo: ${error.message}`)
    return
  }
  await check('no quedan productos __test__ en la BD', async () => {
    const { data } = await admin
      .from('productos')
      .select('id')
      .in('slug', [SLUG_ACTIVO, SLUG_BORRADOR, SLUG_STOCK])
    return !data || data.length === 0
  })
}

function printSummary() {
  console.log(`\n${'─'.repeat(50)}`)
  console.log(`Resultado: ${passed} pasaron, ${failed} fallaron`)
  if (failed > 0) process.exit(1)
}

async function main() {
  console.log('\n=== Verificacion RLS (anon key) ===\n')

  // ── Tablas bloqueadas para anon ─────────────────────────────
  console.log('Tablas bloqueadas para anon:')
  for (const tbl of ['pedidos', 'clientes', 'pagos', 'movimientos_inventario', 'perfiles'] as const) {
    await check(`${tbl} → 0 filas`, async () => {
      const { data } = await anon.from(tbl).select('id').limit(1)
      return !data || data.length === 0
    })
  }
  await check('stock_variantes → 0 filas para anon (security_invoker = true)', async () => {
    const { data } = await (anon as any).from('stock_variantes').select('*').limit(1)
    return !data || data.length === 0
  })

  // ── Tablas legibles para anon ───────────────────────────────
  console.log('\nTablas legibles para anon:')
  await check('configuracion_tienda → legible', async () => {
    const { error } = await anon.from('configuracion_tienda').select('nombre_tienda').eq('id', 1).single()
    return !error
  })
  await check('categorias (activas) → legibles', async () => {
    const { error } = await anon.from('categorias').select('id').eq('activo', true)
    return !error
  })
  await check('atributos → legibles', async () => {
    const { error } = await anon.from('atributos').select('id')
    return !error
  })

  if (!SERVICE_KEY) {
    console.log('\n  (sin SUPABASE_SERVICE_ROLE_KEY — omitiendo pruebas con service_role)')
    printSummary()
    return
  }

  const admin = createClient<Database>(SUPABASE_URL, SERVICE_KEY)

  try {
    // ── Filtrado por estado de producto ──────────────────────────
    console.log('\nFiltrado por estado de producto:')

    // Limpiar posibles restos de ejecuciones previas
    await admin.from('productos').delete().in('slug', [SLUG_ACTIVO, SLUG_BORRADOR])

    const { data: prodActivo } = await admin.from('productos').insert({
      nombre: '__Test__ RLS Activo', slug: SLUG_ACTIVO, precio_base: 1000, estado: 'activo',
    } as any).select('id').single()

    const { data: prodBorrador } = await admin.from('productos').insert({
      nombre: '__Test__ RLS Borrador', slug: SLUG_BORRADOR, precio_base: 1000, estado: 'borrador',
    } as any).select('id').single()

    await check('producto activo → legible para anon', async () => {
      if (!prodActivo) return false
      const { data } = await anon.from('productos').select('id').eq('id', (prodActivo as any).id).single()
      return !!data
    })
    await check('producto borrador → NO legible para anon', async () => {
      if (!prodBorrador) return false
      const { data } = await anon.from('productos').select('id').eq('id', (prodBorrador as any).id)
      return !data || data.length === 0
    })

    // ── vista stock_variantes + trigger de inmutabilidad ─────────
    console.log('\nvista stock_variantes + inmutabilidad de inventario:')

    const { data: prod } = await admin.from('productos').insert({
      nombre: '__Test__ Stock', slug: SLUG_STOCK, precio_base: 1000, estado: 'activo',
    } as any).select('id').single()

    const { data: variante } = await admin.from('variantes_producto').insert({
      producto_id: (prod as any).id, sku: SKU_STOCK, precio: 1000,
    } as any).select('id').single()

    const vid = (variante as any).id

    await admin.from('movimientos_inventario').insert([
      { variante_id: vid, cantidad:  5, tipo: 'compra' },
      { variante_id: vid, cantidad:  3, tipo: 'compra' },
      { variante_id: vid, cantidad: -2, tipo: 'venta'  },
    ] as any)

    await check('stock_variantes suma correcta (5+3-2 = 6) via admin', async () => {
      const { data } = await admin.from('stock_variantes' as any).select('stock').eq('variante_id', vid).single()
      return (data as any)?.stock === 6
    })

    // ── obtener_disponibilidad_variantes (SECURITY DEFINER) ───────
    console.log('\nobtener_disponibilidad_variantes (SECURITY DEFINER):')

    await check('anon PUEDE llamar obtener_disponibilidad_variantes', async () => {
      const { data, error } = await (anon as any).rpc('obtener_disponibilidad_variantes', { variante_ids: [vid] })
      return !error && Array.isArray(data) && data.length === 1
    })
    await check('resultado tiene en_stock/stock_bajo/permite_a_pedido — sin cantidad raw', async () => {
      const { data } = await (anon as any).rpc('obtener_disponibilidad_variantes', { variante_ids: [vid] })
      if (!Array.isArray(data) || data.length === 0) return false
      const row = (data as any[])[0]
      return (
        'en_stock'         in row &&
        'stock_bajo'       in row &&
        'permite_a_pedido' in row &&
        !('stock'    in row)     &&
        !('cantidad' in row)
      )
    })
    await check('en_stock=true, stock_bajo=false para stock=6', async () => {
      const { data } = await (anon as any).rpc('obtener_disponibilidad_variantes', { variante_ids: [vid] })
      const row = (data as any[])?.[0]
      return row?.en_stock === true && row?.stock_bajo === false
    })

    // ── Trigger de inmutabilidad ─────────────────────────────────
    console.log('\nTrigger de inmutabilidad de inventario:')

    const { data: movimiento } = await admin
      .from('movimientos_inventario').select('id').eq('variante_id', vid).limit(1).single()

    await check('UPDATE en movimientos_inventario lanza excepcion', async () => {
      const { error } = await admin
        .from('movimientos_inventario').update({ nota: 'intento de mutacion' } as any).eq('id', (movimiento as any).id)
      return !!error && error.message.includes('inmutable')
    })
    await check('DELETE directo en movimientos_inventario lanza excepcion', async () => {
      const { error } = await admin
        .from('movimientos_inventario').delete().eq('id', (movimiento as any).id)
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
