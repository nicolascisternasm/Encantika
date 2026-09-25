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
