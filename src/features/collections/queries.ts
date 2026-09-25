import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/database'

export type ColeccionRow = Tables<'colecciones'>

export async function getColecciones() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('colecciones')
    .select('*')
    .order('orden', { ascending: true })
  if (error) throw error
  return data ?? []
}
