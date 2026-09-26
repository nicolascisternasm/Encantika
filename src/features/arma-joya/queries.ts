import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { TipoJoya, TipoComponente, Componente } from './types'

export async function getTiposJoyaActivos(): Promise<TipoJoya[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tipos_joya')
    .select('id, slug, nombre, icono_svg, descripcion')
    .eq('activo', true)
    .order('orden')
  if (error) throw error
  return (data ?? []) as TipoJoya[]
}

export async function getComponentesPorTipoJoya(tipoJoyaSlug: string): Promise<{
  tiposComponente: TipoComponente[]
  componentes: Componente[]
}> {
  const supabase = await createClient()

  const { data: tiposComp } = await supabase
    .from('tipo_componentes')
    .select('id, slug, nombre, orden_configurador, es_obligatorio, tipos_joya_aplicables')
    .contains('tipos_joya_aplicables', [tipoJoyaSlug])
    .order('orden_configurador')

  if (!tiposComp || tiposComp.length === 0) {
    return { tiposComponente: [], componentes: [] }
  }

  const tiposIds = tiposComp.map((t) => t.id)

  const { data: comps } = await supabase
    .from('componentes')
    .select(`
      id, sku, nombre, descripcion, tipo_componente_id,
      material, color, precio, stock,
      url_imagen, url_imagen_capa,
      color_primario, color_secundario, color_acento,
      estilo_energia, intensidad, textura, estilo_particulas,
      desc_holistica, tradicion, orden,
      tipo_componentes!inner(slug)
    `)
    .in('tipo_componente_id', tiposIds)
    .eq('activo', true)
    .gt('stock', 0)
    .order('orden')

  const componentes = (comps ?? []).map((c) => {
    const { tipo_componentes, ...rest } = c as typeof c & { tipo_componentes: { slug: string } }
    return { ...rest, tipo_componente_slug: tipo_componentes.slug } as Componente
  })

  return {
    tiposComponente: tiposComp as TipoComponente[],
    componentes,
  }
}
