'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function PageLoader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const hide = () => setTimeout(() => setVisible(false), 200)

    if (document.readyState === 'complete') {
      hide()
    } else {
      window.addEventListener('load', hide, { once: true })
    }

    // Fallback: máximo 3 segundos aunque no cargue todo
    const fallback = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(fallback)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8"
          style={{ backgroundColor: 'var(--color-fondo, #FAF7F2)' }}
        >
          <Image
            src="/logo.png"
            alt="Encantika"
            width={398}
            height={110}
            className="h-10 w-auto opacity-90"
            priority
          />

          {/* Círculo animado */}
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            {/* Track gris claro */}
            <circle
              cx="22" cy="22" r="18"
              stroke="var(--color-borde, #E8E2DB)"
              strokeWidth="1.5"
            />
            {/* Arco dorado girando */}
            <motion.circle
              cx="22" cy="22" r="18"
              stroke="var(--color-acento, #C9A035)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="30 83"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.1, ease: 'linear', repeat: Infinity }}
              style={{ transformOrigin: '22px 22px' }}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
