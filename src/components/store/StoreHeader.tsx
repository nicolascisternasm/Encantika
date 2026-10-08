'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { obtenerCantidadTotal } from '@/lib/cart'

const JOYAS_ITEMS = [
  { label: 'Collares', href: '/catalogo?categoria=collares' },
  { label: 'Pulseras', href: '/catalogo?categoria=pulseras' },
  { label: 'Anillos', href: '/catalogo?categoria=anillos' },
]

const ACCESORIOS_ITEMS = [
  { label: 'Accesorios', href: '/catalogo?categoria=accesorios' },
  { label: 'Cinturones', href: '/catalogo?categoria=cinturones' },
]

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Contacto', href: '/contacto' },
]

export type HeaderVariant = 'default' | 'transparent' | 'hidden-scroll'

interface StoreHeaderProps {
  variant?: HeaderVariant
}

function isActive(href: string, pathname: string, search?: string) {
  if (href === '/') return pathname === '/'
  return pathname.startsWith(href)
}

export default function StoreHeader({ variant = 'default' }: StoreHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [mobileProductosOpen, setMobileProductosOpen] = useState(false)
  const [mobileJoyasOpen, setMobileJoyasOpen] = useState(false)
  const [mobileAccesoriosOpen, setMobileAccesoriosOpen] = useState(false)
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

  const linkCls = (active: boolean) => [
    'text-[12px] tracking-[.10em] uppercase transition-colors duration-200',
    active
      ? 'text-onyx border-b border-onyx pb-0.5'
      : 'text-encantika-stone hover:text-onyx',
  ].join(' ')

  const isProductosActive = pathname.startsWith('/catalogo')

  return (
    <>
      <header className={headerCls}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center">
          <Link href="/" className="sm:hidden absolute left-1/2 -translate-x-1/2">
            <Image src="/logo.png" alt="Encantika" width={398} height={110} className="h-10 w-auto" priority />
          </Link>
          <Link href="/" className="hidden sm:block shrink-0 mr-12">
            <Image src="/logo.png" alt="Encantika" width={398} height={110} className="h-12 w-auto" priority />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex flex-1 items-center justify-center gap-10">
            {NAV_LINKS.slice(0, 2).map(({ label, href }) => (
              <Link key={href} href={href} className={linkCls(isActive(href, pathname))}>
                {label}
              </Link>
            ))}

            {/* Productos dropdown */}
            <div className="group relative">
              <button
                className={[
                  'flex items-center gap-1 text-[12px] tracking-[.10em] uppercase transition-colors duration-200',
                  isProductosActive
                    ? 'text-onyx border-b border-onyx pb-0.5'
                    : 'text-encantika-stone hover:text-onyx',
                ].join(' ')}
              >
                Productos
                <svg className="w-3 h-3 mt-0.5 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Level 1 */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white border border-sand shadow-md min-w-[160px]">

                  {/* Joyas → sub-dropdown */}
                  <div className="group/joyas relative">
                    <div className="flex items-center justify-between px-4 py-2.5 hover:bg-stone-50 cursor-default select-none">
                      <span className="text-[11px] tracking-[.08em] uppercase text-encantika-stone group-hover/joyas:text-onyx transition-colors">Joyas</span>
                      <svg className="w-3 h-3 text-stone-400 flex-shrink-0 ml-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    {/* Level 2 - Joyas */}
                    <div className="absolute left-full top-0 opacity-0 invisible group-hover/joyas:opacity-100 group-hover/joyas:visible transition-all duration-150 z-50">
                      <div className="bg-white border border-sand shadow-md min-w-[150px] ml-px">
                        {JOYAS_ITEMS.map(({ label, href }) => (
                          <Link
                            key={href}
                            href={href}
                            className="block px-4 py-2.5 text-[11px] tracking-[.08em] uppercase text-encantika-stone hover:text-onyx hover:bg-stone-50 transition-colors"
                          >
                            {label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Accesorios → sub-dropdown */}
                  <div className="group/acc relative border-t border-sand/50">
                    <div className="flex items-center justify-between px-4 py-2.5 hover:bg-stone-50 cursor-default select-none">
                      <span className="text-[11px] tracking-[.08em] uppercase text-encantika-stone group-hover/acc:text-onyx transition-colors">Accesorios</span>
                      <svg className="w-3 h-3 text-stone-400 flex-shrink-0 ml-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    {/* Level 2 - Accesorios */}
                    <div className="absolute left-full top-0 opacity-0 invisible group-hover/acc:opacity-100 group-hover/acc:visible transition-all duration-150 z-50">
                      <div className="bg-white border border-sand shadow-md min-w-[150px] ml-px">
                        {ACCESORIOS_ITEMS.map(({ label, href }) => (
                          <Link
                            key={href}
                            href={href}
                            className="block px-4 py-2.5 text-[11px] tracking-[.08em] uppercase text-encantika-stone hover:text-onyx hover:bg-stone-50 transition-colors"
                          >
                            {label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {NAV_LINKS.slice(2).map(({ label, href }) => (
              <Link key={href} href={href} className={linkCls(isActive(href, pathname))}>
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

      {/* Mobile menu */}
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
            <nav className="flex flex-col px-6 py-8 gap-0 overflow-y-auto">
              <Link href="/" onClick={() => setIsOpen(false)} className={['text-sm tracking-[.10em] uppercase transition-colors py-3 border-b border-sand/40', isActive('/', pathname) ? 'text-onyx' : 'text-stone-600 hover:text-onyx'].join(' ')}>
                Home
              </Link>
              <Link href="/nosotros" onClick={() => setIsOpen(false)} className={['text-sm tracking-[.10em] uppercase transition-colors py-3 border-b border-sand/40', isActive('/nosotros', pathname) ? 'text-onyx' : 'text-stone-600 hover:text-onyx'].join(' ')}>
                Nosotros
              </Link>

              {/* Productos accordion */}
              <div className="border-b border-sand/40">
                <button
                  onClick={() => setMobileProductosOpen(v => !v)}
                  className="flex items-center justify-between w-full py-3 text-sm tracking-[.10em] uppercase text-stone-600 hover:text-onyx transition-colors"
                >
                  Productos
                  <svg className={['w-3.5 h-3.5 transition-transform duration-200', mobileProductosOpen ? 'rotate-180' : ''].join(' ')} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {mobileProductosOpen && (
                  <div className="pl-4 pb-2 space-y-0">
                    {/* Joyas */}
                    <div>
                      <button
                        onClick={() => setMobileJoyasOpen(v => !v)}
                        className="flex items-center justify-between w-full py-2 text-xs tracking-[.08em] uppercase text-stone-500 hover:text-onyx transition-colors"
                      >
                        Joyas
                        <svg className={['w-3 h-3 transition-transform duration-200 mr-1', mobileJoyasOpen ? 'rotate-180' : ''].join(' ')} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {mobileJoyasOpen && (
                        <div className="pl-3 pb-1">
                          {JOYAS_ITEMS.map(({ label, href }) => (
                            <Link key={href} href={href} onClick={() => setIsOpen(false)} className="block py-1.5 text-xs tracking-[.06em] uppercase text-stone-400 hover:text-onyx transition-colors">
                              {label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Accesorios */}
                    <div>
                      <button
                        onClick={() => setMobileAccesoriosOpen(v => !v)}
                        className="flex items-center justify-between w-full py-2 text-xs tracking-[.08em] uppercase text-stone-500 hover:text-onyx transition-colors"
                      >
                        Accesorios
                        <svg className={['w-3 h-3 transition-transform duration-200 mr-1', mobileAccesoriosOpen ? 'rotate-180' : ''].join(' ')} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {mobileAccesoriosOpen && (
                        <div className="pl-3 pb-1">
                          {ACCESORIOS_ITEMS.map(({ label, href }) => (
                            <Link key={href} href={href} onClick={() => setIsOpen(false)} className="block py-1.5 text-xs tracking-[.06em] uppercase text-stone-400 hover:text-onyx transition-colors">
                              {label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link href="/contacto" onClick={() => setIsOpen(false)} className={['text-sm tracking-[.10em] uppercase transition-colors py-3', isActive('/contacto', pathname) ? 'text-onyx' : 'text-stone-600 hover:text-onyx'].join(' ')}>
                Contacto
              </Link>
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
