'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/utils'

export type ActionState = { error?: string; success?: string }

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
})

export async function createCategoria(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const parsed = schema.safeParse({ nombre: formData.get('nombre') })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { nombre } = parsed.data
  const slug = generateSlug(nombre)
  const admin = createAdminClient()
  const { error } = await admin.from('categorias').insert({ nombre, slug, activo: true })
  if (error) return { error: 'Error al crear la categoría' }
  revalidatePath('/administracion/categorias')
  return { success: 'Categoría creada exitosamente' }
}

export async function toggleCategoria(id: string, activo: boolean): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const admin = createAdminClient()
  const { error } = await admin.from('categorias').update({ activo }).eq('id', id)
  if (error) return { error: 'Error al actualizar la categoría' }
  revalidatePath('/administracion/categorias')
  return { success: 'Categoría actualizada' }
}

export async function updateCategoria(id: string, nombre: string): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const trimmed = nombre.trim()
  if (!trimmed) return { error: 'El nombre no puede estar vacío' }

  const slug = generateSlug(trimmed)
  const admin = createAdminClient()
  const { error } = await admin.from('categorias').update({ nombre: trimmed, slug }).eq('id', id)
  if (error) return { error: 'Error al actualizar la categoría' }
  revalidatePath('/administracion/categorias')
  return { success: 'Categoría actualizada' }
}

export async function deleteCategoria(id: string): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const admin = createAdminClient()
  const { error } = await admin.from('categorias').delete().eq('id', id)
  if (error) return { error: 'Error al eliminar la categoría' }
  revalidatePath('/administracion/categorias')
  return { success: 'Categoría eliminada' }
}
