'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteImagen } from '@/features/images/actions'

type Imagen = { id: string; ruta_almacenamiento: string; texto_alt: string | null; orden: number }

interface AdditionalGalleryProps {
  productoId: string
  imagenes: Imagen[]
  storageUrl: string
}

const MAX_ADDITIONAL = 9

export default function AdditionalGallery({ productoId, imagenes, storageUrl }: AdditionalGalleryProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [, startDelete] = useTransition()

  function getPublicUrl(ruta: string) {
    return `${storageUrl}/imagenes-productos/${ruta}`
  }

  async function uploadFile(file: File) {
    if (imagenes.length >= MAX_ADDITIONAL) {
      toast.error(`Máximo ${MAX_ADDITIONAL} imágenes adicionales`)
      return
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) { toast.error('Solo JPG, PNG o WebP'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Supera el límite de 5 MB'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`/api/admin/images?productoId=${productoId}`, {
        method: 'POST',
        body: fd,
      })
      const json = await res.json()
      if (!res.ok) toast.error(json.error ?? 'Error al subir')
      else { toast.success('Imagen agregada'); router.refresh() }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function handleDelete(img: Imagen) {
    if (!confirm('¿Eliminar esta imagen?')) return
    startDelete(async () => {
      const result = await deleteImagen(img.id, productoId, img.ruta_almacenamiento)
      if (result.error) toast.error(result.error)
      else { toast.success('Imagen eliminada'); router.refresh() }
    })
  }

  return (
    <div>
      <p className="text-xs text-stone-500 uppercase tracking-widest mb-3">Galería adicional</p>
      <div className="flex flex-wrap gap-2">
        {imagenes.map(img => (
          <div key={img.id} className="group relative w-20 h-20 border border-sand flex-shrink-0">
            <img
              src={getPublicUrl(img.ruta_almacenamiento)}
              alt={img.texto_alt ?? ''}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleDelete(img)}
              className="absolute top-0.5 right-0.5 z-10 w-4 h-4 bg-white/90 border border-stone-200 text-stone-400 hover:text-red-500 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
        {imagenes.length < MAX_ADDITIONAL && (
          <button
            type="button"
            onClick={() => !uploading && fileRef.current?.click()}
            disabled={uploading}
            className="w-20 h-20 border-2 border-dashed border-sand hover:border-gold text-stone-400 hover:text-gold flex items-center justify-center text-2xl transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {uploading ? '…' : '+'}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f) }}
          disabled={uploading}
        />
      </div>
    </div>
  )
}
