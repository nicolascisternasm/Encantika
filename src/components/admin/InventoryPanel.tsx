'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { ajustarStockProducto } from '@/features/inventory/actions'
import CollapsibleSection from './CollapsibleSection'
import InsumoProductoEditor from './InsumoProductoEditor'

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

interface InventoryPanelProps {
  productoId: string
  productoSlug: string
  tipoProducto: string
  stockActual: number
  varianteId: string | null
  insumos: InsumoLink[]
  todosInsumos: InsumoBasico[]
}

function stockBadgeClass(stock: number) {
  if (stock > 3) return 'bg-green-50 text-green-700'
  if (stock > 0) return 'bg-yellow-50 text-yellow-700'
  return 'bg-red-50 text-red-600'
}

function stockBadgeLabel(stock: number) {
  if (stock > 3) return `En stock (${stock})`
  if (stock > 0) return `Stock bajo (${stock})`
  return 'Sin stock'
}

export default function InventoryPanel({
  productoId,
  productoSlug,
  tipoProducto,
  stockActual,
  varianteId,
  insumos,
  todosInsumos,
}: InventoryPanelProps) {
  const [nuevoStock, setNuevoStock] = useState(stockActual)
  const [saving, startSave] = useTransition()

  const insumoKey = insumos.map(i => i.insumo_id).sort().join(',') || 'none'

  function handleSave() {
    if (nuevoStock === stockActual) {
      toast.info('Sin cambios de stock')
      return
    }
    startSave(async () => {
      const result = await ajustarStockProducto(
        productoId,
        productoSlug,
        nuevoStock,
        stockActual,
        varianteId
      )
      if (result.error) toast.error(result.error)
      else toast.success(result.success ?? 'Stock actualizado')
    })
  }

  return (
    <div className="space-y-5">
      {/* Stock input */}
      <div className="flex items-end gap-4 flex-wrap">
        <div>
          <label className="block text-xs text-stone-400 mb-1 uppercase tracking-wider">
            Unidades en stock
          </label>
          <input
            type="number"
            value={nuevoStock}
            min={0}
            step={1}
            onChange={e => setNuevoStock(Number(e.target.value))}
            className={`w-28 border px-3 py-2 text-sm focus:outline-none transition-colors ${
              nuevoStock !== stockActual ? 'border-stone-400 bg-stone-50' : 'border-stone-200'
            }`}
          />
        </div>
        <div className="pb-0.5">
          <span className={`text-xs px-2.5 py-1 ${stockBadgeClass(stockActual)}`}>
            {stockBadgeLabel(stockActual)}
          </span>
        </div>
        <div className="pb-0.5">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-xs bg-stone-800 text-white hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar stock'}
          </button>
        </div>
      </div>

      {/* Insumos section — only for fabricado */}
      {tipoProducto === 'fabricado' && (
        <CollapsibleSection title="Insumos utilizados" defaultOpen={false}>
          <InsumoProductoEditor
            key={insumoKey}
            productoId={productoId}
            insumos={insumos}
            todosInsumos={todosInsumos}
          />
        </CollapsibleSection>
      )}
    </div>
  )
}
