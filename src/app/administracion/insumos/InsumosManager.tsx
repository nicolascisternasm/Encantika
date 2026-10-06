'use client'

import { useState, useRef, useEffect, useCallback, useTransition, useActionState } from 'react'
import { toast } from 'sonner'
import {
  createInsumo,
  actualizarInsumo,
  registrarEntradaInsumo,
  subirImagenInsumo,
  eliminarImagenInsumo,
} from '@/features/insumos/actions'
import type { InsumoConStock } from '@/features/insumos/queries'

type ActionState = { error?: string; success?: string }

const TIPO_LABELS: Record<string, string> = {
  compra: 'Compra',
  uso: 'Uso',
  ajuste: 'Ajuste',
  devolucion: 'Devolución',
}

function StockBadge({ stock }: { stock: number }) {
  if (stock > 10)
    return (
      <span
        className="text-xs px-2 py-0.5"
        style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', borderRadius: '4px' }}
      >
        En stock ({stock})
      </span>
    )
  if (stock > 0)
    return (
      <span
        className="text-xs px-2 py-0.5"
        style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', borderRadius: '4px' }}
      >
        Stock bajo ({stock})
      </span>
    )
  return (
    <span
      className="text-xs px-2 py-0.5"
      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '4px' }}
    >
      Sin stock
    </span>
  )
}

// ── Formulario nuevo insumo ────────────────────────────────────────────────────

function NuevoInsumoForm({ onClose }: { onClose: () => void }) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(createInsumo, {})

  useEffect(() => {
    if (state.success) onClose()
  }, [state.success, onClose])

  return (
    <form
      action={formAction}
      className="p-4 space-y-3"
      style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
    >
      <p
        className="text-xs font-medium uppercase tracking-wider"
        style={{ color: '#9ca3af' }}
      >
        Nuevo insumo
      </p>
      {state.error && <p className="text-xs" style={{ color: '#ef4444' }}>{state.error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs mb-1" style={{ color: '#9ca3af' }}>Nombre *</label>
          <input
            name="nombre"
            required
            className="w-full px-2 py-1.5 text-sm focus:outline-none"
            placeholder="Cadena plata 45cm"
            style={{
              background: '#111827',
              border: '1px solid #374151',
              color: '#f9fafb',
              borderRadius: '8px',
            }}
          />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: '#9ca3af' }}>Unidad</label>
          <select
            name="unidad"
            className="w-full px-2 py-1.5 text-sm focus:outline-none"
            style={{
              background: '#111827',
              border: '1px solid #374151',
              color: '#f9fafb',
              borderRadius: '8px',
            }}
          >
            <option value="unidad">Unidad</option>
            <option value="metro">Metro</option>
            <option value="gramo">Gramo</option>
            <option value="ml">Mililitro</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs mb-1" style={{ color: '#9ca3af' }}>Descripción (opcional)</label>
        <input
          name="descripcion"
          className="w-full px-2 py-1.5 text-sm focus:outline-none"
          placeholder="Descripción breve"
          style={{
            background: '#111827',
            border: '1px solid #374151',
            color: '#f9fafb',
            borderRadius: '8px',
          }}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-1.5 text-xs transition-colors disabled:opacity-50"
          style={{ background: '#6366f1', color: 'white', borderRadius: '8px' }}
        >
          {isPending ? 'Creando...' : 'Crear insumo'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 text-xs transition-colors"
          style={{ background: '#374151', color: '#d1d5db', borderRadius: '8px' }}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

// ── Uploader de imagen ─────────────────────────────────────────────────────────

function InsumoImageUploader({
  insumoId,
  initialUrl,
  storageUrl,
}: {
  insumoId: string
  initialUrl: string | null
  storageUrl: string
}) {
  const [url, setUrl] = useState(initialUrl)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('insumo_id', insumoId)
    fd.append('file', file)
    startTransition(async () => {
      const result = await subirImagenInsumo(fd)
      if (result.error) toast.error(result.error)
      else if (result.url) {
        setUrl(result.url)
        toast.success('Imagen actualizada')
      }
      if (inputRef.current) inputRef.current.value = ''
    })
  }

  function handleDelete() {
    if (!url) return
    const prev = url
    startTransition(async () => {
      const result = await eliminarImagenInsumo(insumoId, prev)
      if (result.error) toast.error(result.error)
      else {
        setUrl(null)
        toast.success('Imagen eliminada')
      }
    })
  }

  return (
    <div
      className="relative w-20 h-20 flex-shrink-0 overflow-hidden"
      style={{ border: '2px dashed #374151' }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
      {isPending ? (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: '#111827' }}
        >
          <span className="text-xs" style={{ color: '#6b7280' }}>...</span>
        </div>
      ) : url ? (
        <>
          <img src={`${storageUrl}/${url}`} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleDelete}
            className="absolute top-0.5 right-0.5 w-5 h-5 flex items-center justify-center text-sm leading-none transition-colors"
            style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}
            aria-label="Eliminar imagen"
          >
            ×
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-full flex flex-col items-center justify-center gap-1 transition-colors"
          aria-label="Subir foto"
        >
          <svg className="w-6 h-6" style={{ color: '#4b5563' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs" style={{ color: '#4b5563' }}>Foto</span>
        </button>
      )}
    </div>
  )
}

