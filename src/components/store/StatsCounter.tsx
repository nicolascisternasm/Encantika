'use client'

import { useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const STATS = [
  { valor: 200, sufijo: '+', etiqueta: 'Piezas únicas' },
  { valor: 150, sufijo: '+', etiqueta: 'Clientas felices' },
  { valor: 5, sufijo: '', etiqueta: 'Años de experiencia' },
  { valor: 4, sufijo: '', etiqueta: 'Colecciones' },
]

function Counter({ end, sufijo }: { end: number; sufijo: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const steps = 50
    const delay = 1600 / steps
    let current = 0
    const increment = end / steps
    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, delay)
    return () => clearInterval(timer)
  }, [inView, end])

  return (
    <span ref={ref}>
      {count}{sufijo}
    </span>
  )
}

export default function StatsCounter() {
  return (
    <section
      className="py-16 px-6"
      style={{ backgroundColor: 'var(--color-tarjeta, #F5F0EB)' }}
    >
      <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-10 text-center">
        {STATS.map((s) => (
          <div key={s.etiqueta}>
            <p
              className="font-display text-5xl font-normal tabular-nums"
              style={{ color: 'var(--color-acento, #C9A035)' }}
            >
              <Counter end={s.valor} sufijo={s.sufijo} />
            </p>
            <p
              className="mt-2 text-[11px] uppercase tracking-[.12em]"
              style={{ color: 'var(--color-texto-suave, #666)' }}
            >
              {s.etiqueta}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
