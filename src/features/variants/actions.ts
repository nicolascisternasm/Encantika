'use server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type ActionState = { error?: string; success?: string }

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

  const groups = Object.values(grouped)
  const combinations: string[][] = groups.reduce<string[][]>(
    (acc, group) => {
      if (acc.length === 0) return group.map((v) => [v.id])
      return acc.flatMap((combo) => group.map((v) => [...combo, v.id]))
    },
    []
  )

  const { data: existing } = await admin
    .from('variantes_producto')
    .select('sku')
    .eq('producto_id', productoId)

  const existingSkus = new Set(existing?.map((v) => v.sku) ?? [])

  let created = 0
  for (const combo of combinations) {
    const slugParts = combo.map((valId) => valores.find((v) => v.id === valId)?.slug ?? valId)
    const sku = `${productoId.slice(0, 8)}-${slugParts.join('-')}`
    if (existingSkus.has(sku)) continue

    const { data: variante } = await admin
      .from('variantes_producto')
      .insert({ producto_id: productoId, sku, precio: 0, activo: true })
      .select('id')
      .single()

    if (variante) {
      await admin.from('variante_valores_atributo').insert(
        combo.map((valor_atributo_id) => ({ variante_id: (variante as any).id, valor_atributo_id }))
      )
      created++
    }
  }

  revalidatePath(`/administracion/productos/${productoId}/variantes`)
  return { success: `Se generaron ${created} variante${created !== 1 ? 's' : ''} nuevas` }
}
