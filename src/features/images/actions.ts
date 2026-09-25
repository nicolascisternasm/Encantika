'use server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type ActionState = { error?: string; success?: string }

export async function deleteImagen(id: string, productoId: string, ruta: string): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const admin = createAdminClient()
  await admin.storage.from('imagenes-productos').remove([ruta])

  const { error } = await admin.from('imagenes_producto').delete().eq('id', id)
  if (error) return { error: 'Error al eliminar la imagen' }

  revalidatePath(`/administracion/productos/${productoId}/imagenes`)
  return { success: 'Imagen eliminada' }
}

export async function reorderImages(productoId: string, orderedIds: string[]): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const admin = createAdminClient()
  await Promise.all(
    orderedIds.map((id, index) =>
      admin.from('imagenes_producto').update({ orden: index }).eq('id', id)
    )
  )

  revalidatePath(`/administracion/productos/${productoId}/imagenes`)
  return { success: 'Orden actualizado' }
}
