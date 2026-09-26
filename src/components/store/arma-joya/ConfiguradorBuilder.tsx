'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TipoJoya, TipoComponente, Componente, ConfiguradorSelecciones } from '@/features/arma-joya/types'
import type { ConfigArmaJoya } from '@/app/actions/arma-joya-configuracion'
import { formatCLP } from '@/lib/utils'
import FondoDinamico from './FondoDinamico'
import PreviewJoya from './PreviewJoya'
import OpcionComponente from './OpcionComponente'

type Props = {
  tipoJoya: TipoJoya
  tiposComponente: TipoComponente[]
  componentes: Componente[]
  selecciones: ConfiguradorSelecciones
  config: ConfigArmaJoya
  onSeleccionar: (tipoSlug: string, comp: Componente) => void
  onDeseleccionar: (tipoSlug: string) => void
  onVolver: () => void
  onAprobar: () => void
}

export default function ConfiguradorBuilder({
  tipoJoya,
  tiposComponente,
  componentes,
  selecciones,
  config,
  onSeleccionar,
  onDeseleccionar,
  onVolver,
  onAprobar,
}: Props) {
  const [hoveredComp, setHoveredComp] = useState<Componente | null>(null)

  const seleccionados = Object.values(selecciones).filter(Boolean) as Componente[]
  const precioTotal = seleccionados.reduce((s, c) => s + c.precio, 0)
  const haySeleccion = seleccionados.length > 0

  // Muestra desc_holistica del componente bajo el cursor en el panel izquierdo
  const descActiva = hoveredComp?.desc_holistica ?? null

  return (
    <div className="relative min-h-full flex flex-col lg:flex-row" style={{ background: '#0C0A08' }}>
      <FondoDinamico selecciones={selecciones} />

      {/* ── Panel izquierdo: preview + resumen ──────────────────────────── */}
      <div className="relative z-10 lg:sticky lg:top-0 lg:h-[90vh] lg:w-[40%] flex flex-col border-r"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 lg:px-8 shrink-0">
          <button
            onClick={onVolver}
            className="flex items-center gap-2 text-[11px] uppercase tracking-[.1em] opacity-50 hover:opacity-90 transition-opacity"
            style={{ color: '#F5F0EB' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Cambiar tipo
          </button>
          <p className="text-[11px] tracking-[.15em] uppercase" style={{ color: 'rgba(201,160,53,0.7)' }}>
            {tipoJoya.nombre}
          </p>
        </div>

        {/* Preview */}
        <div className="flex-1 flex items-center justify-center px-6 py-4 min-h-0">
          <div className="w-full max-w-[200px] lg:max-w-[240px]" style={{ height: 'clamp(160px, 28vw, 260px)' }}>
            <PreviewJoya tipoJoya={tipoJoya} selecciones={selecciones} />
          </div>
        </div>

        {/* Selecciones */}
        <div className="shrink-0 px-5 lg:px-8 space-y-2 overflow-y-auto" style={{ maxHeight: '30%' }}>
          {seleccionados.length === 0 ? (
            <p className="text-[11px] text-center py-4" style={{ color: 'rgba(245,240,235,0.2)' }}>
              Elige los componentes de tu joya →
            </p>
          ) : (
            <>
              {seleccionados.map((comp) => (
                <motion.div
                  key={comp.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2.5"
                >
                  <div
                    className="w-3 h-3 rounded-full mt-0.5 shrink-0"
                    style={{ background: comp.color_primario ?? '#C9A035' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] leading-tight" style={{ color: '#F5F0EB' }}>
                      {comp.nombre}
                    </p>
                    {comp.descripcion && (
                      <p className="text-[10px] mt-0.5 leading-snug" style={{ color: 'rgba(245,240,235,0.35)' }}>
                        {comp.descripcion}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onDeseleccionar(comp.tipo_componente_slug)}
                    className="text-[10px] opacity-30 hover:opacity-70 transition-opacity shrink-0 mt-0.5"
                    style={{ color: '#F5F0EB' }}
                  >
                    ✕
                  </button>
                </motion.div>
              ))}

              {/* Total */}
              {precioTotal > 0 && (
                <div className="pt-2 mt-2 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-[10px] uppercase tracking-[.12em]" style={{ color: 'rgba(245,240,235,0.3)' }}>Total</span>
                  <span className="text-[13px]" style={{ color: 'rgba(201,160,53,0.9)', fontFamily: 'var(--font-titulos)' }}>
                    {formatCLP(precioTotal)}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Descripción holística — siempre reserva espacio, solo cambia opacidad */}
        <div
          className="shrink-0 mx-5 lg:mx-8 mb-4 mt-2 p-3 transition-opacity duration-200"
          style={{
            border: '1px solid rgba(201,160,53,0.15)',
            background: 'rgba(201,160,53,0.04)',
            opacity: descActiva ? 1 : 0,
            visibility: descActiva ? 'visible' : 'hidden',
            minHeight: '60px',
          }}
        >
          <p className="text-[10px] uppercase tracking-[.12em] mb-1.5" style={{ color: 'rgba(201,160,53,0.6)' }}>
            {hoveredComp?.nombre ?? ''}
          </p>
          <p className="text-[11px] leading-relaxed italic" style={{ color: 'rgba(245,240,235,0.45)' }}>
            {descActiva ?? ''}
          </p>
        </div>
      </div>

      {/* ── Panel derecho: categorías + opciones ────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col overflow-y-auto">
        <div className="flex-1 px-5 py-6 lg:px-8 lg:py-8 space-y-8">
          {tiposComponente
            // piedra se renderiza dentro de la sección cadena, no por separado
            .filter((tipo) => tipo.slug !== 'piedra')
            .map((tipo) => {
              const opciones = componentes.filter((c) => c.tipo_componente_id === tipo.id)
              if (opciones.length === 0) return null
              const seleccionado = selecciones[tipo.slug]

              // Para cadena, también incluimos las opciones de piedra abajo
              const tipoPiedra = tipo.slug === 'cadena'
                ? tiposComponente.find((t) => t.slug === 'piedra')
                : null
              const opcionesPiedra = tipoPiedra
                ? componentes.filter((c) => c.tipo_componente_id === tipoPiedra.id)
                : []
              const seleccionadoPiedra = tipoPiedra ? selecciones[tipoPiedra.slug] : undefined

              return (
                <div key={tipo.id}>
                  {/* Título de categoría */}
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-[11px] uppercase tracking-[.18em]" style={{ color: 'rgba(201,160,53,0.7)' }}>
                      {tipo.nombre}
                    </p>
                    {!tipo.es_obligatorio && (
                      <span className="text-[9px] uppercase tracking-[.1em] px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(245,240,235,0.25)' }}>
                        Opcional
                      </span>
                    )}
                    {seleccionado && (
                      <button
                        onClick={() => onDeseleccionar(tipo.slug)}
                        className="ml-auto text-[9px] uppercase tracking-[.08em] opacity-40 hover:opacity-80 transition-opacity"
                        style={{ color: '#F5F0EB' }}
                      >
                        Quitar
                      </button>
                    )}
                  </div>

                  {/* Opciones según tipo */}
                  {tipo.slug === 'largo' ? (
                    /* Largo: lista de píldoras compactas */
                    <div className="flex flex-wrap gap-2">
                      {opciones.map((comp) => {
                        const activo = seleccionado?.id === comp.id
                        return (
                          <motion.button
                            key={comp.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onMouseEnter={() => setHoveredComp(comp)}
                            onMouseLeave={() => setHoveredComp(null)}
                            onClick={() => activo ? onDeseleccionar(tipo.slug) : onSeleccionar(tipo.slug, comp)}
                            className="px-3 py-1.5 text-[12px] transition-all duration-200 whitespace-nowrap"
                            style={{
                              background: activo ? 'rgba(201,160,53,0.15)' : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${activo ? 'rgba(201,160,53,0.6)' : 'rgba(255,255,255,0.1)'}`,
                              color: activo ? '#F5F0EB' : 'rgba(245,240,235,0.55)',
                            }}
                          >
                            {comp.nombre}
                            {config.mostrar_precio && comp.precio > 0 && (
                              <span className="ml-1.5 text-[10px]" style={{ color: 'rgba(201,160,53,0.7)' }}>
                                {formatCLP(comp.precio)}
                              </span>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      <div className={`grid gap-2 ${
                        tipo.slug === 'signo_zodiacal' ? 'grid-cols-4 sm:grid-cols-6' :
                        'grid-cols-2 sm:grid-cols-3'
                      }`}>
                        {opciones.map((comp) => (
                          <motion.div
                            key={comp.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <OpcionComponente
                              comp={comp}
                              seleccionado={seleccionado?.id === comp.id}
                              config={config}
                              ocultarHolistica
                              onHover={setHoveredComp}
                              onSeleccionar={() => {
                                if (seleccionado?.id === comp.id) {
                                  onDeseleccionar(tipo.slug)
                                } else {
                                  // Seleccionar cadena limpia piedra; dije y signo zodiacal se excluyen
                                  if (tipo.slug === 'cadena') onDeseleccionar('piedra')
                                  if (tipo.slug === 'dije') onDeseleccionar('signo_zodiacal')
                                  if (tipo.slug === 'signo_zodiacal') onDeseleccionar('dije')
                                  onSeleccionar(tipo.slug, comp)
                                }
                              }}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </AnimatePresence>
                  )}

                  {/* Piedras dentro de la sección cadena */}
                  {tipoPiedra && opcionesPiedra.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center gap-3 mb-3">
                        <p className="text-[10px] uppercase tracking-[.15em]" style={{ color: 'rgba(201,160,53,0.5)' }}>
                          {tipoPiedra.nombre}
                        </p>
                        {!tipoPiedra.es_obligatorio && (
                          <span className="text-[9px] uppercase tracking-[.1em] px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(245,240,235,0.25)' }}>
                            Opcional
                          </span>
                        )}
                        {seleccionadoPiedra && (
                          <button
                            onClick={() => onDeseleccionar(tipoPiedra.slug)}
                            className="ml-auto text-[9px] uppercase tracking-[.08em] opacity-40 hover:opacity-80 transition-opacity"
                            style={{ color: '#F5F0EB' }}
                          >
                            Quitar
                          </button>
                        )}
                      </div>
                      <AnimatePresence mode="popLayout">
                        <div className="grid gap-2 grid-cols-3 sm:grid-cols-5">
                          {opcionesPiedra.map((comp) => (
                            <motion.div
                              key={comp.id}
                              layout
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <OpcionComponente
                                comp={comp}
                                seleccionado={seleccionadoPiedra?.id === comp.id}
                                config={config}
                                ocultarHolistica
                                onHover={setHoveredComp}
                                onSeleccionar={() => {
                                  if (seleccionadoPiedra?.id === comp.id) {
                                    onDeseleccionar(tipoPiedra.slug)
                                  } else {
                                    // Seleccionar piedra limpia la cadena
                                    onDeseleccionar('cadena')
                                    onSeleccionar(tipoPiedra.slug, comp)
                                  }
                                }}
                              />
                            </motion.div>
                          ))}
                        </div>
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )
            })}
        </div>

        {/* CTA sticky bottom */}
        <div className="sticky bottom-0 px-5 py-4 lg:px-8" style={{ background: 'rgba(12,10,8,0.95)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={onAprobar}
            disabled={!haySeleccion}
            className="w-full py-4 text-[13px] uppercase tracking-[.16em] font-medium transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: haySeleccion ? 'rgba(201,160,53,0.9)' : 'rgba(201,160,53,0.3)', color: '#0C0A08' }}
          >
            Aprobar diseño →
          </button>
        </div>
      </div>
    </div>
  )
}
