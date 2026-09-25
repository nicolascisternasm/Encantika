'use client'

import { useState, useRef, useTransition } from 'react'
import { toast } from 'sonner'
import { deleteImagen } from '@/features/images/actions'

type Imagen = {
  id: string
  ruta_almacenamiento: string
  orden: number
  texto_alt: string | null
}

interface ImageGalleryProps {
  productoId: string
  imagenes: Imagen[]
  storageUrl: string
}

export default function ImageGallery({ productoId, imagenes, storageUrl }: ImageGalleryProps) {
  const [uploading, setUploading] = useState(false)
  const [isDeleting, startDelete] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo supera los 5 MB')
      return
    }

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`/api/admin/images?productoId=${productoId}`, {
        method: 'POST',
        body: fd,
      })
      const json = await res.json()
      if (!res.ok) toast.error(json.error ?? 'Error al subir la imagen')
      else toast.success('Imagen subida exitosamente')
    } catch {
      toast.error('Error al subir la imagen')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function handleDelete(id: string, ruta: string) {
    if (!confirm('¿Eliminar esta imagen?')) return
    startDelete(async () => {
      const result = await deleteImagen(id, productoId, ruta)
      if (result.error) toast.error(result.error)
      else toast.success(result.success ?? 'Imagen eliminada')
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <label className={`cursor-pointer px-4 py-2 text-xs border border-stone-300 text-stone-600 hover:bg-stone-50 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {uploading ? 'Subiendo...' : '+ Subir imagen'}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
        <p className="text-xs text-stone-400">JPG, PNG, WebP — máx. 5 MB</p>
      </div>

      {imagenes.length === 0 ? (
        <div className="bg-white border border-stone-100 rounded-sm p-10 text-center text-stone-400 text-sm">
          No hay imágenes para este producto
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {imagenes.map((img) => (
            <div key={img.id} className="relative group bg-stone-100 aspect-square overflow-hidden rounded-sm">
              <img
                src={`${storageUrl}/imagenes-producto/${img.ruta_almacenamiento}`}
                alt={img.texto_alt ?? ''}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleDelete(img.id, img.ruta_almacenamiento)}
                disabled={isDeleting}
                className="absolute top-2 right-2 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
