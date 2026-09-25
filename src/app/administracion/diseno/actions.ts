'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { TEMAS, FUENTES } from '@/lib/temas'

export type ActionState = { error?: string; success?: string }

export async function guardarDiseno(tema: string, fuente: string): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  if (!Object.keys(TEMAS).includes(tema)) return { error: 'Tema inválido' }
  if (!Object.keys(FUENTES).includes(fuente)) return { error: 'Fuente inválida' }

  const admin = createAdminClient()

  const { data: config } = await admin
    .from('configuracion_tienda')
    .select('id')
    .limit(1)
    .single()

  if (!config) return { error: 'No se encontró la configuración de la tienda' }

  const { error } = await admin
    .from('configuracion_tienda')
    .update({ tema, fuente_titulos: fuente })
    .eq('id', config.id)

  if (error) return { error: `Error al guardar: ${error.message}` }

  revalidatePath('/', 'layout')

  return { success: 'Diseño actualizado. Los cambios son visibles en la tienda.' }
}
