'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { ajustarStocks } from '@/features/inventory/actions'
import { formatCLP } from '@/lib/utils'

type VarianteInventario = {
  id: string
  sku: string
  precio: number
  stock: number
}

interface InventoryPanelProps {
  productoId: string
  variantes: VarianteInventario[]
}

export default function InventoryPanel({ productoId, variantes }: InventoryPanelProps) {
  const [stocks, setStocks] = useState<Record<string, number>>(
    Object.fromEntries(variantes.map(v => [v.id, v.stock]))
  )
  const [saving, startSave] = useTransition()

  const totalActual = variantes.reduce((acc, v) => acc + v.stock, 0)

  function handleSave() {
    const ajustes = variantes
      .map(v => ({ varianteId: v.id, nuevoStock: stocks[v.id] ?? v.stock, stockActual: v.stock }))
      .filter(a => a.nuevoStock !== a.stockActual)

    if (ajustes.length === 0) {
      toast.info('Sin cambios de stock')
      return
    }

    startSave(async () => {
      const result = await ajustarStocks(productoId, ajustes)
      if (result.error) toast.error(result.error)
      else toast.success(result.success ?? 'Stock actualizado')
    })
  }

  if (variantes.length === 0) {
    return (
      <p className="text-sm text-stone-400 py-2">
        Genera variantes primero para gestionar el inventario.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-stone-500">
        Stock total: <span className="font-semibold text-stone-700 tabular-nums">{totalActual}</span> unidades
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="text-left pb-2 pr-4 text-xs font-normal text-stone-400">SKU</th>
              <th className="text-left pb-2 pr-4 text-xs font-normal text-stone-400">Precio</th>
              <th className="text-center pb-2 pr-4 text-xs font-normal text-stone-400">Stock actual</th>
              <th className="text-center pb-2 text-xs font-normal text-stone-400">Nuevo stock</th>
            </tr>
          </thead>
          <tbody>
            {variantes.map(v => {
              const current = v.stock
              const nuevo = stocks[v.id] ?? current
              const changed = nuevo !== current

              return (
                <tr key={v.id} className="border-b border-stone-50">
                  <td className="py-2 pr-4 font-mono text-xs text-stone-700">{v.sku}</td>
                  <td className="py-2 pr-4 text-xs text-stone-600">{formatCLP(v.precio)}</td>
                  <td className="py-2 pr-4 text-center">
                    <span
                      className={`text-xs px-2 py-0.5 ${
                        current > 3
                          ? 'bg-green-50 text-green-700'
                          : current > 0
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {current}
                    </span>
                  </td>
                  <td className="py-2 text-center">
                    <input
                      type="number"
                      value={nuevo}
                      min={0}
                      step={1}
                      onChange={e =>
                        setStocks(prev => ({ ...prev, [v.id]: Number(e.target.value) }))
                      }
                      className={`w-20 border px-2 py-1 text-xs text-center focus:outline-none transition-colors ${
                        changed ? 'border-stone-400 bg-stone-50' : 'border-stone-200'
                      }`}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 text-xs bg-stone-800 text-white hover:bg-stone-700 transition-colors disabled:opacity-50"
      >
        {saving ? 'Guardando…' : 'Guardar ajustes de stock'}
      </button>
    </div>
  )
}
