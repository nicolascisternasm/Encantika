'use server'

import { revalidatePath } from 'next/cache'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { createClient } from '@/lib/supabase/server'

export type ConfigArmaJoya = {
  mostrar_precio: boolean
  mostrar_descripcion: boolean
}

export async function getConfigArmaJoya(): Promise<ConfigArmaJoya> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('configuracion_arma_joya')
    .select('mostrar_precio, mostrar_descripcion')
    .single()
  return (data as ConfigArmaJoya | null) ?? { mostrar_precio: true, mostrar_descripcion: false }
}

export async function guardarConfigArmaJoya(config: ConfigArmaJoya) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: existing } = await db
    .from('configuracion_arma_joya')
    .select('id')
    .single()
  if (!existing) return
  await db
    .from('configuracion_arma_joya')
    .update({ ...config, actualizado_en: new Date().toISOString() })
    .eq('id', existing.id)
  revalidatePath('/administracion/arma-joya/configuracion')
}
