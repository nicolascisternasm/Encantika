'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { obtenerImagenesSitio } from './actions'
import type { ImagenSitio } from '../imagenes/ImagenesManager'

type Filtro = 'todas' | 'horizontal' | 'vertical' | 'cuadrada'

interface Props {
  seccionKey: 'hero' | 'banner_joya' | 'historia'
  onSelect: (imagen: ImagenSitio) => void
  onClose: () => void
}

export default function SelectorImagenModal({ seccionKey, onSelect, onClose }: Props) {
  const [imagenes, setImagenes] = useState<ImagenSitio[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>('todas')

  const preferida: Filtro = seccionKey === 'historia' ? 'vertical' : 'horizontal'

  useEffect(() => {
    obtenerImagenesSitio().then((imgs) => {
      setImagenes(imgs)
      setLoading(false)
      if (imgs.some((img) => img.orientacion === preferida)) {
        setFiltro(preferida)
      }
    })
  }, [preferida])

  const filtradas = filtro === 'todas'
    ? imagenes
    : imagenes.filter((img) => img.orientacion === filtro)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h3 className="text-sm font-medium text-stone-800">Seleccionar imagen</h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 text-xl leading-none w-7 h-7 flex items-center justify-center rounded hover:bg-stone-100 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-100">
          {(['todas', 'horizontal', 'vertical', 'cuadrada'] as Filtro[]).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1 text-xs rounded border transition-colors ${
                filtro === f
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'border-stone-200 text-stone-600 hover:border-stone-400'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === preferida && filtro !== f && (
                <span className="ml-1 text-[9px] text-amber-500">recomendada</span>
              )}
            </button>
          ))}
        </div>

        {/* Grid de imágenes */}
        <div className="overflow-y-auto p-5 flex-1">
          {loading ? (
            <p className="text-stone-400 text-sm text-center py-8">Cargando…</p>
          ) : filtradas.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-8">
              {imagenes.length === 0
                ? 'No hay imágenes. Sube una en la sección Imágenes.'
                : 'No hay imágenes con ese filtro.'}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filtradas.map((img) => (
                <button
                  key={img.id}
                  onClick={() => onSelect(img)}
                  className="group text-left overflow-hidden rounded border-2 border-transparent hover:border-stone-400 focus:outline-none focus:border-stone-600 transition-colors"
                >
                  <div className="relative bg-stone-100" style={{ height: 100 }}>
                    <Image
                      src={img.url}
                      alt={img.nombre}
                      fill
                      className="object-cover group-hover:opacity-90 transition-opacity"
                      sizes="(max-width: 768px) 33vw, 22vw"
                      unoptimized
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 px-2 py-1.5 truncate bg-white">{img.nombre}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
