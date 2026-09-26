'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { TipoJoya } from '@/features/arma-joya/types'

// ── Íconos SVG por tipo de joya ───────────────────────────────────────────────

function IconCollar() {
  return (
    <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M18 22 Q18 56 40 56 Q62 56 62 22" />
      <ellipse cx="40" cy="64" rx="6" ry="8" strokeWidth={1} />
      <line x1="40" y1="56" x2="40" y2="57" />
    </svg>
  )
}

function IconPulsera() {
  return (
    <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" className="w-full h-full">
      <ellipse cx="40" cy="40" rx="24" ry="14" />
      <ellipse cx="40" cy="40" rx="24" ry="14" transform="rotate(15 40 40)" />
      <circle cx="40" cy="26" r="3" strokeWidth={1} />
    </svg>
  )
}

function IconAros() {
  return (
    <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" className="w-full h-full">
      <circle cx="28" cy="34" r="12" />
      <path d="M28 46 Q28 58 34 62" />
      <circle cx="52" cy="34" r="12" />
      <path d="M52 46 Q52 58 58 62" />
    </svg>
  )
}

const ICONOS: Record<string, React.FC> = {
  collar: IconCollar,
  pulsera: IconPulsera,
  aros: IconAros,
}

function IconGenerico() {
  return (
    <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth={1.2} className="w-full h-full">
      <circle cx="40" cy="40" r="20" />
      <path d="M40 20 L40 60 M20 40 L60 40" />
    </svg>
  )
}

// ── Partículas decorativas (CSS puro) ─────────────────────────────────────────

const ESTRELLAS = [
  { x: '8%',  y: '15%', size: 1.5, delay: 0 },
  { x: '82%', y: '8%',  size: 1,   delay: 1.2 },
  { x: '65%', y: '22%', size: 2,   delay: 0.6 },
  { x: '15%', y: '60%', size: 1.5, delay: 1.8 },
  { x: '90%', y: '55%', size: 1,   delay: 0.3 },
  { x: '45%', y: '88%', size: 1.5, delay: 2.1 },
  { x: '72%', y: '78%', size: 1,   delay: 0.9 },
  { x: '30%', y: '35%', size: 1,   delay: 1.5 },
]

// ── Componente principal ──────────────────────────────────────────────────────

type Props = {
  tipos: TipoJoya[]
  onSeleccionar: (tipo: TipoJoya) => void
}

export default function PasoTipoJoya({ tipos, onSeleccionar }: Props) {
  const [seleccionando, setSeleccionando] = useState<string | null>(null)

  function handleClick(tipo: TipoJoya) {
    setSeleccionando(tipo.id)
    setTimeout(() => onSeleccionar(tipo), 400)
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden flex flex-col"
      style={{ background: '#0C0A08' }}
    >
      {/* Fondo — halo dorado superior */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(201,160,53,0.10) 0%, transparent 70%)',
        }}
      />

      {/* Partículas decorativas */}
      {ESTRELLAS.map((e, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: e.x,
            top: e.y,
            width: e.size,
            height: e.size,
            background: 'rgba(201,160,53,0.7)',
          }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, delay: e.delay, ease: 'easeInOut' }}
        />
      ))}

      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center flex-1 px-6 pt-12 pb-16 sm:pt-20">

        {/* Encabezado */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <p
            className="text-[10px] uppercase tracking-[.32em] mb-5"
            style={{ color: 'rgba(201,160,53,0.7)' }}
          >
            Tu joya, tu historia
          </p>
          <h1
            className="font-display font-normal leading-[1.1] tracking-[.04em]"
            style={{
              fontSize: 'clamp(38px, 9vw, 72px)',
              color: '#F5F0EB',
              fontFamily: 'var(--font-titulos)',
            }}
          >
            ¿Qué quieres<br />crear hoy?
          </h1>
          <p
            className="mt-5 text-[14px] leading-relaxed max-w-xs mx-auto"
            style={{ color: 'rgba(245,240,235,0.45)' }}
          >
            Cada pieza comienza con una elección.<br />
            Elige y construiremos juntos.
          </p>
        </motion.div>

        {/* Tarjetas de tipo de joya */}
        <div className={`w-full max-w-lg grid gap-4 ${tipos.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          {tipos.map((tipo, i) => {
            const Icon = ICONOS[tipo.slug] ?? IconGenerico
            const isSeleccionando = seleccionando === tipo.id

            return (
              <motion.button
                key={tipo.id}
                onClick={() => handleClick(tipo)}
                disabled={seleccionando !== null}
                className="group relative w-full text-left overflow-hidden"
                style={{
                  background: isSeleccionando
                    ? 'rgba(201,160,53,0.12)'
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isSeleccionando ? 'rgba(201,160,53,0.6)' : 'rgba(201,160,53,0.14)'}`,
                  transition: 'background 0.3s, border-color 0.3s',
                }}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.12, ease: 'easeOut' }}
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Glow en hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse 60% 80% at 10% 50%, rgba(201,160,53,0.06) 0%, transparent 70%)',
                  }}
                />

                <div className="relative flex items-center gap-5 px-6 py-5 sm:py-6">
                  {/* Ícono */}
                  <div
                    className="shrink-0 transition-colors duration-300"
                    style={{
                      width: 56,
                      height: 56,
                      color: isSeleccionando ? 'rgba(201,160,53,1)' : 'rgba(201,160,53,0.55)',
                    }}
                  >
                    <Icon />
                  </div>

                  {/* Texto */}
                  <div className="flex-1">
                    <h2
                      className="font-display font-normal leading-tight"
                      style={{
                        fontSize: 'clamp(26px, 6vw, 32px)',
                        color: isSeleccionando ? '#F5F0EB' : 'rgba(245,240,235,0.85)',
                        fontFamily: 'var(--font-titulos)',
                        transition: 'color 0.3s',
                      }}
                    >
                      {tipo.nombre}
                    </h2>
                    {tipo.descripcion && (
                      <p
                        className="mt-1 text-[12px] leading-relaxed"
                        style={{ color: 'rgba(245,240,235,0.35)' }}
                      >
                        {tipo.descripcion}
                      </p>
                    )}
                  </div>

                  {/* Flecha */}
                  <motion.div
                    className="shrink-0 ml-2"
                    animate={{ x: isSeleccionando ? 4 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ color: 'rgba(201,160,53,0.5)' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                </div>

                {/* Línea inferior animada al seleccionar */}
                {isSeleccionando && (
                  <motion.div
                    className="absolute bottom-0 left-0 h-[1px]"
                    style={{ background: 'rgba(201,160,53,0.6)' }}
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.35 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Footer decorativo */}
        <motion.p
          className="mt-14 text-[11px] text-center tracking-[.12em] uppercase"
          style={{ color: 'rgba(245,240,235,0.18)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          Encantika — Joyería con significado
        </motion.p>
      </div>
    </div>
  )
}
