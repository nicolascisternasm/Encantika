'use client'

import { useState, useRef, useEffect } from 'react'

export type ImagenPDP = {
  id: string
  ruta_almacenamiento: string
  texto_alt: string | null
  orden: number
  variante_id: string | null
}

interface Props {
  imagenes: ImagenPDP[]
  storageUrl: string
  activeIndex: number
  onImageChange: (index: number) => void
}

export default function ProductGallery({ imagenes, storageUrl, activeIndex, onImageChange }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const activeIndexRef = useRef(activeIndex)
  activeIndexRef.current = activeIndex

  const sorted = [...imagenes].sort((a, b) => a.orden - b.orden)
  const activeImg = sorted[activeIndex] ?? sorted[0]

  function getUrl(ruta: string) {
    return `${storageUrl}/${ruta}`
  }

  function prev() {
    onImageChange((activeIndexRef.current - 1 + sorted.length) % sorted.length)
  }

  function next() {
    onImageChange((activeIndexRef.current + 1) % sorted.length)
  }

  useEffect(() => {
    if (!lightboxOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, sorted.length])

  if (sorted.length === 0) {
    return <div className="aspect-square rounded bg-stone-100" />
  }

  return (
    <div>
      {/* Imagen principal */}
      <div
        className="aspect-square overflow-hidden rounded bg-stone-100 cursor-zoom-in select-none"
        onClick={() => setLightboxOpen(true)}
      >
        {activeImg && (
          <img
            key={activeImg.id}
            src={getUrl(activeImg.ruta_almacenamiento)}
            alt={activeImg.texto_alt ?? ''}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        )}
      </div>

      {/* Miniaturas */}
      {sorted.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {sorted.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => onImageChange(idx)}
              className="flex-shrink-0 w-[72px] h-[72px] overflow-hidden rounded transition-all duration-150"
              style={{
                border: `2px solid ${idx === activeIndex ? 'var(--color-acento, #C9A035)' : 'var(--color-borde, #E8E0D8)'}`,
                outline: idx === activeIndex ? `3px solid ${getComputedStyle(document.documentElement).getPropertyValue('--color-acento') || '#C9A035'}22` : 'none',
              }}
              aria-label={img.texto_alt ?? `Imagen ${idx + 1}`}
            >
              <img
                src={getUrl(img.ruta_almacenamiento)}
                alt={img.texto_alt ?? ''}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-4xl w-full max-h-full flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            {/* Cerrar */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white text-3xl w-10 h-10 flex items-center justify-center"
              aria-label="Cerrar"
            >
              ×
            </button>

            {/* Prev */}
            {sorted.length > 1 && (
              <button
                onClick={prev}
                className="absolute left-0 -translate-x-full text-white/70 hover:text-white text-4xl w-12 h-12 flex items-center justify-center"
                aria-label="Anterior"
              >
                ‹
              </button>
            )}

            {/* Imagen */}
            {activeImg && (
              <img
                key={activeImg.id}
                src={getUrl(activeImg.ruta_almacenamiento)}
                alt={activeImg.texto_alt ?? ''}
                className="max-h-[85vh] max-w-full object-contain rounded"
              />
            )}

            {/* Next */}
            {sorted.length > 1 && (
              <button
                onClick={next}
                className="absolute right-0 translate-x-full text-white/70 hover:text-white text-4xl w-12 h-12 flex items-center justify-center"
                aria-label="Siguiente"
              >
                ›
              </button>
            )}

            {/* Contador */}
            {sorted.length > 1 && (
              <p className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/60 text-xs tracking-wider">
                {activeIndex + 1} / {sorted.length}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
