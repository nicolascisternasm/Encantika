'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCLP } from '@/lib/utils'
import {
  obtenerCarrito,
  actualizarCantidad,
  eliminarDelCarrito,
  type CartItem,
} from '@/lib/cart'
import type { ProductoCard } from './page'

interface Props {
  whatsapp: string | null
  candidatos: ProductoCard[]
}

// ── Ilustración SVG bolsa vacía ────────────────────────────────────────────────

function BolsaIlustracion() {
  return (
    <svg width="120" height="120" viewBox="0 0 100 100" fill="none" aria-hidden>
      {/* cuerpo de la bolsa */}
      <path
        d="M14 43 L7 38 V88 C7 91 10 94 13 94 H87 C90 94 93 91 93 88 V38 L86 43 Z"
        fill="#FBF5EC"
        stroke="#C9A035"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* franja horizontal */}
      <line x1="7" y1="52" x2="93" y2="52" stroke="#C9A035" strokeWidth="1" strokeOpacity="0.35" />
      {/* asa */}
      <path
        d="M35 43 C35 24 65 24 65 43"
        stroke="#C9A035"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* corazón */}
      <path
        d="M50 79 C49 78 34 69 34 61 C34 55 40 53 45 57 C47.5 59 50 62 50 62 C50 62 52.5 59 55 57 C60 53 66 55 66 61 C66 69 51 78 50 79 Z"
        fill="#C9A035"
        fillOpacity="0.7"
      />
    </svg>
  )
}

// ── Panel de resumen (solo desktop) ───────────────────────────────────────────

