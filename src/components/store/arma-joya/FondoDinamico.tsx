'use client'

import { motion } from 'framer-motion'
import type { Componente } from '@/features/arma-joya/types'

type Props = {
  selecciones: Partial<Record<string, Componente>>
}

// Convierte hex a valores rgb separados
function hexRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

// Posiciones fijas para cada capa de atmósfera (máx. 4 componentes visibles)
const POSICIONES = [
  { x: '65%', y: '15%', rx: '70%', ry: '55%' },
  { x: '20%', y: '75%', rx: '60%', ry: '50%' },
  { x: '85%', y: '65%', rx: '50%', ry: '45%' },
  { x: '40%', y: '95%', rx: '55%', ry: '40%' },
]

export default function FondoDinamico({ selecciones }: Props) {
  const comps = Object.values(selecciones).filter(Boolean) as Componente[]

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ background: '#0C0A08' }}>
      {/* Halo dorado base (siempre presente) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 40% at 50% -5%, rgba(201,160,53,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Capas de color por componente seleccionado */}
      {POSICIONES.map((pos, i) => {
        const comp = comps[i]
        const color = comp?.color_primario
        const intensidad = comp ? (comp.intensidad ?? 5) / 10 * 0.18 : 0

        return (
          <motion.div
            key={i}
            className="absolute inset-0"
            animate={{
              opacity: comp ? 1 : 0,
            }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
            style={{
              background: color
                ? `radial-gradient(ellipse ${pos.rx} ${pos.ry} at ${pos.x} ${pos.y}, rgba(${hexRgb(color)},${intensidad}) 0%, transparent 100%)`
                : 'none',
            }}
          />
        )
      })}

      {/* Ruido sutil para textura premium */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: '200px 200px',
        }}
      />
    </div>
  )
}
