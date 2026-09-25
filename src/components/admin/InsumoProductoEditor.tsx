'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { upsertProductoInsumo, deleteProductoInsumo } from '@/features/insumos/actions'

type InsumoLink = {
  insumo_id: string
  nombre: string
  unidad: string
  cantidad_por_unidad: number
  nota: string | null
}

type InsumoBasico = {
  id: string
  nombre: string
  unidad: string
}

interface InsumoProductoEditorProps {
  productoId: string
  insumos: InsumoLink[]
  todosInsumos: InsumoBasico[]
}

export default function InsumoProductoEditor({
  productoId,
  insumos,
  todosInsumos,
}: InsumoProductoEditorProps) {
  const linkedIds = new Set(insumos.map(i => i.insumo_id))
  const disponibles = todosInsumos.filter(i => !linkedIds.has(i.id))

  const [selectedId, setSelectedId] = useState(disponibles[0]?.id ?? '')
  const [cantidad, setCantidad] = useState<number>(1)
  const [nota, setNota] = useState('')
  const [adding, startAdd] = useTransition()
  const [removing, startRemove] = useTransition()

  function handleAdd() {
    if (!selectedId || cantidad <= 0) return
    startAdd(async () => {
      const result = await upsertProductoInsumo(productoId, selectedId, cantidad, nota || undefined)
      if (result.error) toast.error(result.error)
      else {
        toast.success(result.success ?? 'Insumo agregado')
        setCantidad(1)
        setNota('')
      }
    })
  }

  function handleRemove(insumoId: string) {
    startRemove(async () => {
      const result = await deleteProductoInsumo(productoId, insumoId)
      if (result.error) toast.error(result.error)
      else toast.success(result.success ?? 'Insumo quitado')
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-stone-400 italic">
        Esta información es referencial para fabricación. No afecta el stock de insumos automáticamente.
      </p>

      {/* Current insumos list */}
      {insumos.length > 0 ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="text-left pb-2 pr-4 text-xs font-normal text-stone-400">Insumo</th>
              <th className="text-left pb-2 pr-4 text-xs font-normal text-stone-400">Cantidad por unidad</th>
              <th className="text-left pb-2 pr-4 text-xs font-normal text-stone-400">Nota</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {insumos.map(i => (
              <tr key={i.insumo_id} className="border-b border-stone-50">
                <td className="py-2 pr-4 text-stone-700 text-xs">
                  {i.nombre}
                  <span className="ml-1 text-stone-400">({i.unidad})</span>
                </td>
                <td className="py-2 pr-4 text-xs tabular-nums text-stone-600">{i.cantidad_por_unidad}</td>
                <td className="py-2 pr-4 text-xs text-stone-400">{i.nota ?? '—'}</td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemove(i.insumo_id)}
                    disabled={removing}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                  >
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-xs text-stone-400">No hay insumos asociados a este producto.</p>
      )}

      {/* Add insumo form */}
      {disponibles.length > 0 && (
        <div className="flex items-end gap-3 pt-1">
          <div className="flex-1">
            <label className="block text-xs text-stone-400 mb-1">Insumo</label>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="w-full border border-stone-200 px-2 py-1.5 text-xs focus:outline-none focus:border-stone-400 bg-white"
            >
              {disponibles.map(i => (
                <option key={i.id} value={i.id}>{i.nombre} ({i.unidad})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-stone-400 mb-1">Cant. x unidad</label>
            <input
              type="number"
              value={cantidad}
              min={0.001}
              step={0.001}
              onChange={e => setCantidad(Number(e.target.value))}
              className="w-24 border border-stone-200 px-2 py-1.5 text-xs focus:outline-none focus:border-stone-400"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-stone-400 mb-1">Nota (opcional)</label>
            <input
              type="text"
              value={nota}
              onChange={e => setNota(e.target.value)}
              placeholder="ej: color plata"
              className="w-full border border-stone-200 px-2 py-1.5 text-xs focus:outline-none focus:border-stone-400"
            />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding || !selectedId || cantidad <= 0}
            className="px-3 py-1.5 text-xs bg-stone-700 text-white hover:bg-stone-600 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {adding ? '...' : 'Agregar'}
          </button>
        </div>
      )}
    </div>
  )
}