function PanelResumen({
  subtotal,
  whatsapp,
}: {
  subtotal: number
  whatsapp: string | null
}) {
  return (
    <div className="border border-stone-200 p-6 space-y-5 sticky top-24">
      <h2 className="text-[11px] uppercase tracking-[.15em] text-stone-500">
        Resumen del pedido
      </h2>

      {/* Líneas subtotal / envío */}
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between text-stone-700">
          <span>Subtotal</span>
          <span>{formatCLP(subtotal)}</span>
        </div>
        <div className="flex justify-between text-stone-400">
          <span>Envío</span>
          <span>Por calcular</span>
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-stone-200 pt-4">
        <div className="flex justify-between text-stone-800">
          <span className="font-medium">Total</span>
          <span className="font-medium">{formatCLP(subtotal)}</span>
        </div>
      </div>

      <Link
        href="/checkout"
        className="block w-full py-4 text-center text-xs tracking-[.15em] uppercase font-medium bg-onyx text-ivory hover:bg-[var(--color-acento,#C9A035)] transition-colors duration-200"
      >
        Proceder al checkout
      </Link>

      <Link
        href="/catalogo"
        className="block text-center text-[11px] uppercase tracking-[.12em] text-stone-400 hover:text-stone-700 transition-colors"
      >
        Seguir comprando
      </Link>

      {/* Métodos de pago */}
      <div className="pt-4 border-t border-stone-100">
        <p className="text-[10px] uppercase tracking-[.10em] text-stone-400 mb-3">
          Pagos seguros con
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1 text-[11px] text-stone-500 border border-stone-100 rounded px-2 py-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            Tarjetas
          </span>
          <span className="flex items-center gap-1 text-[11px] text-stone-500 border border-stone-100 rounded px-2 py-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <polyline points="3 9 12 2 21 9" />
              <path d="M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" />
              <line x1="9" y1="22" x2="9" y2="14" />
              <line x1="15" y1="22" x2="15" y2="14" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
            Débito
          </span>
          <span className="flex items-center gap-1 text-[11px] text-stone-500 border border-stone-100 rounded px-2 py-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <line x1="12" y1="18" x2="12" y2="18" strokeLinecap="round" strokeWidth={2.5} />
            </svg>
            Mercado Pago
          </span>
        </div>
      </div>

      {/* WhatsApp */}
      {whatsapp && (
        <div className="pt-4 border-t border-stone-100">
          <p className="text-[10px] uppercase tracking-[.10em] text-stone-400 mb-2.5">
            ¿Necesitas ayuda?
          </p>
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition-colors"
          >
            <svg className="w-4 h-4 text-green-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.463 3.48 11.815 11.815 0 0 0 12.05 0zm0 21.784h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26C2.169 6.89 6.604 2.456 12.054 2.456c2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884z" opacity=".9" />
              <path d="M9.069 7.547c-.194-.433-.399-.442-.583-.45-.151-.007-.323-.007-.495-.007-.173 0-.453.065-.69.324-.237.26-.905.883-.905 2.154 0 1.27.926 2.497 1.055 2.669.13.173 1.797 2.856 4.416 3.893 2.185.862 2.63.69 3.103.647.474-.043 1.528-.626 1.743-1.23.215-.604.215-1.122.151-1.231-.065-.108-.237-.173-.495-.303-.259-.13-1.528-.754-1.765-.84-.237-.086-.409-.13-.582.13-.172.26-.668.84-.819 1.014-.151.173-.302.195-.56.065-.259-.13-1.09-.402-2.078-1.282-.768-.685-1.287-1.531-1.438-1.791-.151-.26-.016-.4.113-.53.116-.116.259-.303.388-.454.13-.151.173-.26.26-.433.086-.173.043-.325-.022-.455-.064-.13-.575-1.403-.797-1.91z" />
            </svg>
            Escríbenos por WhatsApp
          </a>
        </div>
      )}

      {/* Íconos de confianza */}
      <div className="pt-4 border-t border-stone-100">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            <span className="text-[9px] uppercase tracking-[.08em] text-stone-400 leading-tight">
              Pago seguro
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M21 16V8a2 2 0 0 0-1-1.73L12 2 4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L12 22l8-4.27A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span className="text-[9px] uppercase tracking-[.08em] text-stone-400 leading-tight">
              Envío a Chile
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span className="text-[9px] uppercase tracking-[.08em] text-stone-400 leading-tight">
              Devoluciones
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function CarritoClient({ whatsapp, candidatos }: Props) {
  const [mounted, setMounted] = useState(false)
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    setItems(obtenerCarrito())
    setMounted(true)
  }, [])

  if (!mounted) return null

  function handleCantidad(productoId: string, delta: number) {
    const item = items.find(i => i.productoId === productoId)
    if (!item) return
    actualizarCantidad(productoId, item.cantidad + delta)
    setItems(obtenerCarrito())
  }

  function handleEliminar(productoId: string) {
    eliminarDelCarrito(productoId)
    setItems(obtenerCarrito())
  }

  const subtotal = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0)
  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0)

  const cartIds = new Set(items.map(i => i.productoId))
  const recomendados = candidatos.filter(p => !cartIds.has(p.id)).slice(0, 4)

  // ── Estado vacío ─────────────────────────────────────────────────────────────

  if (items.length === 0) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <BolsaIlustracion />
        <h1 className="font-display text-[32px] font-normal text-stone-800 mt-6 mb-3">
          Tu carrito está vacío
        </h1>
        <p className="text-sm text-stone-500 mb-8 max-w-xs leading-relaxed">
          Descubre nuestras joyas y encuentra la pieza perfecta para ti.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/catalogo"
            className="px-8 py-4 text-xs tracking-[.15em] uppercase font-medium bg-onyx text-ivory hover:bg-[var(--color-acento,#C9A035)] transition-colors duration-200"
          >
            Ver colección
          </Link>
          <Link
            href="/arma-tu-joya"
            className="px-8 py-4 text-xs tracking-[.15em] uppercase font-medium border border-stone-300 text-stone-700 hover:border-onyx hover:text-onyx transition-colors duration-200"
          >
            Arma tu joya
          </Link>
        </div>
      </main>
    )
  }

  // ── Carrito con productos ────────────────────────────────────────────────────

  return (
    <>
      <main className="bg-ivory px-6 sm:px-8 py-10 max-w-6xl mx-auto pb-32 md:pb-16 min-h-screen">
        <h1 className="font-display text-[40px] font-normal text-stone-800 mb-1">Carrito</h1>
        <p className="text-sm text-stone-500 mb-10">
          {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          {/* ── Lista de items ── */}
          <div className="md:col-span-2">
            {items.map((item, idx) => (
              <div
                key={item.productoId}
                className={`flex gap-5 py-7 ${idx < items.length - 1 ? 'border-b border-stone-100' : ''}`}
              >
                {/* Imagen 100×100 */}
                <div className="w-[100px] h-[100px] shrink-0 bg-stone-100 overflow-hidden">
                  {item.imagenUrl ? (
                    <img
                      src={item.imagenUrl}
                      alt={item.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-stone-100 to-stone-200" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {/* Nombre + botón eliminar */}
                  <div className="flex justify-between items-start gap-2">
                    <Link
                      href={item.slug ? `/catalogo/${item.slug}` : '/catalogo'}
                      className="font-display text-[18px] leading-snug text-stone-800 hover:text-stone-500 transition-colors"
                    >
                      {item.nombre}
                    </Link>
                    <button
                      onClick={() => handleEliminar(item.productoId)}
                      className="shrink-0 p-0.5 text-stone-300 hover:text-stone-600 transition-colors mt-1"
                      aria-label="Eliminar producto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                        <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>

                  {/* Características (máx 2) */}
                  {item.caracteristicas.length > 0 && (
                    <p className="text-[12px] text-stone-400 mt-1 leading-relaxed">
                      {item.caracteristicas.slice(0, 2).map(c => `${c.nombre}: ${c.valor}`).join(' · ')}
                    </p>
                  )}

                  {/* Precio unitario */}
                  <p className="text-[13px] text-stone-500 mt-2">
                    {formatCLP(item.precio)} c/u
                  </p>

                  {/* Controles ± y subtotal */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleCantidad(item.productoId, -1)}
                        disabled={item.cantidad <= 1}
                        className="w-8 h-8 rounded-full border border-sand flex items-center justify-center text-stone-500 hover:text-stone-800 hover:border-stone-400 disabled:opacity-30 transition-colors select-none"
                        aria-label="Reducir cantidad"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm text-stone-800 select-none tabular-nums">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => handleCantidad(item.productoId, +1)}
                        disabled={item.cantidad >= 10}
                        className="w-8 h-8 rounded-full border border-sand flex items-center justify-center text-stone-500 hover:text-stone-800 hover:border-stone-400 disabled:opacity-30 transition-colors select-none"
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-[15px] font-medium text-onyx tabular-nums">
                      {formatCLP(item.precio * item.cantidad)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Panel resumen (solo desktop) ── */}
          <div className="md:col-span-1 hidden md:block">
            <PanelResumen subtotal={subtotal} whatsapp={whatsapp} />
          </div>
        </div>

        {/* También te puede gustar */}
        {recomendados.length > 0 && (
          <section className="mt-16 border-t border-stone-100 pt-12">
            <h2 className="font-display text-[28px] font-normal text-stone-800 mb-8">
              También te puede gustar
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {recomendados.map(p => (
                <Link key={p.id} href={`/catalogo/${p.slug}`} className="group">
                  <div className="aspect-square overflow-hidden bg-stone-100">
                    {p.imagen ? (
                      <img
                        src={p.imagen}
                        alt={p.nombre}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-stone-100 to-stone-200" />
                    )}
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <p className="text-sm text-stone-800 group-hover:text-stone-500 transition-colors leading-snug">
                      {p.nombre}
                    </p>
                    <p className="text-sm text-stone-500">{formatCLP(p.precio_base)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Barra sticky mobile */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-sm border-t border-sand shadow-[0_-4px_24px_rgba(0,0,0,0.07)] px-5 py-3 z-40">
        <div className="flex items-center justify-between gap-4">
          <div className="shrink-0">
            <p className="text-[10px] uppercase tracking-[.10em] text-stone-400 leading-tight">Total</p>
            <p className="text-[17px] font-medium text-stone-800 tabular-nums leading-tight">
              {formatCLP(subtotal)}
            </p>
          </div>
          <Link
            href="/checkout"
            className="flex-1 py-3.5 text-center text-xs tracking-[.15em] uppercase font-medium bg-onyx text-ivory hover:bg-[var(--color-acento,#C9A035)] transition-colors duration-200"
          >
            Proceder al checkout
          </Link>
        </div>
      </div>
    </>
  )
}
