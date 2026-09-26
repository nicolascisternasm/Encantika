'use client'

import { motion } from 'framer-motion'
import type { TipoJoya, Componente, ConfiguradorSelecciones } from '@/features/arma-joya/types'

type Props = {
  tipoJoya: TipoJoya
  selecciones: ConfiguradorSelecciones
  configuracionId: string
  nombreReceptor: string
  esRegalo: boolean
  tarjetaTexto: string
  onNuevaJoya: () => void
  onCerrar?: () => void
}

export default function PasoConfirmacion({
  tipoJoya,
  selecciones,
  configuracionId,
  nombreReceptor,
  onCerrar,
  esRegalo,
  tarjetaTexto,
  onNuevaJoya,
}: Props) {
  const componentes = Object.values(selecciones).filter(Boolean) as Componente[]
  const precioTotal = componentes.reduce((s, c) => s + c.precio, 0)
  const idCorto = configuracionId.slice(0, 8).toUpperCase()

  return (
    <div
      className="relative min-h-full flex flex-col items-center justify-center px-5 py-16"
      style={{ background: '#0C0A08' }}
    >
      {/* Halo de fondo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(201,160,53,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8">

        {/* Ícono de confirmación */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(201,160,53,0.12)', border: '1px solid rgba(201,160,53,0.3)' }}
        >
          <svg className="w-7 h-7" fill="none" stroke="rgba(201,160,53,0.9)" strokeWidth={1.5} viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>

        {/* Título */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2
            className="font-normal leading-tight mb-2"
            style={{ fontSize: 'clamp(26px, 6vw, 38px)', color: '#F5F0EB', fontFamily: 'var(--font-titulos)' }}
          >
            {esRegalo ? `Un regalo para ${nombreReceptor || 'alguien especial'}` : '¡Tu joya está lista!'}
          </h2>
          <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(245,240,235,0.4)' }}>
            Recibimos tu diseño. Nos pondremos en contacto contigo para coordinar el pago y la entrega.
          </p>
        </motion.div>

        {/* Número de pedido */}
        <motion.div
          className="w-full p-4 text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <p className="text-[10px] uppercase tracking-[.2em] mb-1" style={{ color: 'rgba(245,240,235,0.25)' }}>
            Número de pedido
          </p>
          <p className="text-[22px] font-mono tracking-widest" style={{ color: 'rgba(201,160,53,0.8)' }}>
            #{idCorto}
          </p>
          <p className="text-[10px] mt-1" style={{ color: 'rgba(245,240,235,0.2)' }}>
            Guarda este número para hacer seguimiento
          </p>
        </motion.div>

        {/* Resumen */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          <p className="text-[10px] uppercase tracking-[.15em] mb-3" style={{ color: 'rgba(245,240,235,0.2)' }}>
            {tipoJoya.nombre} · {componentes.length} {componentes.length === 1 ? 'componente' : 'componentes'}
          </p>
          <div className="flex flex-col gap-1.5">
            {componentes.map((c) => (
              <div key={c.id} className="flex justify-between">
                <span className="text-[12px]" style={{ color: 'rgba(245,240,235,0.45)' }}>{c.nombre}</span>
                {c.precio > 0 && (
                  <span className="text-[12px]" style={{ color: 'rgba(201,160,53,0.6)' }}>
                    ${c.precio.toLocaleString('es-CL')}
                  </span>
                )}
              </div>
            ))}
            <div className="h-px mt-2 mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="flex justify-between items-center">
              <span className="text-[11px] uppercase tracking-[.1em]" style={{ color: 'rgba(245,240,235,0.3)' }}>
                Total
              </span>
              <span className="text-base" style={{ color: '#F5F0EB', fontFamily: 'var(--font-titulos)' }}>
                ${precioTotal.toLocaleString('es-CL')}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tarjeta si viene */}
        {tarjetaTexto && (
          <motion.div
            className="w-full p-4 relative"
            style={{ border: '1px solid rgba(201,160,53,0.15)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
          >
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2" style={{ background: '#0C0A08' }}>
              <span className="text-[10px] uppercase tracking-[.15em]" style={{ color: 'rgba(201,160,53,0.4)' }}>
                Tu tarjeta
              </span>
            </div>
            <p className="text-[12px] leading-relaxed italic text-center" style={{ color: 'rgba(245,240,235,0.5)' }}>
              "{tarjetaTexto}"
            </p>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          className="w-full flex flex-col gap-3 pt-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.4 }}
        >
          <button
            onClick={onNuevaJoya}
            className="w-full py-4 text-[13px] uppercase tracking-[.16em] font-medium transition-all duration-200"
            style={{ background: 'rgba(201,160,53,0.9)', color: '#0C0A08' }}
          >
            Crear otra joya
          </button>
          {onCerrar ? (
            <button
              onClick={onCerrar}
              className="w-full py-3 text-[12px] uppercase tracking-[.12em] text-center transition-all duration-200"
              style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(245,240,235,0.4)' }}
            >
              Volver al inicio
            </button>
          ) : (
            <a
              href="/"
              className="w-full py-3 text-[12px] uppercase tracking-[.12em] text-center transition-all duration-200"
              style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(245,240,235,0.4)' }}
            >
              Volver al inicio
            </a>
          )}
        </motion.div>
      </div>
    </div>
  )
}
