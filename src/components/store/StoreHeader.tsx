'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Catálogo', href: '/catalogo' },
  { label: 'Colecciones', href: '/colecciones' },
  { label: 'Arma tu joya', href: '/arma-tu-joya' },
]

export type HeaderVariant = 'default' | 'transparent' | 'hidden-scroll'

interface StoreHeaderProps {
  variant?: HeaderVariant
}

export default function StoreHeader({ variant = 'default' }: StoreHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  // Solo aplica efectos de scroll en la home
  const effectiveVariant: HeaderVariant = pathname === '/' ? variant : 'default'

  useEffect(() => {
    if (effectiveVariant === 'transparent' || effectiveVariant === 'hidden-scroll') {
      const onScroll = () => setScrolled(window.scrollY > 50)
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }
  }, [effectiveVariant])

  const isTransparentNow = effectiveVariant === 'transparent' && !scrolled
  const isHiddenNow = effectiveVariant === 'hidden-scroll' && !scrolled

  const headerCls = [
    effectiveVariant === 'hidden-scroll' ? 'sticky top-0 z-50 transition-opacity duration-300' : 'sticky top-0 z-50',
    isHiddenNow ? 'opacity-0 pointer-events-none' : '',
    isTransparentNow
      ? 'bg-transparent border-b border-transparent transition-all duration-300'
      : 'bg-white border-b border-sand',
  ].join(' ')

  return (
    <>
      <header className={headerCls}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center">
          <Link href="/" className="sm:hidden absolute left-1/2 -translate-x-1/2">
            <Image src="/logo.png" alt="Encantika" width={200} height={50} className="h-8 w-auto" priority />
          </Link>
          <Link href="/" className="hidden sm:block shrink-0 mr-12">
            <Image src="/logo.png" alt="Encantika" width={200} height={50} className="h-10 w-auto" priority />
          </Link>
          <nav className="hidden sm:flex flex-1 items-center justify-center gap-10">
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={href} href={href}
                className="text-xs tracking-[.10em] uppercase text-encantika-stone hover:text-onyx transition-colors duration-200">
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex-1 sm:hidden" />
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="hidden sm:flex p-1.5 text-encantika-stone hover:text-onyx transition-colors" aria-label="Buscar">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="M15.5 15.5 L20 20" strokeLinecap="round" />
              </svg>
            </button>
            <button className="hidden sm:flex p-1.5 text-encantika-stone hover:text-onyx transition-colors relative" aria-label="Carrito">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path d="M6 2 L3 6 v14 a2 2 0 0 0 2 2 h14 a2 2 0 0 0 2-2 V6 l-3-4 z" strokeLinejoin="round" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10 a4 4 0 0 1-8 0" strokeLinecap="round" />
              </svg>
            </button>
            <button className="sm:hidden p-1.5 text-onyx" onClick={() => setIsOpen(true)} aria-label="Abrir menú">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
                <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
                <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white flex flex-col">
            <div className="flex items-center justify-between px-6 h-16 border-b border-sand">
              <Image src="/logo.png" alt="Encantika" width={120} height={30} className="h-7 w-auto" />
              <button onClick={() => setIsOpen(false)} className="p-1.5 text-encantika-stone" aria-label="Cerrar menú">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                  <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col px-6 py-8 gap-6">
              {NAV_LINKS.map(({ label, href }) => (
                <Link key={href} href={href} onClick={() => setIsOpen(false)}
                  className="text-sm tracking-[.10em] uppercase text-onyx hover:text-encantika-stone transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto px-6 pb-8">
              <Link href="/administracion" onClick={() => setIsOpen(false)}
                className="text-[11px] text-encantika-stone hover:text-onyx transition-colors">
                Administración
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
