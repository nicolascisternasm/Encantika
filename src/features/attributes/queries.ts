import 'server-only'
import { createClient } from '@/lib/supabase/server'

export async function getAtributos() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('atributos')
    .select('*, valores_atributo(*)')
    .order('orden', { ascending: true })
  if (error) throw error
  return data ?? []
}
