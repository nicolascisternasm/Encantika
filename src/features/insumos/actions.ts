'use server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type ActionState = { error?: string; success?: string }

// ── Crear insumo ───────────────────────────────────────────────────────────────

export async function createInsumo(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const nombre = (formData.get('nombre') as string)?.trim()
  const descripcion = (formData.get('descripcion') as string)?.trim() || null
  const unidad = (formData.get('unidad') as string) || 'unidad'

  if (!nombre) return { error: 'El nombre es requerido' }

  const UNIDADES = ['unidad', 'metro', 'gramo', 'ml']
  if (!UNIDADES.includes(unidad)) return { error: 'Unidad inválida' }

  const admin = createAdminClient()
  const { error } = await admin.from('insumos').insert({ nombre, descripcion, unidad })
  if (error) return { error: 'Error al crear el insumo' }

  revalidatePath('/administracion/insumos')
  return { success: 'Insumo creado' }
}

// ── Registrar movimiento de insumo ─────────────────────────────────────────────

export async function registrarEntradaInsumo(
  insumoId: string,
  cantidad: number,
  nota?: string
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  if (!cantidad || cantidad <= 0) return { error: 'La cantidad debe ser mayor a 0' }

  const admin = createAdminClient()
  const { error } = await admin.from('movimientos_insumos').insert({
    insumo_id: insumoId,
    cantidad,
    tipo: 'compra',
    creado_por: user.id,
    nota: nota || null,
  })

  if (error) return { error: 'Error al registrar la entrada' }

  revalidatePath('/administracion/insumos')
  return { success: `Entrada de ${cantidad} u. registrada` }
}

// ── Gestión de insumos en un producto (referencial) ────────────────────────────

export async function upsertProductoInsumo(
  productoId: string,
  insumoId: string,
  cantidadPorUnidad: number,
  nota?: string
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  if (cantidadPorUnidad <= 0) return { error: 'La cantidad debe ser mayor a 0' }

  const admin = createAdminClient()
  const { error } = await admin.from('producto_insumos').upsert({
    producto_id: productoId,
    insumo_id: insumoId,
    cantidad_por_unidad: cantidadPorUnidad,
    nota: nota || null,
  })

  if (error) return { error: 'Error al asociar el insumo' }

  revalidatePath(`/administracion/productos/${productoId}`)
  return { success: 'Insumo asociado al producto' }
}

export async function deleteProductoInsumo(
  productoId: string,
  insumoId: string
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('producto_insumos')
    .delete()
    .eq('producto_id', productoId)
    .eq('insumo_id', insumoId)

  if (error) return { error: 'Error al quitar el insumo' }

  revalidatePath(`/administracion/productos/${productoId}`)
  return { success: 'Insumo quitado del producto' }
}
