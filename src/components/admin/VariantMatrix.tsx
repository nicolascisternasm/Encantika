'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { generateVariantes, updateVariante } from '@/features/variants/actions'
import { formatCLP } from '@/lib/utils'

type ValorAtributo = { id: string; valor: string; slug: string }
type Atributo = { id: string; nombre: string; valores_atributo: ValorAtributo[] }
type VarianteValor = { valor_atributo_id: string; valores_atributo: ValorAtributo | null }
type Variante = {
  id: string
  sku: string
  precio: number
  activo: boolean
  variante_valores_atributo: VarianteValor[]
}

interface VariantMatrixProps {
  productoId: string
  atributos: Atributo[]
  variantes: Variante[]
}

export default function VariantMatrix({ productoId, atributos, variantes }: VariantMatrixProps) {
  const [generating, startGenerate] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)

  function handleGenerate() {
    if (atributos.length === 0) {
      toast.error('Primero asigna atributos al producto desde la página de edición')
      return
    }
    startGenerate(async () => {
      const result = await generateVariantes(productoId, atributos.map((a) => a.id))
      if (result.error) toast.error(result.error)
      else toast.success(result.success ?? 'Variantes generadas')
    })
  }

  function getVariantLabel(v: Variante): string {
    const labels = v.variante_valores_atributo
      .map((vv) => vv.valores_atributo?.valor)
      .filter(Boolean)
    return labels.length > 0 ? labels.join(' / ') : v.sku
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 14, color: '#d1d5db' }}>
            {variantes.length} variante{variantes.length !== 1 ? 's' : ''}
          </p>
          {atributos.length > 0 && (
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              Atributos: {atributos.map((a) => a.nombre).join(', ')}
            </p>
          )}
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{ padding: '8px 16px', fontSize: 12, background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.5 : 1, transition: 'opacity 0.2s' }}
        >
          {generating ? 'Generando...' : 'Generar variantes'}
        </button>
      </div>

      {variantes.length === 0 ? (
        <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, padding: '40px 20px', textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
          No hay variantes. Asigna atributos y genera las combinaciones.
        </div>
      ) : (
        <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #374151' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 400, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Variante</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 400, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SKU</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 400, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Precio</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 400, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</th>
                <th style={{ padding: '12px 16px' }}></th>
              </tr>
            </thead>
            <tbody>
              {variantes.map((v) => (
                <VarianteRow
                  key={v.id}
                  variante={v}
                  productoId={productoId}
                  label={getVariantLabel(v)}
                  editing={editingId === v.id}
                  onEdit={() => setEditingId(v.id)}
                  onCancel={() => setEditingId(null)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function VarianteRow({
  variante,
  productoId,
  label,
  editing,
  onEdit,
  onCancel,
}: {
  variante: Variante
  productoId: string
  label: string
  editing: boolean
  onEdit: () => void
  onCancel: () => void
}) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('producto_id', productoId)
    fd.set('activo', variante.activo ? 'true' : 'false')
    startTransition(async () => {
      const result = await updateVariante(variante.id, {}, fd)
      if (result.error) toast.error(result.error)
      else {
        toast.success(result.success ?? 'Variante actualizada')
        onCancel()
      }
    })
  }

  const inputStyle: React.CSSProperties = {
    background: '#111827',
    border: '1px solid #374151',
    borderRadius: 6,
    padding: '4px 8px',
    fontSize: 12,
    color: '#f9fafb',
    outline: 'none',
  }

  if (editing) {
    return (
      <tr style={{ borderBottom: '1px solid #374151', background: '#111827' }}>
        <td style={{ padding: '12px 16px', color: '#d1d5db', fontSize: 14 }}>{label}</td>
        <td colSpan={3} style={{ padding: '8px 16px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              name="sku"
              defaultValue={variante.sku}
              style={{ ...inputStyle, fontFamily: 'monospace', width: 144 }}
              placeholder="SKU"
            />
            <input
              name="precio"
              type="number"
              min={0}
              defaultValue={variante.precio}
              style={{ ...inputStyle, width: 112 }}
              placeholder="Precio"
            />
            <button
              type="submit"
              disabled={isPending}
              style={{ fontSize: 12, background: '#6366f1', color: 'white', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.5 : 1 }}
            >
              {isPending ? '...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              style={{ fontSize: 12, background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px 8px' }}
            >
              Cancelar
            </button>
          </form>
        </td>
        <td></td>
      </tr>
    )
  }

  return (
    <tr style={{ borderBottom: '1px solid #374151' }}>
      <td style={{ padding: '12px 16px', color: '#d1d5db', fontSize: 14 }}>{label}</td>
      <td style={{ padding: '12px 16px', color: '#9ca3af', fontFamily: 'monospace', fontSize: 12 }}>{variante.sku}</td>
      <td style={{ padding: '12px 16px', color: '#d1d5db', fontSize: 14 }}>{formatCLP(variante.precio)}</td>
      <td style={{ padding: '12px 16px' }}>
        <span
          style={{
            fontSize: 12,
            padding: '2px 8px',
            borderRadius: 4,
            ...(variante.activo
              ? { background: 'rgba(16,185,129,0.12)', color: '#10b981' }
              : { background: '#374151', color: '#9ca3af' }),
          }}
        >
          {variante.activo ? 'Activa' : 'Inactiva'}
        </span>
      </td>
      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
        <button
          onClick={onEdit}
          style={{ fontSize: 12, background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0 }}
        >
          Editar
        </button>
      </td>
    </tr>
  )
}
