'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCLP } from '@/lib/utils'

export interface ProductoLanding {
  id: string
  nombre: string
  slug: string
  precio_base: number
  categoria_slug: string
  imagen: string | null
}

interface Props {
  categorias: { nombre: string; slug: string }[]
  productos: ProductoLanding[]
  storageUrl: string
}

export default function LandingCategoriasSection({ categorias, productos, storageUrl }: Props) {
  const [activeTab, setActiveTab] = useState(categorias[0]?.slug ?? '')

  const filtrados = productos.filter((p) => p.categoria_slug === activeTab)

  return (
    <section
      className="py-20 px-6 sm:px-8"
      style={{ backgroundColor: 'var(--color-fondo, #FFFDF9)' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p
            className="text-[11px] uppercase tracking-[.18em] mb-3"
            style={{ color: 'var(--color-acento)' }}
          >
            Nuestras joyas
          </p>
          <h2
            className="font-display text-4xl sm:text-5xl font-normal"
            style={{ color: 'var(--color-texto)' }}
          >
            Descubre la colección
          </h2>
        </div>

        {/* Tabs */}
        {categorias.length > 0 && (
          <div className="flex justify-center flex-wrap gap-1 mb-10">
            {categorias.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveTab(cat.slug)}
                className="relative px-6 py-2.5 text-[11px] uppercase tracking-[.12em] transition-colors duration-200"
                style={{
                  color:
                    activeTab === cat.slug
                      ? 'var(--color-texto)'
                      : 'var(--color-texto-suave)',
                }}
              >
                {cat.nombre}
                {activeTab === cat.slug && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-2 right-2 h-px"
                    style={{ backgroundColor: 'var(--color-acento)' }}
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Grilla de productos */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6"
          >
            {filtrados.slice(0, 4).map((p) => (
              <Link key={p.id} href={`/catalogo/${p.slug}`} className="group">
                <div
                  className="relative aspect-square overflow-hidden"
                  style={{ backgroundColor: 'var(--color-tarjeta)' }}
                >
                  {p.imagen ? (
                    <Image
                      src={`${storageUrl}/${p.imagen}`}
                      alt={p.nombre}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{ backgroundColor: 'var(--color-tarjeta)' }}
                    />
                  )}
                </div>
                <div className="mt-3 space-y-1">
                  <h3
                    className="font-display text-lg leading-tight"
                    style={{ color: 'var(--color-texto)' }}
                  >
                    {p.nombre}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--color-texto-suave)' }}
                  >
                    {formatCLP(p.precio_base)}
                  </p>
                </div>
              </Link>
            ))}

            {filtrados.length === 0 && (
              <p
                className="col-span-4 text-center py-16 text-sm"
                style={{ color: 'var(--color-texto-suave)' }}
              >
                No hay productos en esta categoría aún.
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 text-center">
          <Link
            href={`/catalogo?categoria=${activeTab}`}
            className="inline-block text-xs uppercase tracking-[.12em] px-8 py-3 border transition-all duration-300 hover:opacity-70"
            style={{
              borderColor: 'var(--color-texto)',
              color: 'var(--color-texto)',
            }}
          >
            Ver todo
          </Link>
        </div>
      </div>
    </section>
  )
}
