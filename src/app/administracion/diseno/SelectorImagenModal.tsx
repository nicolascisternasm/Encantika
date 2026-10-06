'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { obtenerImagenesSitio } from './actions'
import type { ImagenSitio } from '../imagenes/ImagenesManager'

type Filtro = 'todas' | 'horizontal' | 'vertical' | 'cuadrada'

interface Props {
  seccionKey: string
  onSelect: (imagen: ImagenSitio) => void
  onClose: () => void
}

export default function SelectorImagenModal({ seccionKey, onSelect, onClose }: Props) {
  const [imagenes, setImagenes] = useState<ImagenSitio[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>('todas')

  const preferida: Filtro = (seccionKey === 'historia' || seccionKey.startsWith('seccion')) ? 'vertical' : 'horizontal'

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
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', width: '100%', maxWidth: 768, margin: '0 16px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #374151' }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: '#f9fafb' }}>Seleccionar imagen</h3>
          <button
            onClick={onClose}
            style={{ color: '#9ca3af', fontSize: 20, lineHeight: 1, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
          >
            ×
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderBottom: '1px solid #374151' }}>
          {(['todas', 'horizontal', 'vertical', 'cuadrada'] as Filtro[]).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              style={{
                padding: '4px 12px',
                fontSize: 12,
                borderRadius: 6,
                border: '1px solid',
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: filtro === f ? '#6366f1' : 'transparent',
                color: filtro === f ? '#fff' : '#9ca3af',
                borderColor: filtro === f ? '#6366f1' : '#374151',
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === preferida && filtro !== f && (
                <span style={{ marginLeft: 4, fontSize: 9, color: '#f59e0b' }}>recomendada</span>
              )}
            </button>
          ))}
        </div>

        {/* Grid de imágenes */}
        <div style={{ overflowY: 'auto', padding: 20, flex: 1 }}>
          {loading ? (
            <p style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '32px 0' }}>Cargando…</p>
          ) : filtradas.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '32px 0' }}>
              {imagenes.length === 0
                ? 'No hay imágenes. Sube una en la sección Imágenes.'
                : 'No hay imágenes con ese filtro.'}
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {filtradas.map((img) => (
                <button
                  key={img.id}
                  onClick={() => onSelect(img)}
                  style={{ textAlign: 'left', overflow: 'hidden', borderRadius: 6, border: '2px solid transparent', cursor: 'pointer', background: 'transparent', padding: 0, transition: 'border-color 0.15s' }}
                >
                  <div style={{ position: 'relative', background: '#374151', height: 100 }}>
                    <Image
                      src={img.url}
                      alt={img.nombre}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 33vw, 22vw"
                    />
                  </div>
                  <p style={{ fontSize: 10, color: '#9ca3af', padding: '6px 8px', background: '#111827' }} className="truncate">{img.nombre}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
