import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getColeccionBySlug } from '@/features/collections/queries'
import { createClient } from '@/lib/supabase/server'
import { formatCLP } from '@/lib/utils'

export default async function ColeccionSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const coleccion = await getColeccionBySlug(slug)
  if (!coleccion) notFound()

  const supabase = await createClient()

  const { data: pcs } = await supabase
    .from('producto_colecciones')
    .select('producto_id')
    .eq('coleccion_id', coleccion.id)

  const productIds = (pcs ?? []).map(pc => pc.producto_id)

  const { data: productos } = productIds.length > 0
    ? await supabase
        .from('productos')
        .select(`
          id, nombre, slug, precio_base,
          imagenes_producto(ruta_almacenamiento, orden),
          variantes_producto(precio, activo)
        `)
        .eq('estado', 'activo')
        .in('id', productIds)
        .order('nombre')
    : { data: [] as never[] }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  function getMainImage(imgs: { ruta_almacenamiento: string; orden: number }[] | null) {
    if (!imgs || imgs.length === 0) return null
    const sorted = [...imgs].sort((a, b) => a.orden - b.orden)
    return `${supabaseUrl}/storage/v1/object/public/imagenes-productos/${sorted[0].ruta_almacenamiento}`
  }

  return (
    <main className="min-h-screen bg-ivory">
      {/* Header */}
      <section className="relative border-b border-sand">
        {coleccion.url_imagen ? (
          <div className="relative h-48 overflow-hidden">
            <img
              src={coleccion.url_imagen}
              alt={coleccion.nombre}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 text-center">
              <p className="text-xs tracking-widest uppercase mb-2">
                <Link href="/colecciones" className="hover:underline opacity-75">Colecciones</Link>
                {' → '}
                {coleccion.nombre}
              </p>
              <h1 className="font-display text-5xl font-light tracking-[0.15em]">
                {coleccion.nombre}
              </h1>
              {coleccion.descripcion && (
                <p className="mt-2 text-sm opacity-80 max-w-md">{coleccion.descripcion}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-xs tracking-widest text-stone-400 uppercase mb-2">
              <Link href="/colecciones" className="hover:underline">Colecciones</Link>
              {' → '}
              {coleccion.nombre}
            </p>
            <h1 className="font-display text-5xl font-light tracking-[0.15em] text-stone-800">
              {coleccion.nombre}
            </h1>
            {coleccion.descripcion && (
              <p className="mt-3 text-sm text-stone-500 max-w-md mx-auto">{coleccion.descripcion}</p>
            )}
          </div>
        )}
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {!productos || productos.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-stone-400 tracking-widest uppercase text-sm">
              Esta colección no tiene productos todavía
            </p>
            <Link
              href="/catalogo"
              className="mt-4 inline-block text-xs text-stone-500 underline underline-offset-4"
            >
              Ver todo el catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {(productos as any[]).map(p => {
              const imgUrl = getMainImage(p.imagenes_producto ?? [])
              const variantes = (p.variantes_producto as { precio: number; activo: boolean }[]) ?? []
              const precioMin = variantes.filter(v => v.activo).reduce(
                (min, v) => Math.min(min, v.precio),
                p.precio_base
              )

              return (
                <Link key={p.id} href={`/catalogo/${p.slug}`} className="group">
                  <div className="relative aspect-square overflow-hidden bg-stone-100">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={p.nombre}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-stone-200" />
                    )}
                  </div>
                  <div className="mt-3 space-y-0.5">
                    <h2 className="text-sm text-stone-800 group-hover:text-stone-600 transition-colors">
                      {p.nombre}
                    </h2>
                    <p className="text-sm text-stone-500">{formatCLP(precioMin)}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
