'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Catálogo', href: '/catalogo' },
  { label: 'Colecciones', href: '/colecciones' },
  { label: 'Arma tu joya', href: '/arma-tu-joya' },
]

export default function StoreHeader() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-sand">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center">

          {/* Mobile: logo absoluto centrado */}
          <Link href="/" className="sm:hidden absolute left-1/2 -translate-x-1/2">
            <Image src="/logo.png" alt="Encantika" width={200} height={50} className="h-8 w-auto" priority />
          </Link>

          {/* Desktop: logo izquierda */}
          <Link href="/" className="hidden sm:block shrink-0 mr-12">
            <Image src="/logo.png" alt="Encantika" width={200} height={50} className="h-10 w-auto" priority />
          </Link>

          {/* Desktop: navegación centrada */}
          <nav className="hidden sm:flex flex-1 items-center justify-center gap-10">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-xs tracking-[.10em] uppercase text-encantika-stone hover:text-onyx transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Spacer mobile para empujar hamburger a la derecha */}
          <div className="flex-1 sm:hidden" />

          {/* Íconos derecha */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Búsqueda — solo desktop */}
            <button
              className="hidden sm:flex p-1.5 text-encantika-stone hover:text-onyx transition-colors"
              aria-label="Buscar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="M15.5 15.5 L20 20" strokeLinecap="round" />
              </svg>
            </button>

            {/* Carrito — solo desktop */}
            <button
              className="hidden sm:flex p-1.5 text-encantika-stone hover:text-onyx transition-colors relative"
              aria-label="Carrito"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path d="M6 2 L3 6 v14 a2 2 0 0 0 2 2 h14 a2 2 0 0 0 2-2 V6 l-3-4 z" strokeLinejoin="round" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10 a4 4 0 0 1-8 0" strokeLinecap="round" />
              </svg>
            </button>

            {/* Hamburger — solo mobile */}
            <button
              className="sm:hidden p-1.5 text-onyx"
              onClick={() => setIsOpen(true)}
              aria-label="Abrir menú"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
                <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
                <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white flex flex-col">
            {/* Header del drawer */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-sand">
              <Image src="/logo.png" alt="Encantika" width={120} height={30} className="h-7 w-auto" />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-encantika-stone"
                aria-label="Cerrar menú"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                  <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Links */}
            <nav className="flex flex-col px-6 py-8 gap-6">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className="text-sm tracking-[.10em] uppercase text-onyx hover:text-encantika-stone transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Footer drawer */}
            <div className="mt-auto px-6 pb-8">
              <Link
                href="/administracion"
                onClick={() => setIsOpen(false)}
                className="text-[11px] text-encantika-stone hover:text-onyx transition-colors"
              >
                Administración
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
