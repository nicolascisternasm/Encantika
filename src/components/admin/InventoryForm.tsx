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
      <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, padding: '40px 20px', textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
        Crea variantes primero para registrar movimientos de inventario
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #374151' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 400, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SKU</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 400, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Precio</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: 11, fontWeight: 400, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock</th>
            </tr>
          </thead>
          <tbody>
            {variantes.map((v) => (
              <tr key={v.id} style={{ borderBottom: '1px solid #374151' }}>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12, color: '#d1d5db' }}>{v.sku}</td>
                <td style={{ padding: '12px 16px', color: '#d1d5db', fontSize: 14 }}>{formatCLP(v.precio)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#f9fafb' }}>
                  {v.stock ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 500, color: '#d1d5db', marginBottom: 16 }}>Registrar movimiento</h3>
        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 448 }}>
          <input type="hidden" name="producto_id" value={productoId} />

          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Variante *</label>
            <select
              name="variante_id"
              required
              style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', borderRadius: 8, padding: '8px 12px', fontSize: 14, color: '#f9fafb', outline: 'none' }}
            >
              {variantes.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.sku} (stock: {v.stock ?? 0})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Tipo *</label>
              <select
                name="tipo"
                required
                style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', borderRadius: 8, padding: '8px 12px', fontSize: 14, color: '#f9fafb', outline: 'none' }}
              >
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="ajuste">Ajuste</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Cantidad *</label>
              <input
                name="cantidad"
                type="number"
                required
                style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', borderRadius: 8, padding: '8px 12px', fontSize: 14, color: '#f9fafb', outline: 'none', boxSizing: 'border-box' }}
                placeholder="10"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Nota</label>
            <input
              name="nota"
              type="text"
              style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', borderRadius: 8, padding: '8px 12px', fontSize: 14, color: '#f9fafb', outline: 'none', boxSizing: 'border-box' }}
              placeholder="Descripción del movimiento (opcional)"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            style={{ alignSelf: 'flex-start', padding: '8px 24px', fontSize: 14, background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.5 : 1, transition: 'opacity 0.2s' }}
          >
            {isPending ? 'Registrando...' : 'Registrar movimiento'}
          </button>
        </form>
      </div>
    </div>
  )
}
