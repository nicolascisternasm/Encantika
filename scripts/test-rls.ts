/**
 * RLS verification script
 * Usage: npx tsx scripts/test-rls.ts
 *
 * Verifies:
 * 1. anon key CANNOT read orders, customers, payments, inventory_movements, profiles
 * 2. anon key CANNOT read variant_stock (security_invoker = true)
 * 3. anon key CAN call get_variant_availability (SECURITY DEFINER, returns only booleans)
 * 4. anon key CAN read active products; CANNOT read drafts
 * 5. UPDATE on inventory_movements raises an exception (immutable trigger)
 * 6. variant_stock view returns correct sum after inserting movements
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/database'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const anon = createClient<Database>(SUPABASE_URL, ANON_KEY)

let passed = 0
let failed = 0

async function check(label: string, fn: () => Promise<boolean>) {
  try {
    const ok = await fn()
    if (ok) {
      console.log(`  ✓  ${label}`)
      passed++
    } else {
      console.error(`  ✗  ${label}`)
      failed++
    }
  } catch (err) {
    console.error(`  ✗  ${label}  — threw: ${String(err)}`)
    failed++
  }
}

async function main() {
  console.log('\n=== RLS verification (anon key) ===\n')

  // ── Tables that should be BLOCKED for anon ─────────────────
  console.log('Tables blocked for anon:')

  for (const tbl of ['orders', 'customers', 'payments', 'inventory_movements', 'profiles'] as const) {
    await check(`${tbl} → 0 rows`, async () => {
      const { data } = await anon.from(tbl).select('id').limit(1)
      return !data || data.length === 0
    })
  }

  // ── variant_stock blocked for anon (security_invoker) ──────
  await check('variant_stock → 0 rows for anon (security_invoker = true)', async () => {
    const { data } = await (anon as any).from('variant_stock').select('*').limit(1)
    return !data || data.length === 0
  })

  // ── Tables readable for anon ───────────────────────────────
  console.log('\nTables readable for anon:')

  await check('store_settings → readable', async () => {
    const { error } = await anon.from('store_settings').select('store_name').eq('id', 1).single()
    return !error
  })
  await check('categories (active) → readable', async () => {
    const { error } = await anon.from('categories').select('id').eq('is_active', true)
    return !error
  })
  await check('attributes → readable', async () => {
    const { error } = await anon.from('attributes').select('id')
    return !error
  })

  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SERVICE_KEY) {
    console.log('\n  (skipping service-role tests — SUPABASE_SERVICE_ROLE_KEY not set)')
    printSummary()
    return
  }

  const admin = createClient<Database>(SUPABASE_URL, SERVICE_KEY)

  // ── Product status filtering ───────────────────────────────
  console.log('\nProduct status filtering:')

  await admin.from('products').delete().eq('slug', 'rls-test-active')
  await admin.from('products').delete().eq('slug', 'rls-test-draft')

  const { data: activeProd } = await admin.from('products').insert({
    name: 'RLS Test Active', slug: 'rls-test-active', base_price: 1000, status: 'active',
  }).select('id').single()

  const { data: draftProd } = await admin.from('products').insert({
    name: 'RLS Test Draft', slug: 'rls-test-draft', base_price: 1000, status: 'draft',
  }).select('id').single()

  await check('active product → readable by anon', async () => {
    if (!activeProd) return false
    const { data } = await anon.from('products').select('id').eq('id', activeProd.id).single()
    return !!data
  })
  await check('draft product → NOT readable by anon', async () => {
    if (!draftProd) return false
    const { data } = await anon.from('products').select('id').eq('id', draftProd.id)
    return !data || data.length === 0
  })

  await admin.from('products').delete().eq('slug', 'rls-test-active')
  await admin.from('products').delete().eq('slug', 'rls-test-draft')

  // ── variant_stock view + immutability trigger ──────────────
  console.log('\nvariant_stock view + inventory immutability:')

  const { data: prod } = await admin.from('products').insert({
    name: 'Stock Test', slug: `stock-test-${Date.now()}`, base_price: 1000, status: 'active',
  }).select('id').single()

  const { data: variant } = await admin.from('product_variants').insert({
    product_id: prod!.id, sku: `STOCK-${Date.now()}`, price: 1000,
  }).select('id').single()

  const vid = variant!.id

  // Insert movements: +5, +3, -2 → stock = 6
  await admin.from('inventory_movements').insert([
    { variant_id: vid, quantity: 5,  type: 'purchase' as const },
    { variant_id: vid, quantity: 3,  type: 'purchase' as const },
    { variant_id: vid, quantity: -2, type: 'sale' as const },
  ])

  await check('variant_stock sum correct (5+3-2 = 6) via admin', async () => {
    const { data } = await admin.from('variant_stock').select('stock').eq('variant_id', vid).single()
    return (data as any)?.stock === 6
  })

  // ── get_variant_availability (SECURITY DEFINER, callable by anon) ─
  console.log('\nget_variant_availability (SECURITY DEFINER):')

  await check('anon CAN call get_variant_availability', async () => {
    const { data, error } = await anon.rpc('get_variant_availability', {
      variant_ids: [vid],
    })
    return !error && Array.isArray(data) && data.length === 1
  })

  await check('result has in_stock/low_stock/allow_made_to_order — no raw quantity', async () => {
    const { data } = await anon.rpc('get_variant_availability', { variant_ids: [vid] })
    if (!Array.isArray(data) || data.length === 0) return false
    const row = (data as any[])[0]
    return (
      'in_stock' in row &&
      'low_stock' in row &&
      'allow_made_to_order' in row &&
      !('stock' in row) &&
      !('quantity' in row)
    )
  })

  // stock is 6, so in_stock = true, low_stock = false
  await check('in_stock=true, low_stock=false for stock=6', async () => {
    const { data } = await anon.rpc('get_variant_availability', { variant_ids: [vid] })
    const row = (data as any[])?.[0]
    return row?.in_stock === true && row?.low_stock === false
  })

  // ── Immutability trigger ───────────────────────────────────
  console.log('\nInventory immutability trigger:')

  // Get the id of a movement to try to update
  const { data: movement } = await admin
    .from('inventory_movements')
    .select('id')
    .eq('variant_id', vid)
    .limit(1)
    .single()

  await check('UPDATE on inventory_movements raises exception', async () => {
    const { error } = await admin
      .from('inventory_movements')
      .update({ note: 'try to mutate' })
      .eq('id', movement!.id)
    return !!error && error.message.includes('inmutable')
  })

  await check('DELETE on inventory_movements raises exception', async () => {
    const { error } = await admin
      .from('inventory_movements')
      .delete()
      .eq('id', movement!.id)
    return !!error && error.message.includes('inmutable')
  })

  // Note: inventory_movements are immutable (trigger) and variant has ON DELETE RESTRICT,
  // so test records (prod + variant + movements) can't be cleaned up programmatically.
  // They're harmless — each run uses Date.now() suffixes for unique slugs/SKUs.

  printSummary()
}

function printSummary() {
  console.log(`\n${'─'.repeat(50)}`)
  console.log(`Results: ${passed} passed, ${failed} failed`)
  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
