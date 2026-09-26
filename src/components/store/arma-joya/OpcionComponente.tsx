'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCLP } from '@/lib/utils'
import type { Componente } from '@/features/arma-joya/types'
import type { ConfigArmaJoya } from '@/app/actions/arma-joya-configuracion'

type Props = {
  comp: Componente
  seleccionado: boolean
  config: ConfigArmaJoya
  ocultarHolistica?: boolean
  onSeleccionar: () => void
  onHover?: (comp: Componente | null) => void
}

export default function OpcionComponente({ comp, seleccionado, config, ocultarHolistica, onSeleccionar, onHover }: Props) {
  const [expandido, setExpandido] = useState(false)
  const hasHolistica = Boolean(comp.desc_holistica) && !ocultarHolistica

  return (
    <motion.div
      layout
      className="relative overflow-hidden cursor-pointer select-none"
      style={{
        background: seleccionado ? 'rgba(201,160,53,0.1)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${seleccionado ? 'rgba(201,160,53,0.55)' : 'rgba(255,255,255,0.08)'}`,
        transition: 'background 0.25s, border-color 0.25s',
      }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => onHover?.(comp)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => { onSeleccionar(); setExpandido(false) }}
    >
      {/* Indicador de seleccionado */}
      {seleccionado && (
        <motion.div
          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(201,160,53,0.9)' }}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      )}

      {/* Imagen o placeholder de color */}
      <div
        className="w-full aspect-square relative overflow-hidden"
        style={{
          background: comp.url_imagen
            ? undefined
            : `linear-gradient(135deg, ${comp.color_primario ?? '#2a2520'} 0%, ${comp.color_secundario ?? '#1a1512'} 100%)`,
        }}
      >
        {comp.url_imagen ? (
          <img src={comp.url_imagen} alt={comp.nombre}
            className="w-full h-full object-cover" />
        ) : (
          // Placeholder visual basado en el tipo/color del componente
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full opacity-30"
              style={{ background: comp.color_acento ?? comp.color_primario ?? '#C9A035' }} />
          </div>
        )}
        {/* Glow del color al seleccionar */}
        {seleccionado && (
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 50% 100%, ${comp.color_primario ?? 'rgba(201,160,53,0.2)'}22 0%, transparent 70%)` }} />
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <p className="text-[12px] leading-tight font-medium"
          style={{ color: seleccionado ? '#F5F0EB' : 'rgba(245,240,235,0.75)' }}>
          {comp.nombre}
        </p>
        {config.mostrar_descripcion && comp.descripcion && (
          <p className="text-[10px] mt-0.5 leading-snug" style={{ color: 'rgba(245,240,235,0.4)' }}>
            {comp.descripcion}
          </p>
        )}
        {config.mostrar_precio && comp.precio > 0 && (
          <p className="text-[11px] mt-0.5" style={{ color: 'rgba(201,160,53,0.8)' }}>
            {formatCLP(comp.precio)}
          </p>
        )}

        {/* Botón holística */}
        {hasHolistica && (
          <button
            className="mt-2 flex items-center gap-1 text-[10px] uppercase tracking-[.1em]"
            style={{ color: 'rgba(245,240,235,0.3)' }}
            onClick={(e) => { e.stopPropagation(); setExpandido(!expandido) }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
            </svg>
            Significado
          </button>
        )}
      </div>

      {/* Descripción holística expandible */}
      <AnimatePresence>
        {expandido && comp.desc_holistica && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0">
              <div className="h-px mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <p className="text-[11px] leading-relaxed italic" style={{ color: 'rgba(245,240,235,0.45)' }}>
                {comp.desc_holistica}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
