'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { formatCLP } from '@/lib/utils'
import ProductGallery, { type ImagenPDP } from './ProductGallery'
import VariantSelector, { type AtributoPDP, type VariantePDPSelector } from './VariantSelector'
import AddToCartButton from './AddToCartButton'

export type { ImagenPDP, AtributoPDP }

export type VariantePDP = VariantePDPSelector & {
  sku: string
  precio: number
  precio_comparacion: number | null
  dias_tiempo_produccion: number | null
}

interface ProductoData {
  id: string
  nombre: string
  descripcion: string | null
  precio_base: number
  precio_comparacion: number | null
  tipo_producto: string
  dias_tiempo_produccion: number | null
  colecciones: { id: string; nombre: string; slug: string }[]
}

interface Props {
  producto: ProductoData
  imagenes: ImagenPDP[]
  atributos: AtributoPDP[]
  variantes: VariantePDP[]
  variantImageMap: Record<string, number>
  storageUrl: string
  direccionRetiro: string | null
}

export default function ProductPageClient({
  producto, imagenes, atributos, variantes, variantImageMap, storageUrl, direccionRetiro,
}: Props) {
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({})
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [acordeones, setAcordeones] = useState<Record<string, boolean>>({})
  const [copiado, setCopiado] = useState(false)
  const [pageUrl, setPageUrl] = useState('')

  useEffect(() => { setPageUrl(window.location.href) }, [])

  // Variante activa: solo cuando todos los atributos tienen valor seleccionado
  const isSelectionComplete = atributos.length === 0 || atributos.every(a => selectedValues[a.id])

  const activeVariante: VariantePDP | null = isSelectionComplete && atributos.length > 0
    ? variantes.find(v =>
        atributos.every(a => v.valores[a.id] === selectedValues[a.id])
      ) ?? null
    : null

  const handleSelect = useCallback((valorId: string, atributoId: string) => {
    setSelectedValues(prev => {
      const next = { ...prev, [atributoId]: valorId }
      // Si la selección está completa, buscar imagen asociada a la variante
      if (atributos.every(a => next[a.id])) {
        const match = variantes.find(v => atributos.every(a => v.valores[a.id] === next[a.id]))
        if (match && variantImageMap[match.id] !== undefined) {
          setActiveImageIndex(variantImageMap[match.id])
        }
      }
      return next
    })
  }, [atributos, variantes, variantImageMap])

  // Precio
  const activasConPrecio = variantes.filter(v => v.activo)
  const hasRangoPrecio = atributos.length > 0 && !activeVariante && activasConPrecio.length > 0
  const precioMin = hasRangoPrecio ? Math.min(...activasConPrecio.map(v => v.precio)) : null
  const precioMax = hasRangoPrecio ? Math.max(...activasConPrecio.map(v => v.precio)) : null
  const precio = activeVariante?.precio ?? producto.precio_base
  const precioComp = activeVariante?.precio_comparacion ?? producto.precio_comparacion

  // Stock
  const stock = activeVariante?.stock ?? (atributos.length === 0 ? 999 : 0)
  const permiteAPedido = activeVariante?.permite_a_pedido ?? false
  const dias = activeVariante?.dias_tiempo_produccion ?? producto.dias_tiempo_produccion
  const esFabricado = producto.tipo_producto === 'fabricado'

  const requiresSelection = atributos.length > 0 && !isSelectionComplete
  const noStock = isSelectionComplete && stock === 0 && !permiteAPedido && atributos.length > 0

  // Label para el carrito
  const variantLabel = atributos.map(a => {
    const val = a.valores.find(v => v.id === selectedValues[a.id])
    return val ? `${a.nombre}: ${val.valor}` : null
  }).filter(Boolean).join(' / ')

  const mainImgPath = [...imagenes].sort((a, b) => a.orden - b.orden)[0]?.ruta_almacenamiento
  const mainImgUrl = mainImgPath ? `${storageUrl}/${mainImgPath}` : null

  const whatsappUrl = pageUrl
    ? `https://wa.me/?text=${encodeURIComponent(`${producto.nombre} — ${pageUrl}`)}`
    : '#'

  function handleCopy() {
    if (!pageUrl) return
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }).catch(() => {})
  }

  const acordeonItems = [
    {
      key: 'envio',
      titulo: 'Envío',
      contenido: `Envío a todo Chile · ${direccionRetiro ? `Retiro disponible en ${direccionRetiro}` : 'Retiro disponible en tienda'}`,
    },
    {
      key: 'cuidados',
      titulo: 'Cuidados',
      contenido: 'Evitar contacto con agua y perfumes. Guardar en lugar seco.',
    },
    {
      key: 'devoluciones',
      titulo: 'Devoluciones',
      contenido: 'Cambios dentro de 7 días hábiles.',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
      {/* ── Galería ──────────────────────────────────────────────────────── */}
      <ProductGallery
        imagenes={imagenes}
        storageUrl={storageUrl}
        activeIndex={activeImageIndex}
        onImageChange={setActiveImageIndex}
      />

      {/* ── Columna info ─────────────────────────────────────────────────── */}
      <div className="space-y-5 py-2">
        {/* Colección(es) */}
        {producto.colecciones.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {producto.colecciones.map(col => (
              <Link
                key={col.id}
                href={`/colecciones/${col.slug}`}
                className="text-[11px] uppercase tracking-[.12em] hover:opacity-70 transition-opacity"
                style={{ color: 'var(--color-acento, #C9A035)' }}
              >
                {col.nombre}
              </Link>
            ))}
          </div>
        )}

        {/* Nombre */}
        <h1 className="font-display text-[28px] sm:text-[36px] font-normal leading-[1.1] text-stone-800">
          {producto.nombre}
        </h1>

        {/* Precio */}
        <div className="flex items-baseline gap-3">
          {precioMin !== null ? (
            <p className="text-xl text-stone-800">
              {precioMin === precioMax
                ? formatCLP(precioMin)
                : `Desde ${formatCLP(precioMin)}`}
            </p>
          ) : (
            <>
              <p className="text-xl font-medium text-stone-800">{formatCLP(precio)}</p>
              {precioComp && precioComp > precio && (
                <p className="text-sm text-stone-400 line-through">{formatCLP(precioComp)}</p>
              )}
            </>
          )}
        </div>

        {/* Selectores de variantes */}
        {atributos.length > 0 && (
          <VariantSelector
            atributos={atributos}
            variantes={variantes}
            selectedValues={selectedValues}
            onSelect={handleSelect}
          />
        )}

        {/* Badge de stock */}
        {isSelectionComplete && (
          <div className="space-y-1">
            {stock > 3 && (
              <p className="text-sm text-green-700">En stock</p>
            )}
            {stock > 0 && stock <= 3 && (
              <p className="text-sm text-amber-600">Últimas {stock} unidad{stock !== 1 ? 'es' : ''}</p>
            )}
            {stock === 0 && permiteAPedido && (
              <p className="text-sm text-stone-500">Sin stock — disponible a pedido</p>
            )}
            {stock === 0 && !permiteAPedido && atributos.length > 0 && (
              <p className="text-sm text-red-500">Sin stock</p>
            )}
            {(permiteAPedido || esFabricado) && dias && dias > 0 && (
              <p className="text-xs text-stone-400 mt-0.5">
                Tiempo de elaboración: {dias} días hábiles
              </p>
            )}
          </div>
        )}

        {/* Botones */}
        <AddToCartButton
          productoId={producto.id}
          nombre={producto.nombre}
          precio={precio}
          varianteId={activeVariante?.id ?? null}
          variantLabel={variantLabel}
          imagenUrl={mainImgUrl}
          requiresSelection={requiresSelection}
          noStock={noStock}
        />

        {/* Acordeones */}
        <div className="border-t border-stone-100 pt-1">
          {acordeonItems.map(item => (
            <div key={item.key} className="border-b border-stone-100">
              <button
                onClick={() => setAcordeones(p => ({ ...p, [item.key]: !p[item.key] }))}
                className="w-full flex items-center justify-between py-3.5 text-left group"
              >
                <span className="text-[11px] uppercase tracking-[.12em] text-stone-600 group-hover:text-stone-800 transition-colors">
                  {item.titulo}
                </span>
                <span className="text-stone-400 text-lg leading-none ml-4">
                  {acordeones[item.key] ? '−' : '+'}
                </span>
              </button>
              {acordeones[item.key] && (
                <p className="pb-4 text-sm text-stone-500 leading-relaxed">{item.contenido}</p>
              )}
            </div>
          ))}
        </div>

        {/* Compartir */}
        <div className="flex items-center gap-4 pt-1">
          <span className="text-[11px] uppercase tracking-[.12em] text-stone-400">Compartir</span>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-400 hover:text-stone-700 transition-colors"
            aria-label="Compartir por WhatsApp"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.463 3.48 11.815 11.815 0 0 0 12.05 0zm0 21.784h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26C2.169 6.89 6.604 2.456 12.054 2.456c2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884z" />
            </svg>
          </a>
          <button
            onClick={handleCopy}
            className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
            aria-label="Copiar enlace"
          >
            {copiado ? '¡Copiado!' : 'Copiar enlace'}
          </button>
        </div>
      </div>
    </div>
  )
}
