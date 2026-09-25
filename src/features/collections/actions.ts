'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/utils'

export type ActionState = { error?: string; success?: string }

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
})

export async function createColeccion(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const parsed = schema.safeParse({
    nombre: formData.get('nombre'),
    descripcion: (formData.get('descripcion') as string) || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { nombre, descripcion } = parsed.data
  const slug = generateSlug(nombre)
  const admin = createAdminClient()
  const { error } = await admin.from('colecciones').insert({ nombre, slug, descripcion, activo: true })
  if (error) return { error: 'Error al crear la colección' }
  revalidatePath('/administracion/colecciones')
  return { success: 'Colección creada exitosamente' }
}

export async function toggleColeccion(id: string, activo: boolean): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const admin = createAdminClient()
  const { error } = await admin.from('colecciones').update({ activo }).eq('id', id)
  if (error) return { error: 'Error al actualizar la colección' }
  revalidatePath('/administracion/colecciones')
  return { success: 'Colección actualizada' }
}
