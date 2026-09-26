'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

const ease = [0.22, 1, 0.36, 1] as const

interface Props {
  heroUrl: string | null
  heroPos: string
}

export default function LandingHero({ heroUrl, heroPos }: Props) {
  return (
    <section className="flex flex-col md:flex-row min-h-[100svh]">
      {/* Imagen izquierda */}
      <motion.div
        className="relative w-full md:w-[55%] overflow-hidden"
        style={{ minHeight: 'clamp(280px, 45vw, 600px)' }}
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.3, ease }}
      >
        <Image
          src={heroUrl ?? '/hero-1.jpg'}
          alt="Encantika — Brilla con magia"
          fill
          className="object-cover animate-kenburns"
          style={{ objectPosition: heroPos, animationDelay: '1.3s' }}
          sizes="(max-width: 768px) 100vw, 55vw"
          priority
          unoptimized={!!heroUrl}
        />
      </motion.div>

      {/* Texto derecha */}
      <div
        className="w-full md:w-[45%] flex flex-col justify-center px-10 md:px-16 py-16 md:py-0"
        style={{ backgroundColor: 'var(--color-fondo, #FFFDF9)' }}
      >
        <motion.p
          className="text-[11px] tracking-[.20em] uppercase mb-5"
          style={{ color: 'var(--color-acento, #C9A035)' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.3, ease }}
        >
          Joyería artesanal chilena
        </motion.p>

        <motion.h1
          className="font-display font-normal leading-[1.05] tracking-[.06em] text-5xl sm:text-6xl"
          style={{ color: 'var(--color-texto, #1a1a1a)' }}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease }}
        >
          Brilla con magia
        </motion.h1>

        <motion.p
          className="mt-5 text-[15px] leading-relaxed max-w-sm"
          style={{ color: 'var(--color-texto-suave, #666)' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.6, ease }}
        >
          Piezas únicas creadas con amor para los momentos que importan
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-3 mt-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.75, ease }}
        >
          <Link
            href="/catalogo"
            className="inline-block border text-xs tracking-[.12em] uppercase px-8 py-3 transition-all duration-300 hover:opacity-70"
            style={{ borderColor: 'var(--color-texto)', color: 'var(--color-texto)' }}
          >
            Ver colección
          </Link>
          <Link
            href="/arma-tu-joya"
            className="inline-block text-xs tracking-[.12em] uppercase px-8 py-3 transition-all duration-300 hover:opacity-70"
            style={{
              backgroundColor: 'var(--color-acento, #C9A035)',
              color: '#fff',
            }}
          >
            Arma tu joya
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
