'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { obtenerCantidadTotal } from '@/lib/cart'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Joyas', href: '/catalogo' },
  { label: 'Contacto', href: '/contacto' },
]

export type HeaderVariant = 'default' | 'transparent' | 'hidden-scroll'

interface StoreHeaderProps {
  variant?: HeaderVariant
}

function isActive(href: string, pathname: string) {
  if (href === '/') return pathname === '/'
  return pathname.startsWith(href)
}

export default function StoreHeader({ variant = 'default' }: StoreHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const pathname = usePathname()

  const effectiveVariant: HeaderVariant = pathname === '/' ? variant : 'default'

  useEffect(() => {
    if (effectiveVariant === 'transparent' || effectiveVariant === 'hidden-scroll') {
      const onScroll = () => setScrolled(window.scrollY > 50)
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }
  }, [effectiveVariant])

  useEffect(() => {
    const actualizar = () => setCartCount(obtenerCantidadTotal())
    actualizar()
    window.addEventListener('carritoActualizado', actualizar)
    return () => window.removeEventListener('carritoActualizado', actualizar)
  }, [])

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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 h-24 sm:h-28 flex items-center">
          <Link href="/" className="sm:hidden absolute left-1/2 -translate-x-1/2">
            <Image src="/logo.png" alt="Encantika" width={300} height={300} className="h-20 w-auto" priority />
          </Link>
          <Link href="/" className="hidden sm:block shrink-0 mr-12">
            <Image src="/logo.png" alt="Encantika" width={300} height={300} className="h-28 w-auto" priority />
          </Link>
          <nav className="hidden sm:flex flex-1 items-center justify-center gap-10">
            {NAV_LINKS.map(({ label, href }) => {
              const active = isActive(href, pathname)
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    'text-[12px] tracking-[.10em] uppercase transition-colors duration-200',
                    active
                      ? 'text-onyx border-b border-onyx pb-0.5'
                      : 'text-encantika-stone hover:text-onyx',
                  ].join(' ')}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
          <div className="flex-1 sm:hidden" />
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="hidden sm:flex p-1.5 text-encantika-stone hover:text-onyx transition-colors" aria-label="Buscar">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="M15.5 15.5 L20 20" strokeLinecap="round" />
              </svg>
            </button>
            <Link href="/administracion" className="hidden sm:flex p-1.5 text-encantika-stone hover:text-onyx transition-colors opacity-40 hover:opacity-100" aria-label="Administración">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
              </svg>
            </Link>
            <Link href="/carrito" className="flex p-1.5 text-encantika-stone hover:text-onyx transition-colors relative" aria-label="Carrito">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path d="M6 2 L3 6 v14 a2 2 0 0 0 2 2 h14 a2 2 0 0 0 2-2 V6 l-3-4 z" strokeLinejoin="round" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10 a4 4 0 0 1-8 0" strokeLinecap="round" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-onyx text-ivory text-[9px] font-medium flex items-center justify-center rounded-full leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
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
              <Image src="/logo.png" alt="Encantika" width={120} height={30} className="h-9 w-auto" />
              <button onClick={() => setIsOpen(false)} className="p-1.5 text-encantika-stone" aria-label="Cerrar menú">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                  <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col px-6 py-8 gap-6">
              {NAV_LINKS.map(({ label, href }) => {
                const active = isActive(href, pathname)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={[
                      'text-sm tracking-[.10em] uppercase transition-colors',
                      active ? 'text-onyx' : 'text-stone-600 hover:text-onyx',
                    ].join(' ')}
                  >
                    {label}
                  </Link>
                )
              })}
            </nav>
            <div className="mt-auto px-6 pb-8">
              <Link href="/administracion" onClick={() => setIsOpen(false)}
                className="inline-flex p-1 text-stone-300 hover:text-stone-600 transition-colors" aria-label="Administración">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
