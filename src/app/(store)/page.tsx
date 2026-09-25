import Link from 'next/link'

const PLACEHOLDER_PRODUCTS = [
  { id: 1, nombre: 'Collar Luna', precio: '$29.990', categoria: 'Collares' },
  { id: 2, nombre: 'Anillo Sol', precio: '$19.990', categoria: 'Anillos' },
  { id: 3, nombre: 'Aros Estrella', precio: '$14.990', categoria: 'Aros' },
  { id: 4, nombre: 'Pulsera Mar', precio: '$24.990', categoria: 'Pulseras' },
]

export default function StorePage() {
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

      {/* Grilla placeholder */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLACEHOLDER_PRODUCTS.map((product) => (
            <article key={product.id} className="group cursor-pointer">
              <div className="relative aspect-square overflow-hidden bg-stone-200">
                <div className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-300 transition-colors group-hover:from-stone-300 group-hover:to-stone-400" />
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-xs tracking-widest uppercase text-stone-400">
                  {product.categoria}
                </p>
                <h3 className="text-sm font-medium text-stone-800">{product.nombre}</h3>
                <p className="text-sm text-stone-500">{product.precio}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
