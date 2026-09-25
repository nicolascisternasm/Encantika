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

const BADGE: Record<string, { label: string; cls: string }> = {
  horizontal: { label: 'Horizontal', cls: 'bg-blue-100 text-blue-700' },
  vertical:   { label: 'Vertical',   cls: 'bg-green-100 text-green-700' },
  cuadrada:   { label: 'Cuadrada',   cls: 'bg-amber-100 text-amber-700' },
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
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors mb-8 ${
          isDragging ? 'border-stone-500 bg-stone-50' : 'border-stone-200 hover:border-stone-300'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); e.target.value = '' }}
        />
        {uploading ? (
          <p className="text-stone-500 text-sm">Subiendo imagen…</p>
        ) : (
          <>
            <p className="text-stone-600 text-sm">Arrastra una imagen aquí o haz clic para seleccionar</p>
            <p className="text-stone-400 text-xs mt-1">JPG, PNG, WebP — máx. 10 MB</p>
          </>
        )}
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-6 bg-red-50 px-4 py-2 rounded">{error}</p>
      )}

      {/* Filtros por orientación */}
      <div className="flex gap-2 mb-6">
        {(['todas', 'horizontal', 'vertical', 'cuadrada'] as Filtro[]).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 text-xs rounded border transition-colors ${
              filtro === f
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'todas' && (
              <span className="ml-1 opacity-60">
                ({imagenes.filter((i) => i.orientacion === f).length})
              </span>
            )}
          </button>
        ))}
        <span className="ml-auto text-xs text-stone-400 self-center">
          {imagenes.length} {imagenes.length === 1 ? 'imagen' : 'imágenes'}
        </span>
      </div>

      {/* Galería */}
      {filtradas.length === 0 ? (
        <p className="text-stone-400 text-sm text-center py-16">
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
                className="bg-white border border-stone-100 rounded-lg overflow-hidden group shadow-sm"
              >
                {/* Miniatura */}
                <div className="relative bg-stone-50 overflow-hidden" style={{ height: 140 }}>
                  <Image
                    src={img.url}
                    alt={img.nombre}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    unoptimized
                  />
                  <button
                    onClick={() => handleDelete(img.id, img.storage_path)}
                    disabled={deletingId === img.id}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-stone-500 hover:text-red-600 w-7 h-7 rounded flex items-center justify-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    title="Eliminar imagen"
                  >
                    ×
                  </button>
                </div>

                {/* Metadata */}
                <div className="p-3 space-y-1.5">
                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>
                    {badge.label}
                  </span>
                  <p className="text-[11px] text-stone-400">
                    {img.ancho} × {img.alto}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {img.usos_sugeridos?.map((uso) => (
                      <span key={uso} className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">
                        {USO_LABEL[uso] ?? uso}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-stone-500 truncate" title={img.nombre}>
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
