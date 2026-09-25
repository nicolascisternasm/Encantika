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

export default function CarritoPage() {
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

  if (items.length === 0) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <svg
          className="w-12 h-12 text-stone-300 mb-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          viewBox="0 0 24 24"
        >
          <path d="M6 2 L3 6 v14 a2 2 0 0 0 2 2 h14 a2 2 0 0 0 2-2 V6 l-3-4 z" strokeLinejoin="round" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10 a4 4 0 0 1-8 0" strokeLinecap="round" />
        </svg>
        <h1 className="font-display text-[32px] font-normal text-stone-800 mb-3">
          Tu carrito está vacío
        </h1>
        <p className="text-sm text-stone-500 mb-8 max-w-sm leading-relaxed">
          Descubre nuestras joyas artesanales y agrega las que más te gusten.
        </p>
        <Link
          href="/catalogo"
          className="text-xs uppercase tracking-[.15em] text-stone-500 hover:text-stone-800 transition-colors border-b border-stone-300 hover:border-stone-700 pb-0.5"
        >
          Ver catálogo
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-ivory px-6 sm:px-8 py-10 max-w-6xl mx-auto">
      <h1 className="font-display text-[40px] font-normal text-stone-800 mb-1">Carrito</h1>
      <p className="text-sm text-stone-500 mb-10">
        {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
        {/* Lista de productos */}
        <div className="md:col-span-2 space-y-0">
          {items.map((item, idx) => (
            <div
              key={item.productoId}
              className={`flex gap-4 py-6 ${idx < items.length - 1 ? 'border-b border-stone-200' : ''}`}
            >
              {/* Imagen */}
              <div className="w-20 h-20 shrink-0 bg-stone-100 overflow-hidden">
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
                <div className="flex justify-between items-start gap-2">
                  <Link
                    href={item.slug ? `/catalogo/${item.slug}` : '/catalogo'}
                    className="text-sm text-stone-800 hover:text-stone-500 transition-colors leading-snug"
                  >
                    {item.nombre}
                  </Link>
                  <button
                    onClick={() => handleEliminar(item.productoId)}
                    className="shrink-0 p-0.5 text-stone-300 hover:text-stone-600 transition-colors"
                    aria-label="Eliminar producto"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                      <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {item.caracteristicas.length > 0 && (
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    {item.caracteristicas.map(c => `${c.nombre}: ${c.valor}`).join(' · ')}
                  </p>
                )}

                <div className="flex items-center justify-between mt-3">
                  {/* Controles cantidad */}
                  <div className="flex items-center border border-stone-200">
                    <button
                      onClick={() => handleCantidad(item.productoId, -1)}
                      disabled={item.cantidad <= 1}
                      className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-800 disabled:opacity-30 transition-colors text-lg leading-none"
                      aria-label="Reducir cantidad"
                    >
                      −
                    </button>
                    <span className="w-8 h-8 flex items-center justify-center text-sm text-stone-800 border-x border-stone-200">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => handleCantidad(item.productoId, +1)}
                      disabled={item.cantidad >= 10}
                      className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-800 disabled:opacity-30 transition-colors text-lg leading-none"
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-sm text-stone-800">
                    {formatCLP(item.precio * item.cantidad)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="md:col-span-1">
          <div className="border border-stone-200 p-6 space-y-5 sticky top-24">
            <h2 className="text-[11px] uppercase tracking-[.15em] text-stone-500">
              Resumen del pedido
            </h2>

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
          </div>
        </div>
      </div>
    </main>
  )
}
