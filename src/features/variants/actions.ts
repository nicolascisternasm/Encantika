'use server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type ActionState = { error?: string; success?: string }

// ── Existing action (keep for /variantes sub-page) ────────────────────────────

export async function updateVariante(id: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const sku = (formData.get('sku') as string)?.trim()
  const precio = Number(formData.get('precio'))
  const activo = formData.get('activo') === 'true'
  const productoId = formData.get('producto_id') as string

  if (!sku) return { error: 'El SKU es requerido' }
  if (isNaN(precio) || precio < 0) return { error: 'El precio es inválido' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('variantes_producto')
    .update({ sku, precio, activo })
    .eq('id', id)
  if (error) {
    if (error.code === '23505') return { error: 'El SKU ya existe' }
    return { error: 'Error al actualizar la variante' }
  }
  revalidatePath(`/administracion/productos/${productoId}/variantes`)
  return { success: 'Variante actualizada' }
}

// ── Generate: attribute-based combinations (used by VariantManager) ───────────

export async function generateVariantesV2(
  productoId: string,
  productoSlug: string,
  atributoIds: string[],
  precioBase: number
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const admin = createAdminClient()

  // 1. Update product-attribute assignments
  await admin.from('producto_atributos').delete().eq('producto_id', productoId)
  if (atributoIds.length > 0) {
    await admin.from('producto_atributos').insert(
      atributoIds.map(id => ({ producto_id: productoId, atributo_id: id }))
    )
  }

  // 2. Deactivate all existing variants (preserves stock history)
  await admin.from('variantes_producto').update({ activo: false }).eq('producto_id', productoId)

  // 3. No attributes → one "Estándar" variant
  if (atributoIds.length === 0) {
    const stdSku = `${productoSlug}-std`
    const { data: existing } = await admin
      .from('variantes_producto')
      .select('id')
      .eq('producto_id', productoId)
      .eq('sku', stdSku)
      .maybeSingle()

    if (existing) {
      await admin.from('variantes_producto').update({ activo: true }).eq('id', existing.id)
    } else {
      await admin.from('variantes_producto').insert({
        producto_id: productoId, sku: stdSku, precio: precioBase, activo: true,
      })
    }
    revalidatePath(`/administracion/productos/${productoId}`)
    return { success: 'Variante estándar generada' }
  }

  // 4. Fetch active values for selected attributes
  const { data: valores } = await admin
    .from('valores_atributo')
    .select('id, slug, valor, atributo_id')
    .in('atributo_id', atributoIds)
    .eq('activo', true)
    .order('orden')

  if (!valores || valores.length === 0) {
    return { error: 'Los atributos seleccionados no tienen valores activos' }
  }

  // 5. Cartesian product of values grouped by attribute
  const grouped: Record<string, typeof valores> = {}
  for (const val of valores) {
    if (!grouped[val.atributo_id]) grouped[val.atributo_id] = []
    grouped[val.atributo_id].push(val)
  }

  const combinations: string[][] = Object.values(grouped).reduce<string[][]>(
    (acc, group) => {
      if (acc.length === 0) return group.map(v => [v.id])
      return acc.flatMap(combo => group.map(v => [...combo, v.id]))
    },
    []
  )

  // 6. Create or reactivate one variant per combination
  let created = 0
  let reactivated = 0

  for (const combo of combinations) {
    const slugParts = combo.map(vid => valores.find(v => v.id === vid)?.slug ?? vid)
    const sku = `${productoSlug}-${slugParts.join('-')}`

    const { data: existing } = await admin
      .from('variantes_producto')
      .select('id')
      .eq('producto_id', productoId)
      .eq('sku', sku)
      .maybeSingle()

    if (existing) {
      await admin.from('variantes_producto').update({ activo: true }).eq('id', existing.id)
      reactivated++
    } else {
      const { data: v } = await admin
        .from('variantes_producto')
        .insert({ producto_id: productoId, sku, precio: precioBase, activo: true })
        .select('id')
        .single()

      if (v) {
        await admin.from('variante_valores_atributo').insert(
          combo.map(vid => ({ variante_id: (v as any).id, valor_atributo_id: vid }))
        )
        created++
      }
    }
  }

  revalidatePath(`/administracion/productos/${productoId}`)
  const msg = [
    created > 0 ? `${created} nueva${created !== 1 ? 's' : ''}` : '',
    reactivated > 0 ? `${reactivated} reactivada${reactivated !== 1 ? 's' : ''}` : '',
  ].filter(Boolean).join(', ')
  return { success: `Variantes: ${msg || 'sin cambios'}` }
}

// ── Batch upsert existing variants (used by VariantManager) ──────────────────

export async function upsertVariantes(
  productoId: string,
  variantes: Array<{
    id: string
    sku: string
    precio: number
    activo: boolean
    permite_a_pedido: boolean
  }>
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const admin = createAdminClient()

  const results = await Promise.all(
    variantes.map(v =>
      admin
        .from('variantes_producto')
        .update({ sku: v.sku, precio: v.precio, activo: v.activo, permite_a_pedido: v.permite_a_pedido })
        .eq('id', v.id)
        .eq('producto_id', productoId)
    )
  )

  const firstError = results.find(r => r.error)?.error
  if (firstError) {
    if (firstError.code === '23505') return { error: 'Hay SKUs duplicados' }
    return { error: 'Error al guardar las variantes' }
  }

  revalidatePath(`/administracion/productos/${productoId}`)
  return { success: 'Variantes guardadas' }
}

// ── Legacy: kept for /variantes sub-page ─────────────────────────────────────

export async function generateVariantes(productoId: string, atributoIds: string[]): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  if (atributoIds.length === 0) return { error: 'No hay atributos seleccionados' }

  const admin = createAdminClient()

  const { data: valores } = await admin
    .from('valores_atributo')
    .select('id, slug, atributo_id')
    .in('atributo_id', atributoIds)
    .eq('activo', true)
    .order('orden')

  if (!valores || valores.length === 0) {
    return { error: 'No hay valores de atributo activos configurados' }
  }

  const grouped: Record<string, typeof valores> = {}
  for (const val of valores) {
    if (!grouped[val.atributo_id]) grouped[val.atributo_id] = []
    grouped[val.atributo_id].push(val)
  }

  const combinations: string[][] = Object.values(grouped).reduce<string[][]>(
    (acc, group) => {
      if (acc.length === 0) return group.map(v => [v.id])
      return acc.flatMap(combo => group.map(v => [...combo, v.id]))
    },
    []
  )

  const { data: existing } = await admin
    .from('variantes_producto')
    .select('sku')
    .eq('producto_id', productoId)

  const existingSkus = new Set(existing?.map(v => v.sku) ?? [])

  let created = 0
  for (const combo of combinations) {
    const slugParts = combo.map(vid => valores.find(v => v.id === vid)?.slug ?? vid)
    const sku = `${productoId.slice(0, 8)}-${slugParts.join('-')}`
    if (existingSkus.has(sku)) continue

    const { data: variante } = await admin
      .from('variantes_producto')
      .insert({ producto_id: productoId, sku, precio: 0, activo: true })
      .select('id')
      .single()

    if (variante) {
      await admin.from('variante_valores_atributo').insert(
        combo.map(valor_atributo_id => ({ variante_id: (variante as any).id, valor_atributo_id }))
      )
      created++
    }
  }

  revalidatePath(`/administracion/productos/${productoId}/variantes`)
  return { success: `Se generaron ${created} variante${created !== 1 ? 's' : ''} nuevas` }
}
