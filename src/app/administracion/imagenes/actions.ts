'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type ActionState = { error?: string; success?: string }

export async function guardarMetadatosImagen(data: {
  nombre: string
  storagePath: string
  url: string
  ancho: number
  alto: number
  tamanoBytess?: number
}): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('imagenes_sitio')
    .insert({
      nombre: data.nombre,
      storage_path: data.storagePath,
      url: data.url,
      ancho: data.ancho,
      alto: data.alto,
      tamano_bytes: data.tamanoBytess ?? null,
    })

  if (error) return { error: `Error al guardar: ${error.message}` }

  revalidatePath('/administracion/imagenes')
  return { success: 'Imagen subida correctamente' }
}

export async function eliminarImagenSitio(id: string, storagePath: string): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const admin = createAdminClient()

  const { error: storageErr } = await admin.storage
    .from('imagenes-sitio')
    .remove([storagePath])

  if (storageErr) return { error: `Error al eliminar archivo: ${storageErr.message}` }

  const { error } = await admin
    .from('imagenes_sitio')
    .delete()
    .eq('id', id)

  if (error) return { error: `Error al eliminar registro: ${error.message}` }

  revalidatePath('/administracion/imagenes')
  revalidatePath('/administracion/diseno')
  return { success: 'Imagen eliminada' }
}
