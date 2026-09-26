'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { TipoJoya, Componente, ConfiguradorSelecciones } from '@/features/arma-joya/types'
import FondoDinamico from './FondoDinamico'

type Props = {
  tipoJoya: TipoJoya
  selecciones: ConfiguradorSelecciones
  onVolver: () => void
  onContinuar: (datos: { nombreReceptor: string; esRegalo: boolean; intencionTexto: string }) => void
  cargando: boolean
}

export default function PasoPersonalizacion({
  tipoJoya,
  selecciones,
  onVolver,
  onContinuar,
  cargando,
}: Props) {
  const [esRegalo, setEsRegalo] = useState(false)
  const [nombreReceptor, setNombreReceptor] = useState('')
  const [intencionTexto, setIntencionTexto] = useState('')

  function handleSubmit() {
    onContinuar({ nombreReceptor: nombreReceptor.trim(), esRegalo, intencionTexto: intencionTexto.trim() })
  }

  const componentesSeleccionados = Object.values(selecciones).filter(Boolean) as Componente[]

  return (
    <div className="relative min-h-full" style={{ background: '#0C0A08' }}>
      <FondoDinamico selecciones={selecciones} />

      <div className="relative z-10 min-h-full flex flex-col">
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
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 lg:px-0">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Resumen de componentes */}
            <div className="mb-8 flex flex-wrap gap-2 justify-center">
              {componentesSeleccionados.map((c) => (
                <span
                  key={c.id}
                  className="text-[11px] px-3 py-1 rounded-full"
                  style={{
                    background: `rgba(${hexToRgbStr(c.color_primario ?? '#C9A035')},0.12)`,
                    border: `1px solid rgba(${hexToRgbStr(c.color_primario ?? '#C9A035')},0.25)`,
                    color: c.color_primario ?? '#C9A035',
                  }}
                >
                  {c.nombre}
                </span>
              ))}
            </div>

            {/* Título */}
            <h2
              className="text-center font-normal mb-2 leading-tight"
              style={{ fontSize: 'clamp(28px, 6vw, 42px)', color: '#F5F0EB', fontFamily: 'var(--font-titulos)' }}
            >
              Dale un propósito
            </h2>
            <p className="text-center text-[13px] mb-10 leading-relaxed" style={{ color: 'rgba(245,240,235,0.4)' }}>
              Personaliza tu joya para que el significado sea tuyo.
            </p>

            {/* ¿Es regalo? */}
            <div className="mb-6">
              <p className="text-[11px] uppercase tracking-[.15em] mb-3" style={{ color: 'rgba(245,240,235,0.35)' }}>
                ¿Para quién es?
              </p>
              <div className="flex gap-3">
                {[
                  { valor: false, label: 'Para mí' },
                  { valor: true, label: 'Es un regalo' },
                ].map(({ valor, label }) => (
                  <button
                    key={String(valor)}
                    onClick={() => setEsRegalo(valor)}
                    className="flex-1 py-3 text-[12px] tracking-[.08em] transition-all duration-200"
                    style={{
                      background: esRegalo === valor ? 'rgba(201,160,53,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${esRegalo === valor ? 'rgba(201,160,53,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      color: esRegalo === valor ? '#C9A035' : 'rgba(245,240,235,0.5)',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre del receptor */}
            {esRegalo && (
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-[11px] uppercase tracking-[.15em] mb-2" style={{ color: 'rgba(245,240,235,0.35)' }}>
                  Nombre de quien la recibe
                </label>
                <input
                  type="text"
                  value={nombreReceptor}
                  onChange={(e) => setNombreReceptor(e.target.value)}
                  placeholder="Ej: Valentina"
                  maxLength={60}
                  className="w-full py-3 px-4 text-[13px] outline-none transition-all duration-200 placeholder:opacity-30"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#F5F0EB',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(201,160,53,0.4)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </motion.div>
            )}

            {/* Intención */}
            <div className="mb-8">
              <label className="block text-[11px] uppercase tracking-[.15em] mb-2" style={{ color: 'rgba(245,240,235,0.35)' }}>
                ¿Qué intención le das? <span style={{ color: 'rgba(245,240,235,0.2)' }}>(opcional)</span>
              </label>
              <textarea
                value={intencionTexto}
                onChange={(e) => setIntencionTexto(e.target.value)}
                placeholder={esRegalo
                  ? 'Ej: Que siempre se sienta protegida y amada.'
                  : 'Ej: Quiero recordarme de mi fortaleza cada día.'}
                maxLength={200}
                rows={3}
                className="w-full py-3 px-4 text-[13px] outline-none transition-all duration-200 resize-none placeholder:opacity-30"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#F5F0EB',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(201,160,53,0.4)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
              <p className="text-right text-[10px] mt-1" style={{ color: 'rgba(245,240,235,0.2)' }}>
                {intencionTexto.length}/200
              </p>
            </div>

            {/* Botón */}
            <motion.button
              onClick={handleSubmit}
              disabled={cargando}
              className="w-full py-4 text-[13px] uppercase tracking-[.16em] font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-3"
              style={{
                background: 'rgba(201,160,53,0.9)',
                color: '#0C0A08',
              }}
              whileTap={!cargando ? { scale: 0.98 } : {}}
            >
              {cargando ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Tejiendo el significado…
                </>
              ) : (
                'Descubrir el significado ✦'
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function hexToRgbStr(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}
