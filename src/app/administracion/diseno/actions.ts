'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { TEMAS, FUENTES } from '@/lib/temas'
import { LAYOUTS } from '@/lib/layouts'
import type { ImagenSitio } from '../imagenes/ImagenesManager'

export type ActionState = { error?: string; success?: string }

export async function guardarDiseno(tema: string, fuente: string, layout: string): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  if (!Object.keys(TEMAS).includes(tema)) return { error: 'Tema inválido' }
  if (!Object.keys(FUENTES).includes(fuente)) return { error: 'Fuente inválida' }
  if (!Object.keys(LAYOUTS).includes(layout)) return { error: 'Layout inválido' }

  const admin = createAdminClient()

  const { data: config } = await admin
    .from('configuracion_tienda')
    .select('id')
    .limit(1)
    .single()

  if (!config) return { error: 'No se encontró la configuración de la tienda' }

  const { error } = await admin
    .from('configuracion_tienda')
    .update({ tema, fuente_titulos: fuente, layout })
    .eq('id', config.id)

  if (error) return { error: `Error al guardar: ${error.message}` }

  revalidatePath('/', 'layout')

  return { success: 'Diseño actualizado. Los cambios son visibles en la tienda.' }
}

export async function guardarSecciones(data: {
  heroImagenId: string | null
  heroPosicion: string
  bannerJoyaImagenId: string | null
  bannerJoyaPosicion: string
  historiaImagenId: string | null
  historiaPosicion: string
}): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const posicionesValidas = [
    'top left', 'top center', 'top right',
    'center left', 'center center', 'center right',
    'bottom left', 'bottom center', 'bottom right',
  ]
  if (!posicionesValidas.includes(data.heroPosicion)) return { error: 'Posición del hero inválida' }
  if (!posicionesValidas.includes(data.bannerJoyaPosicion)) return { error: 'Posición del banner inválida' }
  if (!posicionesValidas.includes(data.historiaPosicion)) return { error: 'Posición de historia inválida' }

  const admin = createAdminClient()

  const { data: config } = await admin
    .from('configuracion_tienda')
    .select('id')
    .limit(1)
    .single()

  if (!config) return { error: 'No se encontró la configuración de la tienda' }

  const { error } = await admin
    .from('configuracion_tienda')
    .update({
      hero_imagen_id: data.heroImagenId,
      hero_posicion: data.heroPosicion,
      banner_joya_imagen_id: data.bannerJoyaImagenId,
      banner_joya_posicion: data.bannerJoyaPosicion,
      historia_imagen_id: data.historiaImagenId,
      historia_posicion: data.historiaPosicion,
    })
    .eq('id', config.id)

  if (error) return { error: `Error al guardar: ${error.message}` }

  revalidatePath('/', 'layout')

  return { success: 'Secciones actualizadas. Los cambios son visibles en la tienda.' }
}

export async function obtenerImagenesSitio(): Promise<ImagenSitio[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const admin = createAdminClient()
  const { data } = await admin
    .from('imagenes_sitio')
    .select('*')
    .order('creado_en', { ascending: false })

  return (data ?? []) as ImagenSitio[]
}
