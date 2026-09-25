'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { obtenerCantidadTotal } from '@/lib/cart'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Joyas', href: '/catalogo' },
  { label: 'Contacto', href: '/contacto' },
]

function isActive(href: string, pathname: string) {
  if (href === '/') return pathname === '/'
  return pathname.startsWith(href)
}

export default function StoreSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const actualizar = () => setCartCount(obtenerCantidadTotal())
    actualizar()
    window.addEventListener('carritoActualizado', actualizar)
    return () => window.removeEventListener('carritoActualizado', actualizar)
  }, [])

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden sm:flex w-64 h-screen sticky top-0 bg-white border-r border-sand flex-col py-10 px-7 shrink-0 z-40">
        <Link href="/" className="mb-14">
          <Image src="/logo.png" alt="Encantika" width={140} height={36} className="h-8 w-auto" priority />
        </Link>

        <nav className="flex flex-col gap-5">
          {NAV_LINKS.map(({ label, href }) => {
            const active = isActive(href, pathname)
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'text-[12px] tracking-[.10em] uppercase transition-colors duration-200',
                  active ? 'text-onyx' : 'text-encantika-stone hover:text-onyx',
                ].join(' ')}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto flex gap-3">
          <button className="p-1.5 text-encantika-stone hover:text-onyx transition-colors" aria-label="Buscar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M15.5 15.5 L20 20" strokeLinecap="round" />
            </svg>
          </button>
          <Link href="/carrito" className="p-1.5 text-encantika-stone hover:text-onyx transition-colors relative" aria-label="Carrito">
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
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sm:hidden sticky top-0 z-50 bg-white border-b border-sand">
        <div className="relative h-16 flex items-center px-4">
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <Image src="/logo.png" alt="Encantika" width={200} height={50} className="h-8 w-auto" priority />
          </Link>
          <div className="flex-1" />
          <button
            className="p-1.5 text-onyx"
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
      </header>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white flex flex-col">
            <div className="flex items-center justify-between px-6 h-16 border-b border-sand">
              <Image src="/logo.png" alt="Encantika" width={120} height={30} className="h-7 w-auto" />
              <button onClick={() => setIsOpen(false)} className="p-1.5 text-encantika-stone" aria-label="Cerrar">
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
              <Link href="/carrito" onClick={() => setIsOpen(false)}
                className="text-sm tracking-[.10em] uppercase text-stone-600 hover:text-onyx transition-colors flex items-center gap-2">
                Carrito
                {cartCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-0.5 bg-onyx text-ivory text-[9px] font-medium flex items-center justify-center rounded-full leading-none">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
