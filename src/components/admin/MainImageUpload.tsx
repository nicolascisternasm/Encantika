'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteImagen } from '@/features/images/actions'

type Imagen = { id: string; ruta_almacenamiento: string; texto_alt: string | null }

interface MainImageUploadProps {
  productoId: string
  imagen: Imagen | null
  storageUrl: string
}

export default function MainImageUpload({ productoId, imagen, storageUrl }: MainImageUploadProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [, startDelete] = useTransition()

  function getPublicUrl(ruta: string) {
    return `${storageUrl}/imagenes-productos/${ruta}`
  }

  async function uploadFile(file: File) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) { toast.error('Solo JPG, PNG o WebP'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Supera el límite de 5 MB'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`/api/admin/images?productoId=${productoId}&orden=0`, {
        method: 'POST',
        body: fd,
      })
      const json = await res.json()
      if (!res.ok) toast.error(json.error ?? 'Error al subir')
      else { toast.success('Imagen principal actualizada'); router.refresh() }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (uploading) return
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  function handleDelete() {
    if (!imagen) return
    if (!confirm('¿Eliminar la imagen principal?')) return
    startDelete(async () => {
      const result = await deleteImagen(imagen.id, productoId, imagen.ruta_almacenamiento)
      if (result.error) toast.error(result.error)
      else { toast.success('Imagen eliminada'); router.refresh() }
    })
  }

  return (
    <div>
      <p className="text-xs text-stone-500 uppercase tracking-widest mb-3">Imagen principal</p>
      <div
        className={`group relative w-[120px] h-[120px] border-2 border-dashed transition-colors ${
          uploading ? 'border-sand opacity-60' : 'border-sand hover:border-gold cursor-pointer'
        }`}
        onClick={() => !uploading && fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
        onDrop={handleDrop}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f) }}
          disabled={uploading}
        />

        {imagen ? (
          <>
            <img
              src={getPublicUrl(imagen.ruta_almacenamiento)}
              alt={imagen.texto_alt ?? ''}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors pointer-events-none" />
            <button
              type="button"
              onClick={e => { e.stopPropagation(); handleDelete() }}
              className="absolute top-1 right-1 z-10 w-5 h-5 bg-white/90 border border-stone-200 text-stone-500 hover:text-red-500 hover:border-red-300 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </>
        ) : uploading ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[11px] text-stone-400">Subiendo…</span>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-stone-400">
            <CameraIcon />
            <span className="text-[11px] text-center leading-tight px-2">Subir foto</span>
          </div>
        )}
      </div>
    </div>
  )
}

function CameraIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
