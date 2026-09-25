import PageHeader from '@/components/admin/PageHeader'
import InventarioTable from './InventarioTable'
import { createClient } from '@/lib/supabase/server'

export default async function InventarioPage() {
  const supabase = await createClient()

  // All non-archived products
  const { data: productosRaw } = await supabase
    .from('productos')
    .select(`
      id, nombre, slug, estado, precio_base, tipo_producto,
      categorias(nombre),
      imagenes_producto(ruta_almacenamiento, orden)
    `)
    .neq('estado', 'archivado')
    .order('nombre')

  const productos = productosRaw ?? []
  const productoIds = productos.map(p => p.id)

  // Active variants for all products (for stock lookup)
  const { data: variantes } = productoIds.length > 0
    ? await supabase
        .from('variantes_producto')
        .select('id, producto_id, activo')
        .in('producto_id', productoIds)
        .eq('activo', true)
    : { data: [] }

  const varianteIds = (variantes ?? []).map(v => v.id)

  const { data: stocks } = varianteIds.length > 0
    ? await supabase.from('stock_variantes').select('variante_id, stock').in('variante_id', varianteIds)
    : { data: [] as { variante_id: string | null; stock: number | null }[] }

  // Compute total stock per product
  const stockByVariante = new Map((stocks ?? []).map(s => [s.variante_id!, s.stock ?? 0]))
  const variantesByProducto = new Map<string, string[]>()
  for (const v of (variantes ?? [])) {
    if (!variantesByProducto.has(v.producto_id)) variantesByProducto.set(v.producto_id, [])
    variantesByProducto.get(v.producto_id)!.push(v.id)
  }

  const rows = productos.map(p => {
    const vIds = variantesByProducto.get(p.id) ?? []
    const stock = vIds.reduce((sum, vid) => sum + (stockByVariante.get(vid) ?? 0), 0)
    const imgs = (p.imagenes_producto ?? []) as { ruta_almacenamiento: string; orden: number }[]
    const imagen = imgs.find(i => i.orden === 0)?.ruta_almacenamiento ?? imgs[0]?.ruta_almacenamiento ?? null

    return {
      id: p.id,
      nombre: p.nombre,
      slug: p.slug,
      estado: p.estado,
      precio_base: p.precio_base,
      tipo_producto: (p as any).tipo_producto as string ?? 'terminado',
      stock,
      imagen,
      categoria: (p.categorias as any)?.nombre as string | null ?? null,
    }
  })

  const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}/storage/v1/object/public/imagenes-productos`
  const totalEnStock = rows.filter(p => p.stock > 0).length
  const sinStock = rows.filter(p => p.stock === 0).length

  return (
    <div>
      <PageHeader
        title="Inventario"
        description={`${totalEnStock} producto${totalEnStock !== 1 ? 's' : ''} con stock · ${sinStock} sin stock`}
      />
      <InventarioTable productos={rows} storageUrl={storageUrl} />
    </div>
  )
}
