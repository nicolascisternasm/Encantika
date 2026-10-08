'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteImagen } from '@/features/images/actions'
import GoogleDrivePicker from './GoogleDrivePicker'

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

  async function uploadFiles(files: File[]) {
    const remaining = MAX_ADDITIONAL - imagenes.length
    if (remaining <= 0) { toast.error(`Máximo ${MAX_ADDITIONAL} imágenes adicionales`); return }
    const toUpload = files.slice(0, remaining)
    if (files.length > remaining) toast.warning(`Solo se subirán ${remaining} imagen(es) — límite alcanzado`)

    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    for (const f of toUpload) {
      if (!allowed.includes(f.type)) { toast.error(`${f.name}: solo JPG, PNG o WebP`); return }
      if (f.size > 50 * 1024 * 1024) { toast.error(`${f.name}: supera los 50 MB`); return }
    }

    setUploading(true)
    let anySuccess = false
    for (const file of toUpload) {
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch(`/api/admin/images?productoId=${productoId}`, {
          method: 'POST',
          body: fd,
        })
        const json = await res.json()
        if (!res.ok) toast.error(`${file.name}: ${json.error ?? 'error al subir'}`)
        else anySuccess = true
      } catch {
        toast.error(`${file.name}: error de conexión`)
      }
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
    if (anySuccess) {
      toast.success(toUpload.length > 1 ? 'Imágenes subidas' : 'Imagen subida')
      router.refresh()
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p className="text-xs text-stone-500 uppercase tracking-widest">Galería adicional</p>
        <GoogleDrivePicker
          multiselect
          onFiles={(files) => uploadFiles(files)}
          disabled={uploading}
        />
      </div>
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
          multiple
          className="hidden"
          onChange={e => {
            const files = Array.from(e.target.files ?? [])
            if (files.length) uploadFiles(files)
          }}
          disabled={uploading}
        />
      </div>
    </div>
  )
}
