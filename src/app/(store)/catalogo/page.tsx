import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCLP } from '@/lib/utils'
import { FadeIn, FadeInStagger, FadeInItem } from '@/components/store/FadeIn'

interface CatalogoPageProps {
  searchParams: Promise<{ categoria?: string }>
}

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  const { categoria: categoriaSlug } = await searchParams
  const supabase = await createClient()

  // Obtener categorías para los filtros
  const { data: categorias } = await supabase
    .from('categorias')
    .select('id, nombre, slug')
    .eq('activo', true)
    .order('orden')

  // Resolver categoria_id si viene filtro por slug
  let categoriaId: string | null = null
  if (categoriaSlug) {
    const { data: cat } = await supabase
      .from('categorias')
      .select('id')
      .eq('slug', categoriaSlug)
      .single()
    categoriaId = cat?.id ?? null
  }

  // Consultar productos activos (RLS ya filtra por estado = 'activo')
  let query = supabase
    .from('productos')
    .select(`
      id, nombre, slug, precio_base,
      categorias(id, nombre, slug),
      imagenes_producto(ruta_almacenamiento, orden),
      variantes_producto(precio, activo)
    `)
    .eq('estado', 'activo')
    .order('creado_en', { ascending: false })

  if (categoriaId) {
    query = query.eq('categoria_id', categoriaId)
  }

  const { data: productos } = await query

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  function getMainImage(imgs: { ruta_almacenamiento: string; orden: number }[] | null) {
    if (!imgs || imgs.length === 0) return null
    const sorted = [...imgs].sort((a, b) => a.orden - b.orden)
    return `${supabaseUrl}/storage/v1/object/public/imagenes-productos/${sorted[0].ruta_almacenamiento}`
  }

  const categoriaActual = categorias?.find(c => c.slug === categoriaSlug)

  return (
    <main className="min-h-screen bg-ivory">
      {/* Header */}
      <section className="border-b border-sand px-6 py-12 text-center">
        <h1 className="font-display text-5xl font-light tracking-[0.15em] text-stone-800">
          {categoriaActual ? categoriaActual.nombre : 'Catálogo'}
        </h1>
        {!categoriaActual && (
          <p className="mt-2 text-sm tracking-widest text-stone-400">
            Todas las joyas
          </p>
        )}
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Filtros por categoría */}
        {categorias && categorias.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              href="/catalogo"
              className={`px-4 py-1.5 text-xs tracking-widest uppercase border transition-colors ${
                !categoriaSlug
                  ? 'border-onyx bg-onyx text-ivory'
                  : 'border-sand text-stone-600 hover:border-stone-400'
              }`}
            >
              Todo
            </Link>
            {categorias.map(cat => (
              <Link
                key={cat.id}
                href={`/catalogo?categoria=${cat.slug}`}
                className={`px-4 py-1.5 text-xs tracking-widest uppercase border transition-colors ${
                  categoriaSlug === cat.slug
                    ? 'border-onyx bg-onyx text-ivory'
                    : 'border-sand text-stone-600 hover:border-stone-400'
                }`}
              >
                {cat.nombre}
              </Link>
            ))}
          </div>
        )}

        {/* Grid de productos */}
        {!productos || productos.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-stone-400 tracking-widest uppercase text-sm">
              Próximamente nuevas joyas
            </p>
            {categoriaSlug && (
              <Link
                href="/catalogo"
                className="mt-4 inline-block text-xs text-stone-500 underline underline-offset-4"
              >
                Ver todo el catálogo
              </Link>
            )}
          </div>
        ) : (
          <FadeInStagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" staggerDelay={0.06}>
            {productos.map(p => {
              const imgUrl = getMainImage(
                (p.imagenes_producto as { ruta_almacenamiento: string; orden: number }[]) ?? []
              )
              const cat = (p.categorias as { nombre: string } | null)?.nombre
              // Precio mínimo entre variantes activas, o precio_base como respaldo
              const variantes = (p.variantes_producto as { precio: number; activo: boolean }[]) ?? []
              const precioMin = variantes.filter(v => v.activo).reduce(
                (min, v) => Math.min(min, v.precio),
                p.precio_base
              )

              return (
                <FadeInItem key={p.id}>
                  <Link href={`/catalogo/${p.slug}`} className="group block">
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
                      {cat && (
                        <p className="text-[10px] tracking-widest uppercase text-stone-400">{cat}</p>
                      )}
                      <h2 className="text-sm text-stone-800 group-hover:text-stone-600 transition-colors">
                        {p.nombre}
                      </h2>
                      <p className="text-sm text-stone-500">{formatCLP(precioMin)}</p>
                    </div>
                  </Link>
                </FadeInItem>
              )
            })}
          </FadeInStagger>
        )}
      </div>

      <footer className="py-8 text-center">
        <Link
          href="/administracion/login"
          className="text-[11px] text-[#7A7470] no-underline hover:underline decoration-[#7A7470]/50 underline-offset-2 transition-all"
        >
          Administración
        </Link>
      </footer>
    </main>
  )
}
