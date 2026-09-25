'use client'

import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import { createMovimientoInventario } from '@/features/inventory/actions'
import { formatCLP } from '@/lib/utils'

type Variante = { id: string; sku: string; precio: number; stock: number | null }

type ActionState = { error?: string; success?: string }

interface InventoryFormProps {
  productoId: string
  variantes: Variante[]
}

export default function InventoryForm({ productoId, variantes }: InventoryFormProps) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createMovimientoInventario,
    {}
  )

  useEffect(() => {
    if (state.error) toast.error(state.error)
    if (state.success) toast.success(state.success)
  }, [state])

  if (variantes.length === 0) {
    return (
      <div className="bg-white border border-stone-100 rounded-sm p-10 text-center text-stone-400 text-sm">
        Crea variantes primero para registrar movimientos de inventario
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-stone-100 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="text-left px-4 py-3 text-xs font-normal text-stone-500 uppercase tracking-wider">SKU</th>
              <th className="text-left px-4 py-3 text-xs font-normal text-stone-500 uppercase tracking-wider">Precio</th>
              <th className="text-right px-4 py-3 text-xs font-normal text-stone-500 uppercase tracking-wider">Stock</th>
            </tr>
          </thead>
          <tbody>
            {variantes.map((v) => (
              <tr key={v.id} className="border-b border-stone-50">
                <td className="px-4 py-3 font-mono text-xs text-stone-700">{v.sku}</td>
                <td className="px-4 py-3 text-stone-600 text-sm">{formatCLP(v.precio)}</td>
                <td className="px-4 py-3 text-right font-medium text-stone-800">
                  {v.stock ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-stone-100 rounded-sm p-6">
        <h3 className="text-sm font-medium text-stone-700 mb-4">Registrar movimiento</h3>
        <form action={formAction} className="space-y-4 max-w-md">
          <input type="hidden" name="producto_id" value={productoId} />

          <div>
            <label className="block text-xs text-stone-500 mb-1">Variante *</label>
            <select
              name="variante_id"
              required
              className="w-full border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-stone-400 bg-white"
            >
              {variantes.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.sku} (stock: {v.stock ?? 0})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-stone-500 mb-1">Tipo *</label>
              <select
                name="tipo"
                required
                className="w-full border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-stone-400 bg-white"
              >
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="ajuste">Ajuste</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Cantidad *</label>
              <input
                name="cantidad"
                type="number"
                required
                className="w-full border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-stone-400"
                placeholder="10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-stone-500 mb-1">Nota</label>
            <input
              name="nota"
              type="text"
              className="w-full border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-stone-400"
              placeholder="Descripción del movimiento (opcional)"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2 text-sm bg-stone-800 text-white hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Registrando...' : 'Registrar movimiento'}
          </button>
        </form>
      </div>
    </div>
  )
}
