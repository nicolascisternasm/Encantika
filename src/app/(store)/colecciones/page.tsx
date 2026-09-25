import Link from 'next/link'
import { getColeccionesActivas } from '@/features/collections/queries'
import { FadeIn, FadeInStagger, FadeInItem } from '@/components/store/FadeIn'

export default async function ColeccionesPage() {
  const colecciones = await getColeccionesActivas()

  return (
    <main className="min-h-screen bg-ivory">
      <section className="border-b border-sand px-6 py-12 text-center">
        <h1 className="font-display text-5xl font-light tracking-[0.15em] text-stone-800">
          Colecciones
        </h1>
        <p className="mt-2 text-sm tracking-widest text-stone-400">
          Descubre nuestras colecciones
        </p>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {colecciones.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-stone-400 tracking-widest uppercase text-sm">
              Próximamente nuevas colecciones
            </p>
          </div>
        ) : (
          <FadeInStagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" staggerDelay={0.07}>
            {colecciones.map(col => (
              <FadeInItem key={col.id}>
                <Link href={`/colecciones/${col.slug}`} className="group block">
                  <div className="relative aspect-square overflow-hidden bg-stone-100">
                    {col.url_imagen ? (
                      <img
                        src={col.url_imagen}
                        alt={col.nombre}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-stone-200" />
                    )}
                  </div>
                  <div className="mt-3 space-y-0.5">
                    <h2 className="text-sm text-stone-800 group-hover:text-stone-600 transition-colors">
                      {col.nombre}
                    </h2>
                    <p className="text-xs text-stone-400">
                      {col._count === 1 ? '1 producto' : `${col._count} productos`}
                    </p>
                  </div>
                </Link>
              </FadeInItem>
            ))}
          </FadeInStagger>
        )}
      </div>
    </main>
  )
}
