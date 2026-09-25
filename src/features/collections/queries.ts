import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type ColeccionConCount = {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  url_imagen: string | null
  activo: boolean
  orden: number
  creado_en: string
  _count: number
}

export async function getColecciones(): Promise<ColeccionConCount[]> {
  const admin = createAdminClient()
  const { data: colecciones, error } = await admin
    .from('colecciones')
    .select('id, nombre, slug, descripcion, url_imagen, activo, orden, creado_en')
    .order('orden', { ascending: true })
  if (error) throw error

  const { data: pcs } = await admin
    .from('producto_colecciones')
    .select('coleccion_id')

  const counts = new Map<string, number>()
  for (const pc of pcs ?? []) {
    counts.set(pc.coleccion_id, (counts.get(pc.coleccion_id) ?? 0) + 1)
  }

  return (colecciones ?? []).map(c => ({ ...c, _count: counts.get(c.id) ?? 0 }))
}

export async function getColeccionesActivas(): Promise<ColeccionConCount[]> {
  const supabase = await createClient()
  const { data: colecciones, error } = await supabase
    .from('colecciones')
    .select('id, nombre, slug, descripcion, url_imagen, activo, orden, creado_en')
    .eq('activo', true)
    .order('orden', { ascending: true })
  if (error) throw error

  const { data: allPcs } = await supabase
    .from('producto_colecciones')
    .select('coleccion_id, productos(estado)')

  const counts = new Map<string, number>()
  for (const pc of allPcs ?? []) {
    if ((pc.productos as { estado: string } | null)?.estado === 'activo') {
      counts.set(pc.coleccion_id, (counts.get(pc.coleccion_id) ?? 0) + 1)
    }
  }

  return (colecciones ?? []).map(c => ({ ...c, _count: counts.get(c.id) ?? 0 }))
}

export async function getColeccionBySlug(slug: string): Promise<ColeccionConCount | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('colecciones')
    .select('id, nombre, slug, descripcion, url_imagen, activo, orden, creado_en')
    .eq('slug', slug)
    .eq('activo', true)
    .single()
  if (error || !data) return null
  return { ...data, _count: 0 }
}
