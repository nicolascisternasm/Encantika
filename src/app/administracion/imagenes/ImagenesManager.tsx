'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { guardarMetadatosImagen, eliminarImagenSitio } from './actions'

export type ImagenSitio = {
  id: string
  nombre: string
  storage_path: string
  url: string
  ancho: number
  alto: number
  orientacion: string | null
  usos_sugeridos: string[] | null
  tamano_bytes: number | null
  creado_en: string | null
}

type Filtro = 'todas' | 'horizontal' | 'vertical' | 'cuadrada'

const BADGE: Record<string, { label: string; color: string; bg: string }> = {
  horizontal: { label: 'Horizontal', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  vertical:   { label: 'Vertical',   color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  cuadrada:   { label: 'Cuadrada',   color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
}

const USO_LABEL: Record<string, string> = {
  hero: 'Hero', banner: 'Banner', fondo: 'Fondo',
  historia: 'Historia', categoria: 'Categoría',
  producto: 'Producto', insumo: 'Insumo',
}

export default function ImagenesManager({ imagenes }: { imagenes: ImagenSitio[] }) {
  const router = useRouter()
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtradas = filtro === 'todas'
    ? imagenes
    : imagenes.filter((img) => img.orientacion === filtro)

  async function processFile(file: File) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Solo se permiten imágenes JPG, PNG o WebP')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen no puede superar los 10 MB')
      return
    }

    setError(null)
    setUploading(true)

    // Detectar dimensiones en el cliente antes de subir
    const { ancho, alto } = await new Promise<{ ancho: number; alto: number }>((resolve) => {
      const img = new window.Image()
      img.onload = () => resolve({ ancho: img.naturalWidth, alto: img.naturalHeight })
      img.src = URL.createObjectURL(file)
    })

    // Subir directo a Supabase Storage desde el cliente
    const supabase = createClient()
    const safeName = file.name.replace(/[^a-z0-9.\-_]/gi, '-').toLowerCase()
    const path = `sitio/${Date.now()}-${safeName}`

    const { error: uploadErr } = await supabase.storage
      .from('imagenes-sitio')
      .upload(path, file, { contentType: file.type })

    if (uploadErr) {
      setError(`Error al subir: ${uploadErr.message}`)
      setUploading(false)
      return
    }

    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/imagenes-sitio/${path}`

    const result = await guardarMetadatosImagen({
      nombre: file.name,
      storagePath: path,
      url,
      ancho,
      alto,
      tamanoBytess: file.size,
    })

    if (result.error) setError(result.error)

    setUploading(false)
    router.refresh()
  }

  async function handleDelete(id: string, storagePath: string) {
    if (!confirm('¿Eliminar esta imagen? Esta acción no se puede deshacer.')) return
    setDeletingId(id)
    const result = await eliminarImagenSitio(id, storagePath)
    if (result.error) setError(result.error)
    setDeletingId(null)
    router.refresh()
  }

  return (
    <div>
      {/* Zona de carga */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]) }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? '#6366f1' : '#374151'}`,
          borderRadius: 12,
          padding: 48,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.15s, background 0.15s',
          marginBottom: 32,
          background: isDragging ? 'rgba(99,102,241,0.05)' : 'transparent',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); e.target.value = '' }}
        />
        {uploading ? (
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Subiendo imagen…</p>
        ) : (
          <>
            <p style={{ color: '#d1d5db', fontSize: 14 }}>Arrastra una imagen aquí o haz clic para seleccionar</p>
            <p style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>JPG, PNG, WebP — máx. 10 MB</p>
          </>
        )}
      </div>

      {error && (
        <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 24, background: 'rgba(239,68,68,0.1)', padding: '8px 16px', borderRadius: 6 }}>{error}</p>
      )}

      {/* Filtros por orientación */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, alignItems: 'center' }}>
        {(['todas', 'horizontal', 'vertical', 'cuadrada'] as Filtro[]).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding: '6px 12px',
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
            {f !== 'todas' && (
              <span style={{ marginLeft: 4, opacity: 0.6 }}>
                ({imagenes.filter((i) => i.orientacion === f).length})
              </span>
            )}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#6b7280' }}>
          {imagenes.length} {imagenes.length === 1 ? 'imagen' : 'imágenes'}
        </span>
      </div>

      {/* Galería */}
      {filtradas.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: 14, textAlign: 'center', padding: '64px 0' }}>
          {imagenes.length === 0
            ? 'No hay imágenes. Sube una para comenzar.'
            : 'No hay imágenes con ese filtro.'}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtradas.map((img) => {
            const badge = (img.orientacion ? BADGE[img.orientacion] : null) ?? BADGE.cuadrada
            return (
              <div
                key={img.id}
                style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, overflow: 'hidden' }}
                className="group"
              >
                {/* Miniatura */}
                <div style={{ position: 'relative', background: '#374151', overflow: 'hidden', height: 140 }}>
                  <Image
                    src={img.url}
                    alt={img.nombre}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <button
                    onClick={() => handleDelete(img.id, img.storage_path)}
                    disabled={deletingId === img.id}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'rgba(31,41,55,0.9)',
                      color: '#9ca3af',
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 500,
                      border: 'none',
                      cursor: 'pointer',
                      opacity: 0,
                      transition: 'opacity 0.15s',
                    }}
                    className="group-hover:opacity-100"
                    title="Eliminar imagen"
                  >
                    ×
                  </button>
                </div>

                {/* Metadata */}
                <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ display: 'inline-block', fontSize: 10, padding: '2px 8px', borderRadius: 999, fontWeight: 500, color: badge.color, background: badge.bg }}>
                    {badge.label}
                  </span>
                  <p style={{ fontSize: 11, color: '#6b7280' }}>
                    {img.ancho} × {img.alto}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {img.usos_sugeridos?.map((uso) => (
                      <span key={uso} style={{ fontSize: 10, background: '#374151', color: '#9ca3af', padding: '2px 6px', borderRadius: 4 }}>
                        {USO_LABEL[uso] ?? uso}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: '#9ca3af' }} className="truncate" title={img.nombre}>
                    {img.nombre}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
