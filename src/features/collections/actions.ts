'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type ActionState = { error?: string; success?: string; id?: string }

const coleccionSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido').regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  descripcion: z.string().optional(),
  activo: z.boolean(),
  orden: z.number().int().min(0, 'El orden debe ser 0 o mayor'),
})

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function crearColeccion(data: {
  nombre: string
  slug: string
  descripcion?: string
  activo: boolean
  orden: number
}): Promise<ActionState> {
  const user = await getAuthUser()
  if (!user) return { error: 'No autorizado' }

  const parsed = coleccionSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const { data: created, error } = await admin
    .from('colecciones')
    .insert({
      nombre: parsed.data.nombre,
      slug: parsed.data.slug,
      descripcion: parsed.data.descripcion || null,
      activo: parsed.data.activo,
      orden: parsed.data.orden,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'Ya existe una colección con ese slug' }
    return { error: 'Error al crear la colección' }
  }

  revalidatePath('/administracion/colecciones')
  revalidatePath('/colecciones', 'layout')
  return { success: 'Colección creada exitosamente', id: created.id }
}

export async function actualizarColeccion(
  id: string,
  data: { nombre: string; slug: string; descripcion?: string; activo: boolean; orden: number }
): Promise<ActionState> {
  const user = await getAuthUser()
  if (!user) return { error: 'No autorizado' }

  const parsed = coleccionSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const { error } = await admin
    .from('colecciones')
    .update({
      nombre: parsed.data.nombre,
      slug: parsed.data.slug,
      descripcion: parsed.data.descripcion || null,
      activo: parsed.data.activo,
      orden: parsed.data.orden,
    })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') return { error: 'Ya existe una colección con ese slug' }
    return { error: 'Error al actualizar la colección' }
  }

  revalidatePath('/administracion/colecciones')
  revalidatePath('/colecciones', 'layout')
  return { success: 'Colección actualizada' }
}

export async function eliminarColeccion(id: string): Promise<ActionState> {
  const user = await getAuthUser()
  if (!user) return { error: 'No autorizado' }

  const admin = createAdminClient()
  const { count } = await admin
    .from('producto_colecciones')
    .select('*', { count: 'exact', head: true })
    .eq('coleccion_id', id)

  if (count && count > 0) {
    return { error: `No se puede eliminar: tiene ${count} producto(s) asociado(s)` }
  }

  const { data: coleccion } = await admin
    .from('colecciones')
    .select('url_imagen')
    .eq('id', id)
    .single()

  const { error } = await admin.from('colecciones').delete().eq('id', id)
  if (error) return { error: 'Error al eliminar la colección' }

  if (coleccion?.url_imagen) {
    const storagePath = coleccion.url_imagen.split('/imagenes-productos/')[1]
    if (storagePath) {
      await admin.storage.from('imagenes-productos').remove([storagePath])
    }
  }

  revalidatePath('/administracion/colecciones')
  revalidatePath('/colecciones', 'layout')
  return { success: 'Colección eliminada' }
}

export async function guardarImagenColeccion(id: string, urlImagen: string): Promise<ActionState> {
  const user = await getAuthUser()
  if (!user) return { error: 'No autorizado' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('colecciones')
    .update({ url_imagen: urlImagen })
    .eq('id', id)

  if (error) return { error: 'Error al guardar la imagen' }

  revalidatePath('/administracion/colecciones')
  revalidatePath('/colecciones', 'layout')
  return { success: 'Imagen guardada' }
}

export async function eliminarImagenColeccion(id: string, storagePath: string): Promise<ActionState> {
  const user = await getAuthUser()
  if (!user) return { error: 'No autorizado' }

  const admin = createAdminClient()
  await admin.storage.from('imagenes-productos').remove([storagePath])

  const { error } = await admin
    .from('colecciones')
    .update({ url_imagen: null })
    .eq('id', id)

  if (error) return { error: 'Error al eliminar la imagen' }

  revalidatePath('/administracion/colecciones')
  revalidatePath('/colecciones', 'layout')
  return { success: 'Imagen eliminada' }
}

export async function toggleColeccion(id: string, activo: boolean): Promise<ActionState> {
  const user = await getAuthUser()
  if (!user) return { error: 'No autorizado' }

  const admin = createAdminClient()
  const { error } = await admin.from('colecciones').update({ activo }).eq('id', id)
  if (error) return { error: 'Error al actualizar la colección' }

  revalidatePath('/administracion/colecciones')
  revalidatePath('/colecciones', 'layout')
  return { success: 'Colección actualizada' }
}

export async function actualizarProductoColecciones(
  productoId: string,
  coleccionIds: string[]
): Promise<ActionState> {
  const user = await getAuthUser()
  if (!user) return { error: 'No autorizado' }

  const admin = createAdminClient()
  const { error: deleteError } = await admin
    .from('producto_colecciones')
    .delete()
    .eq('producto_id', productoId)

  if (deleteError) return { error: 'Error al actualizar las colecciones' }

  if (coleccionIds.length > 0) {
    const { error: insertError } = await admin
      .from('producto_colecciones')
      .insert(coleccionIds.map(coleccionId => ({ producto_id: productoId, coleccion_id: coleccionId })))

    if (insertError) return { error: 'Error al guardar las colecciones' }
  }

  revalidatePath('/administracion/productos')
  revalidatePath(`/administracion/productos/${productoId}`)
  revalidatePath('/colecciones', 'layout')
  return { success: 'Colecciones actualizadas' }
}
