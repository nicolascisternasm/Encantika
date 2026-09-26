'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { addToCart } from '@/lib/cart'
import { formatCLP } from '@/lib/utils'
import type { TipoJoya, Componente, ConfiguradorSelecciones } from '@/features/arma-joya/types'

type Props = {
  tipoJoya: TipoJoya
  selecciones: ConfiguradorSelecciones
  descripcionIA: string
  cargandoIA: boolean
  configuracionId: string | null
  onNuevaJoya: () => void
  onCerrar?: () => void
}

export default function PasoResultado({
  tipoJoya,
  selecciones,
  descripcionIA,
  cargandoIA,
  configuracionId,
  onNuevaJoya,
  onCerrar,
}: Props) {
  const componentes = Object.values(selecciones).filter(Boolean) as Componente[]
  const precioTotal = componentes.reduce((s, c) => s + c.precio, 0)
  const idCorto = configuracionId?.slice(0, 8).toUpperCase() ?? ''

  // Primera imagen disponible entre los componentes seleccionados
  const imagenPrincipal = componentes.find((c) => c.url_imagen)?.url_imagen ?? null

  function handleAgregarAlCarrito() {
    if (!configuracionId) return
    addToCart({
      productoId: `joya-${configuracionId}`,
      nombre: `${tipoJoya.nombre} personalizada #${idCorto}`,
      precio: precioTotal,
      imagenUrl: imagenPrincipal,
      caracteristicas: componentes.map((c) => ({ nombre: c.tipo_componente_slug, valor: c.nombre })),
      cantidad: 1,
    })
    onCerrar?.()
  }

  return (
    <div className="relative min-h-full" style={{ background: '#0C0A08' }}>
      {/* Halo */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(201,160,53,0.05) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-lg mx-auto px-5 py-10 lg:py-14">

        {/* Loading IA */}
        {cargandoIA && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-7 h-7 border-2 rounded-full animate-spin"
              style={{ borderColor: 'rgba(201,160,53,0.2)', borderTopColor: 'rgba(201,160,53,0.9)' }} />
            <p className="text-[12px] uppercase tracking-[.2em]" style={{ color: 'rgba(245,240,235,0.3)' }}>
              Tejiendo el significado…
            </p>
          </div>
        )}

        {!cargandoIA && (
          <motion.div
            className="flex flex-col items-center gap-7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Imagen de la joya */}
            <motion.div
              className="w-full max-w-xs aspect-square rounded-sm overflow-hidden"
              style={{ background: imagenPrincipal ? undefined : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {imagenPrincipal ? (
                <Image
                  src={imagenPrincipal}
                  alt={`${tipoJoya.nombre} personalizada`}
                  width={400}
                  height={400}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-[11px] uppercase tracking-[.15em]" style={{ color: 'rgba(245,240,235,0.15)' }}>
                    {tipoJoya.nombre}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Descripción IA */}
            {descripcionIA && (
              <motion.div
                className="w-full p-5 text-center"
                style={{ border: '1px solid rgba(201,160,53,0.12)', background: 'rgba(201,160,53,0.03)' }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <p className="text-[13px] leading-relaxed italic" style={{ color: 'rgba(245,240,235,0.65)', fontFamily: 'var(--font-titulos)' }}>
                  "{descripcionIA}"
                </p>
              </motion.div>
            )}

            {/* Componentes + precio */}
            <motion.div
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <div className="flex flex-col gap-1.5 mb-3">
                {componentes.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-2">
                    <span className="text-[12px]" style={{ color: 'rgba(245,240,235,0.4)' }}>{c.nombre}</span>
                    {c.precio > 0 && (
                      <span className="text-[12px]" style={{ color: 'rgba(201,160,53,0.6)' }}>
                        {formatCLP(c.precio)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-[11px] uppercase tracking-[.12em]" style={{ color: 'rgba(245,240,235,0.25)' }}>
                  Total
                </span>
                <span className="text-lg" style={{ color: '#F5F0EB', fontFamily: 'var(--font-titulos)' }}>
                  {formatCLP(precioTotal)}
                </span>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              className="w-full flex flex-col gap-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <button
                onClick={handleAgregarAlCarrito}
                className="w-full py-4 text-[13px] uppercase tracking-[.16em] font-medium transition-all duration-200"
                style={{ background: 'rgba(201,160,53,0.9)', color: '#0C0A08' }}
              >
                Agregar al carrito
              </button>
              <button
                onClick={onNuevaJoya}
                className="w-full py-3 text-[12px] uppercase tracking-[.12em] text-center transition-all duration-200"
                style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(245,240,235,0.35)' }}
              >
                Crear otra joya
              </button>
              {idCorto && (
                <p className="text-center text-[10px] tracking-widest font-mono" style={{ color: 'rgba(245,240,235,0.15)' }}>
                  #{idCorto}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
