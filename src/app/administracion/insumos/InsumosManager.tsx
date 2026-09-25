'use client'

import { useState, useTransition, useActionState } from 'react'
import { toast } from 'sonner'
import { createInsumo, registrarEntradaInsumo } from '@/features/insumos/actions'
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

function NuevoInsumoForm({ onClose }: { onClose: () => void }) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(createInsumo, {})

  if (state.success) onClose()

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
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 text-xs border border-stone-200 text-stone-600 hover:bg-stone-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

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

export default function InsumosManager({ insumos }: { insumos: InsumoConStock[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  function toggleRow(id: string) {
    setExpandedId(prev => (prev === id ? null : id))
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

      {showNewForm && <NuevoInsumoForm onClose={() => setShowNewForm(false)} />}

      <div className="bg-white border border-stone-100">
        {insumos.length === 0 ? (
          <p className="py-12 text-center text-sm text-stone-400">No hay insumos registrados</p>
        ) : (
          insumos.map((insumo, idx) => (
            <div key={insumo.id} className={idx > 0 ? 'border-t border-stone-100' : ''}>
              {/* Row header */}
              <button
                type="button"
                onClick={() => toggleRow(insumo.id)}
                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-stone-50 transition-colors text-left"
              >
                <span className="flex-1 text-sm text-stone-800">{insumo.nombre}</span>
                <span className="text-xs text-stone-400 mr-2">{insumo.unidad}</span>
                <StockBadge stock={insumo.stock} />
                <svg
                  className={`w-4 h-4 text-stone-400 transition-transform duration-150 ml-2 ${expandedId === insumo.id ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded content */}
              {expandedId === insumo.id && (
                <div className="px-4 pb-4 pt-1 space-y-4 bg-stone-50 border-t border-stone-100">
                  {insumo.descripcion && (
                    <p className="text-xs text-stone-500">{insumo.descripcion}</p>
                  )}

                  <div>
                    <p className="text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">
                      Registrar entrada
                    </p>
                    <EntradaForm insumoId={insumo.id} />
                  </div>

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
