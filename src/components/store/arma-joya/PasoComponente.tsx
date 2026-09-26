'use client'

import { motion } from 'framer-motion'
import type { TipoComponente, Componente } from '@/features/arma-joya/types'
import type { ConfigArmaJoya } from '@/app/actions/arma-joya-configuracion'
import OpcionComponente from './OpcionComponente'

type Props = {
  tipoComponente: TipoComponente
  opciones: Componente[]
  seleccionado: Componente | undefined
  config: ConfigArmaJoya
  onSeleccionar: (comp: Componente) => void
}

export default function PasoComponente({ tipoComponente, opciones, seleccionado, config, onSeleccionar }: Props) {
  if (opciones.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[13px]" style={{ color: 'rgba(245,240,235,0.3)' }}>
          Sin opciones disponibles
        </p>
      </div>
    )
  }

  // Layout grid: para largos (4 opciones) y signos zodiacales (12) usamos más columnas
  const isNarrow = tipoComponente.slug === 'largo' || tipoComponente.slug === 'signo_zodiacal'

  return (
    <div>
      <motion.div
        className={`grid gap-3 ${
          isNarrow ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'
        }`}
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.05 } },
          hidden: {},
        }}
      >
        {opciones.map((comp) => (
          <motion.div
            key={comp.id}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
            }}
          >
            <OpcionComponente
              comp={comp}
              seleccionado={seleccionado?.id === comp.id}
              config={config}
              onSeleccionar={() => onSeleccionar(comp)}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
