'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { TipoJoya, Componente, ConfiguradorSelecciones } from '@/features/arma-joya/types'
import FondoDinamico from './FondoDinamico'
import PreviewJoya from './PreviewJoya'

type Props = {
  tipoJoya: TipoJoya
  selecciones: ConfiguradorSelecciones
  significadoIA: string
  tarjetaTexto: string
  nombreReceptor: string
  esRegalo: boolean
  guardando?: boolean
  onVolver: () => void
  onContinuar: () => void
}

export default function PasoSignificado({
  tipoJoya,
  selecciones,
  significadoIA,
  tarjetaTexto,
  nombreReceptor,
  esRegalo,
  guardando = false,
  onVolver,
  onContinuar,
}: Props) {
  const componentesSeleccionados = Object.values(selecciones).filter(Boolean) as Componente[]
  const precioTotal = componentesSeleccionados.reduce((s, c) => s + c.precio, 0)

  // Referencia para el scroll a la tarjeta al aparecer
  const tarjetaRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    setTimeout(() => {
      tarjetaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 800)
  }, [])

  return (
    <div className="relative min-h-screen" style={{ background: '#0C0A08' }}>
      <FondoDinamico selecciones={selecciones} />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 lg:px-10 lg:pt-8">
          <button
            onClick={onVolver}
            className="flex items-center gap-2 text-[12px] uppercase tracking-[.1em] opacity-50 hover:opacity-80 transition-opacity"
            style={{ color: '#F5F0EB' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Volver
          </button>
          <p className="text-[11px] tracking-[.15em] uppercase" style={{ color: 'rgba(201,160,53,0.6)' }}>
            {tipoJoya.nombre}
          </p>
          <div className="w-16" />
        </div>

        {/* Contenido */}
        <div className="flex-1 flex flex-col items-center px-5 py-8 lg:px-0 gap-10">

          {/* Preview joya */}
          <motion.div
            className="w-full max-w-[220px]"
            style={{ height: 220 }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <PreviewJoya tipoJoya={tipoJoya} selecciones={selecciones} />
          </motion.div>

          {/* Título */}
          <motion.div
            className="text-center max-w-md"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <p className="text-[10px] uppercase tracking-[.25em] mb-3" style={{ color: 'rgba(201,160,53,0.5)' }}>
              El significado de tu joya
            </p>
            <p
              className="font-normal leading-relaxed text-[15px]"
              style={{ color: 'rgba(245,240,235,0.8)', fontFamily: 'var(--font-titulos)' }}
            >
              {significadoIA}
            </p>
          </motion.div>

          {/* Separador */}
          <motion.div
            className="flex items-center gap-4 w-full max-w-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="flex-1 h-px" style={{ background: 'rgba(201,160,53,0.15)' }} />
            <span className="text-[12px]" style={{ color: 'rgba(201,160,53,0.4)' }}>✦</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(201,160,53,0.15)' }} />
          </motion.div>

          {/* Tarjeta de mensaje */}
          {tarjetaTexto && (
            <motion.div
              ref={tarjetaRef}
              className="w-full max-w-sm p-6 relative"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(201,160,53,0.2)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              {/* Ícono de tarjeta */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3" style={{ background: '#0C0A08' }}>
                <span className="text-[11px] uppercase tracking-[.2em]" style={{ color: 'rgba(201,160,53,0.5)' }}>
                  {esRegalo ? `Para ${nombreReceptor || 'ti'}` : 'Tu intención'}
                </span>
              </div>
              <p
                className="text-[13px] leading-relaxed italic text-center"
                style={{ color: 'rgba(245,240,235,0.6)', fontFamily: 'var(--font-titulos)' }}
              >
                "{tarjetaTexto}"
              </p>
              <p className="text-center mt-3 text-[10px]" style={{ color: 'rgba(201,160,53,0.4)' }}>
                — Encantika
              </p>
            </motion.div>
          )}

          {/* Resumen de componentes y precio */}
          <motion.div
            className="w-full max-w-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
          >
            <div className="flex flex-col gap-2 mb-4">
              {componentesSeleccionados.map((c) => (
                <div key={c.id} className="flex justify-between items-center">
                  <span className="text-[12px]" style={{ color: 'rgba(245,240,235,0.5)' }}>{c.nombre}</span>
                  {c.precio > 0 && (
                    <span className="text-[12px]" style={{ color: 'rgba(201,160,53,0.7)' }}>
                      {formatCLP(c.precio)}
                    </span>
                  )}
                </div>
              ))}
              <div className="h-px mt-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="flex justify-between items-center">
                <span className="text-[12px] uppercase tracking-[.1em]" style={{ color: 'rgba(245,240,235,0.35)' }}>
                  Total
                </span>
                <span
                  className="text-lg font-normal"
                  style={{ color: '#F5F0EB', fontFamily: 'var(--font-titulos)' }}
                >
                  {formatCLP(precioTotal)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="w-full max-w-sm pb-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.5 }}
          >
            <button
              onClick={onContinuar}
              disabled={guardando}
              className="w-full py-4 text-[13px] uppercase tracking-[.16em] font-medium transition-all duration-300 disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-3"
              style={{ background: 'rgba(201,160,53,0.9)', color: '#0C0A08' }}
            >
              {guardando ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Guardando pedido…
                </>
              ) : (
                'Confirmar pedido →'
              )}
            </button>
            <p className="text-center text-[10px] mt-3" style={{ color: 'rgba(245,240,235,0.2)' }}>
              Tu diseño se guardará automáticamente
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function formatCLP(n: number): string {
  return '$' + n.toLocaleString('es-CL')
}
