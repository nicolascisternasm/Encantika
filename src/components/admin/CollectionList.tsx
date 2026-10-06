'use client'

import { useState, useRef, useTransition, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { generateSlug } from '@/lib/utils'
import {
  crearColeccion,
  actualizarColeccion,
  eliminarColeccion,
  guardarImagenColeccion,
  eliminarImagenColeccion,
  toggleColeccion,
} from '@/features/collections/actions'

type ColeccionConCount = {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  url_imagen: string | null
  activo: boolean
  orden: number
  creado_en: string
  _count: number
}

type ModalMode = 'crear' | 'editar'

export default function CollectionList({ colecciones }: { colecciones: ColeccionConCount[] }) {
  const router = useRouter()
  const [modalMode, setModalMode] = useState<ModalMode | null>(null)
  const [editTarget, setEditTarget] = useState<ColeccionConCount | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  function openCreate() {
    setEditTarget(null)
    setModalMode('crear')
  }

  function openEdit(col: ColeccionConCount) {
    setEditTarget(col)
    setModalMode('editar')
  }

  function closeModal() {
    setModalMode(null)
    setEditTarget(null)
  }

  async function handleToggle(col: ColeccionConCount) {
    const result = await toggleColeccion(col.id, !col.activo)
    if (result.error) toast.error(result.error)
    else { toast.success(result.success ?? 'Actualizada'); router.refresh() }
  }

  async function handleDelete(col: ColeccionConCount) {
    if (!confirm(`¿Eliminar la colección "${col.nombre}"?`)) return
    setDeleting(col.id)
    const result = await eliminarColeccion(col.id)
    setDeleting(null)
    if (result.error) toast.error(result.error)
    else { toast.success(result.success ?? 'Eliminada'); router.refresh() }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="px-4 py-2 text-sm transition-colors"
          style={{ background: '#6366f1', color: 'white', borderRadius: '8px' }}
        >
          + Nueva colección
        </button>
      </div>

      <div
        className="rounded-sm overflow-hidden"
        style={{ background: '#1f2937', border: '1px solid #374151' }}
      >
        {colecciones.length === 0 ? (
          <div className="p-16 text-center text-sm" style={{ color: '#9ca3af' }}>
            No hay colecciones todavía
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #374151' }}>
                <th className="w-16 px-3 py-3" />
                <th className="text-left px-4 py-3 text-xs font-normal uppercase tracking-wider" style={{ color: '#6b7280' }}>Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-normal uppercase tracking-wider hidden sm:table-cell" style={{ color: '#6b7280' }}>Slug</th>
                <th className="text-left px-4 py-3 text-xs font-normal uppercase tracking-wider" style={{ color: '#6b7280' }}>Productos</th>
                <th className="text-left px-4 py-3 text-xs font-normal uppercase tracking-wider" style={{ color: '#6b7280' }}>Estado</th>
                <th className="text-left px-4 py-3 text-xs font-normal uppercase tracking-wider hidden md:table-cell" style={{ color: '#6b7280' }}>Orden</th>
                <th className="text-right px-4 py-3 text-xs font-normal uppercase tracking-wider" style={{ color: '#6b7280' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {colecciones.map(col => (
                <tr
                  key={col.id}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid #374151' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#111827')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-3 py-3 w-16">
                    {col.url_imagen ? (
                      <img
                        src={col.url_imagen}
                        alt=""
                        className="w-12 h-12 object-cover"
                        style={{ border: '1px solid #374151' }}
                      />
                    ) : (
                      <div className="w-12 h-12" style={{ background: '#111827', border: '1px solid #374151' }} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEdit(col)}
                      className="font-medium hover:underline text-left"
                      style={{ color: '#f9fafb' }}
                    >
                      {col.nombre}
                    </button>
                    {col.descripcion && (
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#6b7280' }}>{col.descripcion}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs font-mono" style={{ color: '#6b7280' }}>{col.slug}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ background: '#374151', color: '#d1d5db' }}
                    >
                      {col._count}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(col)}
                      className="text-xs px-2 py-0.5 rounded transition-colors"
                      style={
                        col.activo
                          ? { background: 'rgba(16,185,129,0.12)', color: '#10b981', borderRadius: '6px' }
                          : { background: '#374151', color: '#9ca3af', borderRadius: '6px' }
                      }
                    >
                      {col.activo ? 'Activa' : 'Inactiva'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm hidden md:table-cell" style={{ color: '#9ca3af' }}>{col.orden}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button
                      onClick={() => openEdit(col)}
                      className="text-xs transition-colors"
                      style={{ color: '#9ca3af' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#f9fafb')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(col)}
                      disabled={deleting === col.id}
                      className="text-xs disabled:opacity-50 transition-colors"
                      style={{ color: '#ef4444' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#fca5a5')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#ef4444')}
                    >
                      {deleting === col.id ? '...' : 'Eliminar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalMode && (
        <ColeccionModal
          mode={modalMode}
          coleccion={editTarget}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  mode: ModalMode
  coleccion: ColeccionConCount | null
  onClose: () => void
}

function ColeccionModal({ mode, coleccion, onClose }: ModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  const [nombre, setNombre] = useState(coleccion?.nombre ?? '')
  const [slug, setSlug] = useState(coleccion?.slug ?? '')
  const [descripcion, setDescripcion] = useState(coleccion?.descripcion ?? '')
  const [activo, setActivo] = useState(coleccion?.activo ?? true)
  const [orden, setOrden] = useState(coleccion?.orden ?? 0)
  const [slugManual, setSlugManual] = useState(mode === 'editar')

  const [imgUrl, setImgUrl] = useState<string | null>(coleccion?.url_imagen ?? null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingPreview, setPendingPreview] = useState<string | null>(null)
  const [uploadingImg, setUploadingImg] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  function handleNombreChange(v: string) {
    setNombre(v)
    if (!slugManual) setSlug(generateSlug(v))
  }

  function handleFileSelect(file: File) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) { toast.error('Solo JPG, PNG o WebP'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('La imagen supera 5 MB'); return }
    setPendingFile(file)
    setPendingPreview(URL.createObjectURL(file))
  }

  async function uploadPendingImage(id: string): Promise<string | null> {
    if (!pendingFile) return null
    setUploadingImg(true)
    try {
      const ext = pendingFile.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path = `colecciones/${id}/${Date.now()}.${ext}`
      const supabase = createClient()
      const { error } = await supabase.storage
        .from('imagenes-productos')
        .upload(path, pendingFile, { contentType: pendingFile.type })
      if (error) { toast.error('Error al subir la imagen'); return null }
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/imagenes-productos/${path}`
      await guardarImagenColeccion(id, publicUrl)
      return publicUrl
    } finally {
      setUploadingImg(false)
    }
  }

  async function handleRemoveImage() {
    if (pendingPreview) {
      setPendingFile(null)
      setPendingPreview(null)
      return
    }
    if (!imgUrl || !coleccion) return
    const storagePath = imgUrl.split('/imagenes-productos/')[1]
    if (!storagePath) return
    const result = await eliminarImagenColeccion(coleccion.id, storagePath)
    if (result.error) toast.error(result.error)
    else { setImgUrl(null); router.refresh() }
  }

  function handleSubmit() {
    startTransition(async () => {
      if (mode === 'crear') {
        const result = await crearColeccion({ nombre, slug, descripcion: descripcion || undefined, activo, orden })
        if (result.error) { toast.error(result.error); return }
        const newId = result.id!
        if (pendingFile) await uploadPendingImage(newId)
        toast.success(result.success ?? 'Colección creada')
        router.refresh()
        onClose()
      } else {
        const result = await actualizarColeccion(coleccion!.id, { nombre, slug, descripcion: descripcion || undefined, activo, orden })
        if (result.error) { toast.error(result.error); return }
        if (pendingFile) await uploadPendingImage(coleccion!.id)
        toast.success(result.success ?? 'Colección actualizada')
        router.refresh()
        onClose()
      }
    })
  }

  const currentImg = pendingPreview ?? imgUrl

  const inputStyle = {
    background: '#111827',
    border: '1px solid #374151',
    color: '#f9fafb',
    borderRadius: '8px',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg mx-4 shadow-xl max-h-[90vh] overflow-y-auto rounded-sm"
        style={{ background: '#1f2937', border: '1px solid #374151' }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #374151' }}
        >
          <h2 className="text-sm font-medium uppercase tracking-widest" style={{ color: '#f9fafb' }}>
            {mode === 'crear' ? 'Nueva colección' : 'Editar colección'}
          </h2>
          <button
            onClick={onClose}
            className="text-xl leading-none transition-colors"
            style={{ color: '#6b7280' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f9fafb')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Imagen */}
          <div>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#9ca3af' }}>Imagen</p>
            <div className="flex items-start gap-4">
              <div
                className={`group relative w-[120px] h-[120px] flex-shrink-0 transition-colors ${
                  uploadingImg ? 'opacity-60' : 'cursor-pointer'
                }`}
                style={{
                  border: `2px dashed ${uploadingImg ? '#374151' : '#4b5563'}`,
                  borderRadius: '8px',
                }}
                onClick={() => !uploadingImg && fileRef.current?.click()}
                onMouseEnter={e => { if (!uploadingImg) (e.currentTarget as HTMLDivElement).style.borderColor = '#6366f1' }}
                onMouseLeave={e => { if (!uploadingImg) (e.currentTarget as HTMLDivElement).style.borderColor = '#4b5563' }}
                onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
                onDrop={e => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f) }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }}
                />
                {currentImg ? (
                  <>
                    <img src={currentImg} alt="" className="w-full h-full object-cover rounded-sm" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none rounded-sm" />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); handleRemoveImage() }}
                      className="absolute top-1 right-1 z-10 w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: 'rgba(31,41,55,0.9)',
                        border: '1px solid #374151',
                        color: '#9ca3af',
                        borderRadius: '4px',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1" style={{ color: '#6b7280' }}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[11px] text-center leading-tight px-2">Subir foto</span>
                  </div>
                )}
              </div>
              <p className="text-xs mt-1" style={{ color: '#6b7280' }}>JPG, PNG o WebP · Máx. 5 MB</p>
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-xs mb-1" style={{ color: '#9ca3af' }}>Nombre *</label>
            <input
              value={nombre}
              onChange={e => handleNombreChange(e.target.value)}
              className="w-full px-3 py-2 text-sm focus:outline-none transition-colors"
              style={inputStyle}
              placeholder="Ej: Verano 2026"
              onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
              onBlur={e => (e.currentTarget.style.borderColor = '#374151')}
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs mb-1" style={{ color: '#9ca3af' }}>Slug *</label>
            <input
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugManual(true) }}
              className="w-full px-3 py-2 text-sm font-mono focus:outline-none transition-colors"
              style={inputStyle}
              placeholder="verano-2026"
              onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
              onBlur={e => (e.currentTarget.style.borderColor = '#374151')}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs mb-1" style={{ color: '#9ca3af' }}>Descripción</label>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm focus:outline-none resize-none transition-colors"
              style={inputStyle}
              placeholder="Descripción opcional"
              onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
              onBlur={e => (e.currentTarget.style.borderColor = '#374151')}
            />
          </div>

          {/* Orden + Activa */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs mb-1" style={{ color: '#9ca3af' }}>Orden</label>
              <input
                type="number"
                min={0}
                value={orden}
                onChange={e => setOrden(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm focus:outline-none transition-colors"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
                onBlur={e => (e.currentTarget.style.borderColor = '#374151')}
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: '#d1d5db' }}>
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={e => setActivo(e.target.checked)}
                  className="w-4 h-4"
                />
                Activa
              </label>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={isPending || uploadingImg || !nombre.trim() || !slug.trim()}
            className="flex-1 py-2 text-sm transition-colors disabled:opacity-50"
            style={{ background: '#6366f1', color: 'white', borderRadius: '8px' }}
          >
            {isPending || uploadingImg
              ? 'Guardando…'
              : mode === 'crear' ? 'Crear colección' : 'Guardar cambios'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm transition-colors"
            style={{ background: '#374151', color: '#d1d5db', borderRadius: '8px' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#4b5563')}
            onMouseLeave={e => (e.currentTarget.style.background = '#374151')}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
