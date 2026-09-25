'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteImagen, reorderImages } from '@/features/images/actions'

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

type UploadStatus = 'pending' | 'done' | 'error'

export default function ImageGallery({
  productoId,
  imagenes: initialImages,
  storageUrl,
}: ImageGalleryProps) {
  const router = useRouter()
  const [images, setImages] = useState<Imagen[]>(
    [...initialImages].sort((a, b) => a.orden - b.orden)
  )
  // Keep a ref always in sync with state to avoid stale closures in drop handler
  const imagesRef = useRef(images)
  imagesRef.current = images

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadStatus>>({})
  const [, startDelete] = useTransition()
  const [, startReorder] = useTransition()
  const dragIdRef = useRef<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function getPublicUrl(ruta: string) {
    return `${storageUrl}/imagenes-productos/${ruta}`
  }

  async function uploadFiles(files: File[]) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    for (const f of files) {
      if (!allowed.includes(f.type)) {
        toast.error(`${f.name}: solo se permiten JPG, PNG o WebP`)
        return
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name}: supera el límite de 5 MB`)
        return
      }
    }

    setUploading(true)
    const progress: Record<string, UploadStatus> = {}
    files.forEach(f => { progress[f.name] = 'pending' })
    setUploadProgress(progress)

    let anySuccess = false
    for (const file of files) {
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch(`/api/admin/images?productoId=${productoId}`, {
          method: 'POST',
          body: fd,
        })
        const json = await res.json()
        if (!res.ok) {
          setUploadProgress(prev => ({ ...prev, [file.name]: 'error' }))
          toast.error(`${file.name}: ${json.error ?? 'error al subir'}`)
        } else {
          setUploadProgress(prev => ({ ...prev, [file.name]: 'done' }))
          anySuccess = true
        }
      } catch {
        setUploadProgress(prev => ({ ...prev, [file.name]: 'error' }))
        toast.error(`${file.name}: error de conexión`)
      }
    }

    setUploading(false)
    setUploadProgress({})
    if (fileRef.current) fileRef.current.value = ''
    if (anySuccess) {
      toast.success(files.length > 1 ? 'Imágenes subidas' : 'Imagen subida')
      router.refresh()
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 10)
    if (files.length) uploadFiles(files)
  }

  function handleDropZone(e: React.DragEvent) {
    e.preventDefault()
    // Only handle file drops when not in drag-reorder mode
    if (dragIdRef.current) return
    const files = Array.from(e.dataTransfer.files)
      .filter(f => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type))
      .slice(0, 10)
    if (files.length) uploadFiles(files)
  }

  function handleDelete(img: Imagen) {
    if (!confirm('¿Eliminar esta imagen?')) return
    startDelete(async () => {
      const result = await deleteImagen(img.id, productoId, img.ruta_almacenamiento)
      if (result.error) {
        toast.error(result.error)
      } else {
        setImages(prev => prev.filter(i => i.id !== img.id))
        toast.success('Imagen eliminada')
      }
    })
  }

  // --- Drag-and-drop reordering ---
  function onDragStart(e: React.DragEvent, id: string) {
    dragIdRef.current = id
    e.dataTransfer.effectAllowed = 'move'
  }

  function onDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    e.stopPropagation()
    const fromId = dragIdRef.current
    if (!fromId || fromId === targetId) return
    setImages(prev => {
      const fromIdx = prev.findIndex(i => i.id === fromId)
      const toIdx = prev.findIndex(i => i.id === targetId)
      if (fromIdx === -1 || toIdx === -1) return prev
      const next = [...prev]
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      return next
    })
  }

  function onDragEnd() {
    const fromId = dragIdRef.current
    dragIdRef.current = null
    if (!fromId) return
    const orderedIds = imagesRef.current.map(img => img.id)
    startReorder(async () => {
      const result = await reorderImages(productoId, orderedIds)
      if (result?.error) toast.error(result.error)
    })
  }

  const hasProgress = Object.keys(uploadProgress).length > 0

  return (
    <div className="space-y-6">
      {/* Drop zone / upload trigger */}
      <div
        className={`border-2 border-dashed p-8 text-center transition-colors ${
          uploading ? 'border-gold/50 bg-nude/10' : 'border-sand hover:border-gold cursor-pointer'
        }`}
        onClick={() => !uploading && fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
        onDrop={handleDropZone}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleInputChange}
          disabled={uploading}
        />

        {hasProgress ? (
          <div className="space-y-1.5">
            <p className="text-xs text-stone-500 mb-2">Subiendo…</p>
            {Object.entries(uploadProgress).map(([name, status]) => (
              <div key={name} className="flex items-center gap-2 justify-center">
                <span className={`text-xs font-mono ${
                  status === 'done' ? 'text-emerald-600' :
                  status === 'error' ? 'text-red-500' : 'text-stone-400'
                }`}>
                  {status === 'done' ? '✓' : status === 'error' ? '✗' : '·'}
                </span>
                <span className="text-xs text-stone-600 truncate max-w-[200px]">{name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p className="text-sm text-stone-500">
              Arrastra imágenes aquí o{' '}
              <span className="underline underline-offset-2 decoration-stone-400">haz clic para seleccionar</span>
            </p>
            <p className="text-xs text-stone-400 mt-1">
              JPG, PNG, WebP — hasta 10 archivos, máx. 5 MB c/u
            </p>
          </div>
        )}
      </div>

      {/* Gallery */}
      {images.length === 0 ? (
        <p className="text-sm text-stone-400 text-center py-8">
          Este producto no tiene imágenes aún.
        </p>
      ) : (
        <div>
          <p className="text-xs text-stone-400 mb-3">
            Arrastra las miniaturas para reordenar. La primera es la imagen principal.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div
                key={img.id}
                draggable
                onDragStart={e => onDragStart(e, img.id)}
                onDragOver={e => onDragOver(e, img.id)}
                onDragEnd={onDragEnd}
                className="relative group cursor-grab active:cursor-grabbing border border-sand select-none"
              >
                {index === 0 && (
                  <span className="absolute top-1 left-1 z-10 bg-onyx/80 text-ivory text-[10px] px-1.5 py-0.5 pointer-events-none">
                    Principal
                  </span>
                )}
                <div className="aspect-square bg-stone-100 overflow-hidden">
                  <img
                    src={getPublicUrl(img.ruta_almacenamiento)}
                    alt={img.texto_alt ?? ''}
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />
                </div>
                {img.texto_alt && (
                  <p className="px-1.5 py-1 text-[10px] text-stone-400 truncate border-t border-sand/50">
                    {img.texto_alt}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(img)}
                  className="absolute top-1 right-1 z-10 w-6 h-6 bg-white/90 border border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-300 text-sm leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