// ── Formulario de edición inline ───────────────────────────────────────────────

function InsumoEditForm({
  insumo,
  storageUrl,
  onClose,
}: {
  insumo: InsumoConStock
  storageUrl: string
  onClose: () => void
}) {
  const [nombre, setNombre] = useState(insumo.nombre)
  const [descripcion, setDescripcion] = useState(insumo.descripcion ?? '')
  const [unidad, setUnidad] = useState(insumo.unidad)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      const result = await actualizarInsumo(insumo.id, nombre, descripcion || null, unidad)
      if (result.error) toast.error(result.error)
      else {
        toast.success(result.success ?? 'Insumo actualizado')
        onClose()
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        <InsumoImageUploader
          key={insumo.imagen_url ?? 'sin-imagen'}
          insumoId={insumo.id}
          initialUrl={insumo.imagen_url}
          storageUrl={storageUrl}
        />
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <label className="block text-xs mb-1" style={{ color: '#9ca3af' }}>Nombre</label>
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="w-full px-2 py-1.5 text-sm focus:outline-none"
              style={{
                background: '#111827',
                border: '1px solid #374151',
                color: '#f9fafb',
                borderRadius: '8px',
              }}
            />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#9ca3af' }}>Unidad</label>
            <select
              value={unidad}
              onChange={e => setUnidad(e.target.value)}
              className="w-full px-2 py-1.5 text-sm focus:outline-none"
              style={{
                background: '#111827',
                border: '1px solid #374151',
                color: '#f9fafb',
                borderRadius: '8px',
              }}
            >
              <option value="unidad">Unidad</option>
              <option value="metro">Metro</option>
              <option value="gramo">Gramo</option>
              <option value="ml">Mililitro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#9ca3af' }}>Descripción</label>
            <input
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              className="w-full px-2 py-1.5 text-sm focus:outline-none"
              placeholder="Opcional"
              style={{
                background: '#111827',
                border: '1px solid #374151',
                color: '#f9fafb',
                borderRadius: '8px',
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || !nombre.trim()}
          className="px-4 py-1.5 text-xs transition-colors disabled:opacity-50"
          style={{ background: '#6366f1', color: 'white', borderRadius: '8px' }}
        >
          {isPending ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 text-xs transition-colors"
          style={{ background: '#374151', color: '#d1d5db', borderRadius: '8px' }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ── Formulario de entrada de stock ─────────────────────────────────────────────

function EntradaForm({ insumoId }: { insumoId: string }) {
  const [cantidad, setCantidad] = useState<number>(1)
  const [nota, setNota] = useState('')
  const [saving, startSave] = useTransition()

  function handleSubmit() {
    if (cantidad <= 0) return
    startSave(async () => {
      const result = await registrarEntradaInsumo(insumoId, cantidad, nota || undefined)
      if (result.error) toast.error(result.error)
      else {
        toast.success(result.success ?? 'Entrada registrada')
        setCantidad(1)
        setNota('')
      }
    })
  }

  return (
    <div className="flex items-end gap-2">
      <div>
        <label className="block text-xs mb-1" style={{ color: '#9ca3af' }}>Cantidad</label>
        <input
          type="number"
          value={cantidad}
          min={1}
          onChange={e => setCantidad(Number(e.target.value))}
          className="w-20 px-2 py-1.5 text-xs focus:outline-none"
          style={{
            background: '#111827',
            border: '1px solid #374151',
            color: '#f9fafb',
            borderRadius: '8px',
          }}
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs mb-1" style={{ color: '#9ca3af' }}>Nota (opcional)</label>
        <input
          type="text"
          value={nota}
          onChange={e => setNota(e.target.value)}
          placeholder="ej: lote enero"
          className="w-full px-2 py-1.5 text-xs focus:outline-none"
          style={{
            background: '#111827',
            border: '1px solid #374151',
            color: '#f9fafb',
            borderRadius: '8px',
          }}
        />
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={saving || cantidad <= 0}
        className="px-3 py-1.5 text-xs transition-colors disabled:opacity-50 whitespace-nowrap"
        style={{ background: '#6366f1', color: 'white', borderRadius: '8px' }}
      >
        {saving ? '...' : 'Registrar entrada'}
      </button>
    </div>
  )
}

// ── Manager principal ──────────────────────────────────────────────────────────

interface InsumosManagerProps {
  insumos: InsumoConStock[]
  storageUrl: string
}

export default function InsumosManager({ insumos, storageUrl }: InsumosManagerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  const handleCloseNewForm = useCallback(() => setShowNewForm(false), [])

  function toggleRow(id: string) {
    setExpandedId(prev => (prev === id ? null : id))
    setEditingId(prev => (prev === id && expandedId === id ? null : prev))
  }

  function handleEditar(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    setExpandedId(id)
    setEditingId(prev => (prev === id ? null : id))
  }

  function handleCloseEdit() {
    setEditingId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: '#9ca3af' }}>
          {insumos.length} insumo{insumos.length !== 1 ? 's' : ''}
        </p>
        <button
          type="button"
          onClick={() => setShowNewForm(v => !v)}
          className="px-4 py-2 text-xs transition-colors"
          style={{ background: '#6366f1', color: 'white', borderRadius: '8px' }}
        >
          {showNewForm ? 'Cancelar' : '+ Nuevo insumo'}
        </button>
      </div>

      {showNewForm && <NuevoInsumoForm onClose={handleCloseNewForm} />}

      <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', overflow: 'hidden' }}>
        {insumos.length === 0 ? (
          <p className="py-12 text-center text-sm" style={{ color: '#6b7280' }}>
            No hay insumos registrados
          </p>
        ) : (
          insumos.map((insumo, idx) => (
            <div
              key={insumo.id}
              style={idx > 0 ? { borderTop: '1px solid #374151' } : undefined}
            >
              {/* Fila */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleRow(insumo.id)}
                onKeyDown={e => e.key === 'Enter' && toggleRow(insumo.id)}
                className="w-full flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer"
              >
                {/* Miniatura 48×48 */}
                {insumo.imagen_url ? (
                  <img
                    src={`${storageUrl}/${insumo.imagen_url}`}
                    alt=""
                    className="w-12 h-12 object-cover flex-shrink-0"
                    style={{ border: '1px solid #374151' }}
                  />
                ) : (
                  <div
                    className="w-12 h-12 flex-shrink-0"
                    style={{ background: '#111827', border: '1px solid #374151' }}
                  />
                )}

                <span className="flex-1 text-sm" style={{ color: '#f9fafb' }}>{insumo.nombre}</span>
                <span className="text-xs" style={{ color: '#6b7280' }}>{insumo.unidad}</span>
                <StockBadge stock={insumo.stock} />

                {/* Botón Editar */}
                <button
                  type="button"
                  onClick={e => handleEditar(e, insumo.id)}
                  className="ml-1 px-2.5 py-1 text-xs transition-colors"
                  style={
                    editingId === insumo.id
                      ? { background: '#6366f1', color: 'white', border: '1px solid #6366f1', borderRadius: '6px' }
                      : { background: 'transparent', color: '#9ca3af', border: '1px solid #374151', borderRadius: '6px' }
                  }
                >
                  Editar
                </button>

                <svg
                  className={`w-4 h-4 transition-transform duration-150 ml-1 flex-shrink-0 ${expandedId === insumo.id ? 'rotate-180' : ''}`}
                  style={{ color: '#6b7280' }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Contenido expandido */}
              {expandedId === insumo.id && (
                <div
                  className="px-4 pb-4 pt-3 space-y-4"
                  style={{ background: '#111827', borderTop: '1px solid #374151' }}
                >
                  {/* Modo edición */}
                  {editingId === insumo.id ? (
                    <>
                      <div>
                        <p
                          className="text-xs font-medium mb-3 uppercase tracking-wider"
                          style={{ color: '#9ca3af' }}
                        >
                          Editar insumo
                        </p>
                        <InsumoEditForm
                          key={insumo.id}
                          insumo={insumo}
                          storageUrl={storageUrl}
                          onClose={handleCloseEdit}
                        />
                      </div>
                      <hr style={{ borderColor: '#374151' }} />
                    </>
                  ) : (
                    insumo.descripcion && (
                      <p className="text-xs" style={{ color: '#9ca3af' }}>{insumo.descripcion}</p>
                    )
                  )}

                  {/* Registrar entrada */}
                  <div>
                    <p
                      className="text-xs font-medium mb-2 uppercase tracking-wider"
                      style={{ color: '#9ca3af' }}
                    >
                      Registrar entrada
                    </p>
                    <EntradaForm insumoId={insumo.id} />
                  </div>

                  {/* Historial */}
                  <div>
                    <p
                      className="text-xs font-medium mb-2 uppercase tracking-wider"
                      style={{ color: '#9ca3af' }}
                    >
                      Últimos movimientos
                    </p>
                    {insumo.movimientos.length === 0 ? (
                      <p className="text-xs" style={{ color: '#6b7280' }}>Sin movimientos registrados</p>
                    ) : (
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ borderBottom: '1px solid #374151' }}>
                            <th className="text-left pb-1 pr-4 font-normal" style={{ color: '#6b7280' }}>Fecha</th>
                            <th className="text-left pb-1 pr-4 font-normal" style={{ color: '#6b7280' }}>Tipo</th>
                            <th className="text-right pb-1 pr-4 font-normal" style={{ color: '#6b7280' }}>Cantidad</th>
                            <th className="text-left pb-1 font-normal" style={{ color: '#6b7280' }}>Nota</th>
                          </tr>
                        </thead>
                        <tbody>
                          {insumo.movimientos.map(m => (
                            <tr key={m.id} style={{ borderBottom: '1px solid #374151' }}>
                              <td className="py-1 pr-4 whitespace-nowrap" style={{ color: '#9ca3af' }}>
                                {new Date(m.creado_en).toLocaleDateString('es-CL', {
                                  day: '2-digit', month: '2-digit', year: '2-digit',
                                })}
                              </td>
                              <td className="py-1 pr-4" style={{ color: '#d1d5db' }}>{TIPO_LABELS[m.tipo] ?? m.tipo}</td>
                              <td
                                className="py-1 pr-4 text-right tabular-nums font-medium"
                                style={{ color: m.cantidad >= 0 ? '#10b981' : '#ef4444' }}
                              >
                                {m.cantidad >= 0 ? '+' : ''}{m.cantidad}
                              </td>
                              <td className="py-1" style={{ color: '#6b7280' }}>{m.nota ?? '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
