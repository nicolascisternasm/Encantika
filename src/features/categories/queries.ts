import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/database'

export type CategoriaRow = Tables<'categorias'>

export async function getCategorias() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('orden', { ascending: true })
  if (error) throw error
  return data ?? []
}
