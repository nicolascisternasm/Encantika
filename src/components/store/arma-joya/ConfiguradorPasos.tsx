'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCLP } from '@/lib/utils'
import type { TipoJoya, TipoComponente, Componente, ConfiguradorSelecciones } from '@/features/arma-joya/types'
import FondoDinamico from './FondoDinamico'
import PreviewJoya from './PreviewJoya'
import PasoComponente from './PasoComponente'

type Props = {
  tipoJoya: TipoJoya
  tiposComponente: TipoComponente[]
  componentes: Componente[]
  selecciones: ConfiguradorSelecciones
  onSeleccionar: (tipoSlug: string, comp: Componente) => void
  onDeseleccionar: (tipoSlug: string) => void
  onVolver: () => void
  onFinalizar: () => void
}

export default function ConfiguradorPasos({
  tipoJoya,
  tiposComponente,
  componentes,
  selecciones,
  onSeleccionar,
  onVolver,
  onFinalizar,
}: Props) {
  const [pasoIndex, setPasoIndex] = useState(0)

  const tipoActual = tiposComponente[pasoIndex]
  const esUltimoPaso = pasoIndex === tiposComponente.length - 1
  const esPrimerPaso = pasoIndex === 0

  const opcionesActuales = componentes.filter(
    (c) => c.tipo_componente_id === tipoActual?.id
  )

  const seleccionActual = tipoActual ? selecciones[tipoActual.slug] : undefined

  const precioTotal = Object.values(selecciones)
    .filter(Boolean)
    .reduce((sum, c) => sum + (c as Componente).precio, 0)

  function avanzar() {
    if (esUltimoPaso) {
      onFinalizar()
    } else {
      setPasoIndex((i) => i + 1)
    }
  }

  function retroceder() {
    if (esPrimerPaso) {
      onVolver()
    } else {
      setPasoIndex((i) => i - 1)
    }
  }

  if (!tipoActual) return null

  return (
    <div className="relative min-h-full" style={{ background: '#0C0A08' }}>
      {/* Fondo dinámico */}
      <FondoDinamico selecciones={selecciones} />

      {/* Contenido — por encima del fondo */}
      <div className="relative z-10 flex flex-col min-h-full lg:flex-row">

        {/* ── Panel izquierdo: preview (sticky en desktop, fijo en mobile) ── */}
        <div className="lg:sticky lg:top-0 lg:h-screen lg:w-[42%] flex flex-col">

          {/* Header móvil */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 lg:px-8 lg:pt-8">
            <button
              onClick={retroceder}
              className="flex items-center gap-2 text-[12px] uppercase tracking-[.1em] transition-opacity hover:opacity-100 opacity-60"
              style={{ color: 'rgba(245,240,235,0.6)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {esPrimerPaso ? 'Cambiar tipo' : 'Anterior'}
            </button>

            <p className="text-[11px] tracking-[.15em] uppercase" style={{ color: 'rgba(201,160,53,0.6)' }}>
              {tipoJoya.nombre}
            </p>

            {/* Indicador de pasos */}
            <div className="flex gap-1.5 items-center">
              {tiposComponente.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === pasoIndex ? 16 : 5,
                    height: 5,
                    background: i === pasoIndex
                      ? 'rgba(201,160,53,0.9)'
                      : i < pasoIndex
                        ? 'rgba(201,160,53,0.4)'
                        : 'rgba(255,255,255,0.15)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Preview joya */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 lg:py-8">
            <div className="w-full max-w-[240px] lg:max-w-[280px]" style={{ height: 'clamp(180px, 35vw, 300px)' }}>
              <PreviewJoya tipoJoya={tipoJoya} selecciones={selecciones} />
            </div>

            {/* Precio total */}
            <motion.div
              className="mt-4 text-center"
              animate={{ opacity: precioTotal > 0 ? 1 : 0.3 }}
            >
              <p className="text-[10px] uppercase tracking-[.15em] mb-1" style={{ color: 'rgba(245,240,235,0.3)' }}>
                Total actual
              </p>
              <p className="font-display text-2xl font-normal" style={{ color: '#F5F0EB', fontFamily: 'var(--font-titulos)' }}>
                {precioTotal > 0 ? formatCLP(precioTotal) : '—'}
              </p>
            </motion.div>

            {/* Resumen de selecciones (solo desktop) */}
            <div className="hidden lg:flex flex-col gap-1.5 mt-6 w-full max-w-[240px]">
              {tiposComponente.map((tc) => {
                const sel = selecciones[tc.slug]
                return (
                  <div key={tc.id} className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[.08em]" style={{ color: 'rgba(245,240,235,0.25)' }}>
                      {tc.nombre}
                    </span>
                    <span className="text-[11px]" style={{ color: sel ? 'rgba(245,240,235,0.65)' : 'rgba(245,240,235,0.18)' }}>
                      {sel ? sel.nombre : '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Panel derecho: paso actual ──────────────────────────────────── */}
        <div className="flex-1 flex flex-col lg:overflow-y-auto lg:max-h-screen">
          <div className="px-5 pt-3 pb-6 lg:px-8 lg:pt-10 flex flex-col flex-1">

            {/* Título del paso */}
            <AnimatePresence mode="wait">
              <motion.div
                key={tipoActual.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="mb-5"
              >
                <p className="text-[10px] uppercase tracking-[.2em] mb-1.5" style={{ color: 'rgba(201,160,53,0.5)' }}>
                  Paso {pasoIndex + 1} de {tiposComponente.length}
                </p>
                <h2
                  className="font-display font-normal leading-tight"
                  style={{
                    fontSize: 'clamp(24px, 5vw, 36px)',
                    color: '#F5F0EB',
                    fontFamily: 'var(--font-titulos)',
                  }}
                >
                  Elige{' '}
                  {tipoActual.slug === 'largo' ? 'el largo' :
                   tipoActual.slug === 'cadena' ? 'tu cadena' :
                   tipoActual.slug === 'piedra' ? 'tu piedra' :
                   tipoActual.slug === 'dije' ? 'un dije' :
                   tipoActual.slug === 'signo_zodiacal' ? 'tu signo' :
                   `tu ${tipoActual.nombre.toLowerCase()}`}
                </h2>
                {!tipoActual.es_obligatorio && (
                  <p className="text-[11px] mt-1" style={{ color: 'rgba(245,240,235,0.28)' }}>
                    Opcional — puedes omitir este paso
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Opciones */}
            <AnimatePresence mode="wait">
              <motion.div
                key={tipoActual.slug}
                className="flex-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <PasoComponente
                  tipoComponente={tipoActual}
                  opciones={opcionesActuales}
                  seleccionado={seleccionActual}
                  onSeleccionar={(comp) => onSeleccionar(tipoActual.slug, comp)}
                />
              </motion.div>
            </AnimatePresence>

            {/* Botones de navegación */}
            <div className="mt-6 flex gap-3">
              {/* Omitir (solo opcionales y cuando NO está seleccionado nada) */}
              {!tipoActual.es_obligatorio && !seleccionActual && (
                <button
                  onClick={avanzar}
                  className="flex-1 py-3 text-[12px] uppercase tracking-[.14em] border transition-all duration-200"
                  style={{
                    borderColor: 'rgba(255,255,255,0.12)',
                    color: 'rgba(245,240,235,0.4)',
                  }}
                >
                  Omitir
                </button>
              )}

              {/* Siguiente / Finalizar */}
              <motion.button
                onClick={avanzar}
                disabled={tipoActual.es_obligatorio && !seleccionActual}
                className="flex-1 py-3.5 text-[13px] uppercase tracking-[.14em] font-medium transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: seleccionActual
                    ? 'rgba(201,160,53,0.9)'
                    : tipoActual.es_obligatorio
                      ? 'rgba(201,160,53,0.15)'
                      : 'rgba(201,160,53,0.7)',
                  color: seleccionActual ? '#0C0A08' : '#F5F0EB',
                }}
                whileTap={seleccionActual || !tipoActual.es_obligatorio ? { scale: 0.98 } : {}}
              >
                {esUltimoPaso ? 'Continuar' : 'Siguiente →'}
              </motion.button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
