import 'server-only'
import { createClient } from '@/lib/supabase/server'

export async function getProductos() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('productos')
    .select(`
      id,
      nombre,
      slug,
      estado,
      precio_base,
      destacado,
      creado_en,
      categorias(nombre),
      imagenes_producto(id, ruta_almacenamiento, orden),
      producto_colecciones(colecciones(id, nombre))
    `)
    .order('creado_en', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getProducto(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('productos')
    .select(`
      *,
      categorias(id, nombre),
      producto_atributos(atributo_id, atributos(id, nombre, codigo, valores_atributo(*))),
      variantes_producto(*, variante_valores_atributo(*, valores_atributo(*))),
      producto_colecciones(coleccion_id, colecciones(id, nombre))
    `)
    .eq('id', id)
    .single()
  if (error) return null
  return data
}
