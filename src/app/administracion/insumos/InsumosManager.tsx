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
  if (stock > 10) return <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700">En stock ({stock})</span>
  if (stock > 0) return <span className="text-xs px-2 py-0.5 bg-yellow-50 text-yellow-700">Stock bajo ({stock})</span>
  return <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600">Sin stock</span>
}

// ── Formulario nuevo insumo ────────────────────────────────────────────────────

function NuevoInsumoForm({ onClose }: { onClose: () => void }) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(createInsumo, {})

  // React 19: never call setState during render — use effect for side effects
  useEffect(() => {
    if (state.success) onClose()
  }, [state.success, onClose])

  return (
    <form action={formAction} className="bg-stone-50 border border-stone-100 p-4 space-y-3">
      <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Nuevo insumo</p>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-stone-500 mb-1">Nombre *</label>
          <input
            name="nombre"
            required
            className="w-full border border-stone-200 px-2 py-1.5 text-sm focus:outline-none focus:border-stone-400"
            placeholder="Cadena plata 45cm"
          />
        </div>
        <div>
          <label className="block text-xs text-stone-500 mb-1">Unidad</label>
          <select
            name="unidad"
            className="w-full border border-stone-200 px-2 py-1.5 text-sm focus:outline-none focus:border-stone-400 bg-white"
          >
            <option value="unidad">Unidad</option>
            <option value="metro">Metro</option>
            <option value="gramo">Gramo</option>
            <option value="ml">Mililitro</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs text-stone-500 mb-1">Descripción (opcional)</label>
        <input
          name="descripcion"
          className="w-full border border-stone-200 px-2 py-1.5 text-sm focus:outline-none focus:border-stone-400"
          placeholder="Descripción breve"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-1.5 text-xs bg-stone-800 text-white hover:bg-stone-700 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Creando...' : 'Crear insumo'}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-1.5 text-xs border border-stone-200 text-stone-600 hover:bg-stone-50">
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
      className="relative w-20 h-20 border-2 border-dashed flex-shrink-0 overflow-hidden"
      style={{ borderColor: '#D4C4A8' }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
      {isPending ? (
        <div className="w-full h-full flex items-center justify-center bg-stone-50">
          <span className="text-xs text-stone-400">...</span>
        </div>
      ) : url ? (
        <>
          <img src={`${storageUrl}/${url}`} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleDelete}
            className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white flex items-center justify-center text-sm leading-none hover:bg-black/80 transition-colors"
            aria-label="Eliminar imagen"
          >
            ×
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-full flex flex-col items-center justify-center gap-1 hover:bg-stone-50 transition-colors"
          aria-label="Subir foto"
        >
          <svg className="w-6 h-6 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs text-stone-300">Foto</span>
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
            <label className="block text-xs text-stone-400 mb-1">Nombre</label>
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="w-full border border-stone-200 px-2 py-1.5 text-sm focus:outline-none focus:border-stone-400"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-400 mb-1">Unidad</label>
            <select
              value={unidad}
              onChange={e => setUnidad(e.target.value)}
              className="w-full border border-stone-200 px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-stone-400"
            >
              <option value="unidad">Unidad</option>
              <option value="metro">Metro</option>
              <option value="gramo">Gramo</option>
              <option value="ml">Mililitro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-stone-400 mb-1">Descripción</label>
            <input
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              className="w-full border border-stone-200 px-2 py-1.5 text-sm focus:outline-none focus:border-stone-400"
              placeholder="Opcional"
            />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || !nombre.trim()}
          className="px-4 py-1.5 text-xs bg-stone-800 text-white hover:bg-stone-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 text-xs border border-stone-200 text-stone-600 hover:bg-stone-50"
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
        <label className="block text-xs text-stone-400 mb-1">Cantidad</label>
        <input
          type="number"
          value={cantidad}
          min={1}
          onChange={e => setCantidad(Number(e.target.value))}
          className="w-20 border border-stone-200 px-2 py-1.5 text-xs focus:outline-none focus:border-stone-400"
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs text-stone-400 mb-1">Nota (opcional)</label>
        <input
          type="text"
          value={nota}
          onChange={e => setNota(e.target.value)}
          placeholder="ej: lote enero"
          className="w-full border border-stone-200 px-2 py-1.5 text-xs focus:outline-none focus:border-stone-400"
        />
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={saving || cantidad <= 0}
        className="px-3 py-1.5 text-xs bg-stone-700 text-white hover:bg-stone-600 transition-colors disabled:opacity-50 whitespace-nowrap"
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

  // Stable callback references to avoid useEffect loops in children
  const handleCloseNewForm = useCallback(() => setShowNewForm(false), [])

  function toggleRow(id: string) {
    setExpandedId(prev => (prev === id ? null : id))
    // Exit edit mode when collapsing
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
        <p className="text-sm text-stone-500">{insumos.length} insumo{insumos.length !== 1 ? 's' : ''}</p>
        <button
          type="button"
          onClick={() => setShowNewForm(v => !v)}
          className="px-4 py-2 text-xs bg-stone-800 text-white hover:bg-stone-700 transition-colors"
        >
          {showNewForm ? 'Cancelar' : '+ Nuevo insumo'}
        </button>
      </div>

      {showNewForm && <NuevoInsumoForm onClose={handleCloseNewForm} />}

      <div className="bg-white border border-stone-100">
        {insumos.length === 0 ? (
          <p className="py-12 text-center text-sm text-stone-400">No hay insumos registrados</p>
        ) : (
          insumos.map((insumo, idx) => (
            <div key={insumo.id} className={idx > 0 ? 'border-t border-stone-100' : ''}>
              {/* Fila */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleRow(insumo.id)}
                onKeyDown={e => e.key === 'Enter' && toggleRow(insumo.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                {/* Miniatura 48×48 */}
                {insumo.imagen_url ? (
                  <img
                    src={`${storageUrl}/${insumo.imagen_url}`}
                    alt=""
                    className="w-12 h-12 object-cover border border-stone-100 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-stone-50 border border-stone-100 flex-shrink-0" />
                )}

                <span className="flex-1 text-sm text-stone-800">{insumo.nombre}</span>
                <span className="text-xs text-stone-400">{insumo.unidad}</span>
                <StockBadge stock={insumo.stock} />

                {/* Botón Editar */}
                <button
                  type="button"
                  onClick={e => handleEditar(e, insumo.id)}
                  className={`ml-1 px-2.5 py-1 text-xs border transition-colors ${
                    editingId === insumo.id
                      ? 'bg-stone-800 text-white border-stone-800'
                      : 'border-stone-200 text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  Editar
                </button>

                <svg
                  className={`w-4 h-4 text-stone-400 transition-transform duration-150 ml-1 flex-shrink-0 ${expandedId === insumo.id ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Contenido expandido */}
              {expandedId === insumo.id && (
                <div className="px-4 pb-4 pt-3 space-y-4 bg-stone-50 border-t border-stone-100">

                  {/* Modo edición */}
                  {editingId === insumo.id ? (
                    <>
                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-wider">
                          Editar insumo
                        </p>
                        <InsumoEditForm
                          key={insumo.id}
                          insumo={insumo}
                          storageUrl={storageUrl}
                          onClose={handleCloseEdit}
                        />
                      </div>
                      <hr className="border-stone-200" />
                    </>
                  ) : (
                    /* Modo lectura: mostrar descripción */
                    insumo.descripcion && (
                      <p className="text-xs text-stone-500">{insumo.descripcion}</p>
                    )
                  )}

                  {/* Registrar entrada */}
                  <div>
                    <p className="text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">
                      Registrar entrada
                    </p>
                    <EntradaForm insumoId={insumo.id} />
                  </div>

                  {/* Historial */}
                  <div>
                    <p className="text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">
                      Últimos movimientos
                    </p>
                    {insumo.movimientos.length === 0 ? (
                      <p className="text-xs text-stone-400">Sin movimientos registrados</p>
                    ) : (
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-stone-200">
                            <th className="text-left pb-1 pr-4 font-normal text-stone-400">Fecha</th>
                            <th className="text-left pb-1 pr-4 font-normal text-stone-400">Tipo</th>
                            <th className="text-right pb-1 pr-4 font-normal text-stone-400">Cantidad</th>
                            <th className="text-left pb-1 font-normal text-stone-400">Nota</th>
                          </tr>
                        </thead>
                        <tbody>
                          {insumo.movimientos.map(m => (
                            <tr key={m.id} className="border-b border-stone-100">
                              <td className="py-1 pr-4 text-stone-500 whitespace-nowrap">
                                {new Date(m.creado_en).toLocaleDateString('es-CL', {
                                  day: '2-digit', month: '2-digit', year: '2-digit',
                                })}
                              </td>
                              <td className="py-1 pr-4 text-stone-600">{TIPO_LABELS[m.tipo] ?? m.tipo}</td>
                              <td className={`py-1 pr-4 text-right tabular-nums font-medium ${m.cantidad >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                {m.cantidad >= 0 ? '+' : ''}{m.cantidad}
                              </td>
                              <td className="py-1 text-stone-400">{m.nota ?? '—'}</td>
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
