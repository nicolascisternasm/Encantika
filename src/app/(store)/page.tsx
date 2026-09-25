import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCLP } from '@/lib/utils'

export default async function StorePage() {
  const supabase = await createClient()

  const { data: productos } = await supabase
    .from('productos')
    .select(`
      id, nombre, slug, precio_base,
      categorias(nombre),
      imagenes_producto(ruta_almacenamiento, orden)
    `)
    .eq('estado', 'activo')
    .eq('destacado', true)
    .order('creado_en', { ascending: false })
    .limit(4)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  function getMainImage(imgs: { ruta_almacenamiento: string; orden: number }[] | null) {
    if (!imgs || imgs.length === 0) return null
    const sorted = [...imgs].sort((a, b) => a.orden - b.orden)
    return `${supabaseUrl}/storage/v1/object/public/imagenes-productos/${sorted[0].ruta_almacenamiento}`
  }

  return (
    <main className="min-h-screen bg-ivory">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="font-display text-7xl font-light tracking-[0.18em] text-stone-800 md:text-9xl">
          Encantika
        </h1>
        <p className="mt-4 text-base tracking-widest text-stone-500 md:text-lg">
          Joyas que cuentan tu historia
        </p>
        <Link
          href="/catalogo"
          className="mt-10 border border-stone-800 px-8 py-3 text-xs tracking-widest uppercase text-stone-800 transition-colors hover:bg-stone-800 hover:text-ivory"
        >
          Ver colección
        </Link>
      </section>

      {/* Productos destacados */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        {!productos || productos.length === 0 ? (
          <p className="text-center text-sm text-stone-400 tracking-widest uppercase py-12">
            Próximamente nuevas joyas
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {productos.map((p) => {
              const imgUrl = getMainImage(
                (p.imagenes_producto as { ruta_almacenamiento: string; orden: number }[]) ?? []
              )
              const cat = (p.categorias as { nombre: string } | null)?.nombre
              return (
                <Link key={p.id} href={`/catalogo/${p.slug}`} className="group cursor-pointer">
                  <div className="relative aspect-square overflow-hidden bg-stone-200">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={p.nombre}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-300 transition-colors group-hover:from-stone-300 group-hover:to-stone-400" />
                    )}
                  </div>
                  <div className="mt-3 space-y-1">
                    {cat && (
                      <p className="text-xs tracking-widest uppercase text-stone-400">{cat}</p>
                    )}
                    <h3 className="text-sm font-medium text-stone-800">{p.nombre}</h3>
                    <p className="text-sm text-stone-500">{formatCLP(p.precio_base)}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Footer */}
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
