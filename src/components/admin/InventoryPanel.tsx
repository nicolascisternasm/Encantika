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

function stockBadgeStyle(stock: number): React.CSSProperties {
  if (stock > 3) return { background: 'rgba(16,185,129,0.12)', color: '#10b981' }
  if (stock > 0) return { background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }
  return { background: 'rgba(239,68,68,0.1)', color: '#ef4444' }
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stock input */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Unidades en stock
          </label>
          <input
            type="number"
            value={nuevoStock}
            min={0}
            step={1}
            onChange={e => setNuevoStock(Number(e.target.value))}
            style={{
              width: 112,
              background: '#1f2937',
              border: nuevoStock !== stockActual ? '1px solid #6366f1' : '1px solid #374151',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 14,
              color: '#f9fafb',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </div>
        <div style={{ paddingBottom: 2 }}>
          <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 4, ...stockBadgeStyle(stockActual) }}>
            {stockBadgeLabel(stockActual)}
          </span>
        </div>
        <div style={{ paddingBottom: 2 }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '8px 16px', fontSize: 12, background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1, transition: 'opacity 0.2s' }}
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
