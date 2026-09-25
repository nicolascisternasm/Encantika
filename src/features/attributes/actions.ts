'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/utils'

export type ActionState = { error?: string; success?: string }

const atributoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  codigo: z.string().min(1, 'El código es requerido'),
})

const valorSchema = z.object({
  valor: z.string().min(1, 'El valor es requerido'),
  atributo_id: z.string().uuid('El atributo es inválido'),
  color_hex: z.string().nullable().optional(),
})

export async function createAtributo(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const parsed = atributoSchema.safeParse({
    nombre: formData.get('nombre'),
    codigo: formData.get('codigo'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const { error } = await admin.from('atributos').insert(parsed.data)
  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un atributo con ese código' }
    return { error: 'Error al crear el atributo' }
  }
  revalidatePath('/administracion/atributos')
  return { success: 'Atributo creado exitosamente' }
}

export async function createValorAtributo(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const rawColor = formData.get('color_hex') as string
  const parsed = valorSchema.safeParse({
    valor: formData.get('valor'),
    atributo_id: formData.get('atributo_id'),
    color_hex: rawColor && rawColor !== '#000000' ? rawColor : null,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { valor, atributo_id, color_hex } = parsed.data
  const slug = generateSlug(valor)
  const admin = createAdminClient()
  const { error } = await admin.from('valores_atributo').insert({
    valor,
    slug,
    atributo_id,
    color_hex: color_hex ?? null,
    activo: true,
  })
  if (error) return { error: 'Error al crear el valor' }
  revalidatePath('/administracion/atributos')
  return { success: 'Valor creado exitosamente' }
}

export async function updateAtributo(id: string, data: { nombre: string; codigo: string }): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const nombre = data.nombre.trim()
  const codigo = data.codigo.trim()
  if (!nombre) return { error: 'El nombre es requerido' }
  if (!codigo) return { error: 'El código es requerido' }

  const admin = createAdminClient()
  const { error } = await admin.from('atributos').update({ nombre, codigo }).eq('id', id)
  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un atributo con ese código' }
    return { error: 'Error al actualizar el atributo' }
  }
  revalidatePath('/administracion/atributos')
  return { success: 'Atributo actualizado' }
}

export async function updateValorAtributo(id: string, data: { valor: string; color_hex: string | null }): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const valor = data.valor.trim()
  if (!valor) return { error: 'El valor es requerido' }
  const slug = generateSlug(valor)

  const admin = createAdminClient()
  const { error } = await admin.from('valores_atributo').update({ valor, slug, color_hex: data.color_hex }).eq('id', id)
  if (error) return { error: 'Error al actualizar el valor' }
  revalidatePath('/administracion/atributos')
  return { success: 'Valor actualizado' }
}

export async function toggleValorAtributo(id: string, activo: boolean): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const admin = createAdminClient()
  const { error } = await admin.from('valores_atributo').update({ activo }).eq('id', id)
  if (error) return { error: 'Error al cambiar el estado' }
  revalidatePath('/administracion/atributos')
  return { success: activo ? 'Valor activado' : 'Valor desactivado' }
}

export async function deleteValorAtributo(id: string): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const admin = createAdminClient()
  const { count } = await admin
    .from('variante_valores_atributo')
    .select('*', { count: 'exact', head: true })
    .eq('valor_atributo_id', id)

  if (count && count > 0) {
    return { error: `Este valor está en uso por ${count} variante${count !== 1 ? 's' : ''} y no puede eliminarse` }
  }

  const { error } = await admin.from('valores_atributo').delete().eq('id', id)
  if (error) return { error: 'Error al eliminar el valor' }
  revalidatePath('/administracion/atributos')
  return { success: 'Valor eliminado' }
}
