'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { generateVariantesV2, upsertVariantes, type ActionState } from '@/features/variants/actions'
import { ajustarStocks } from '@/features/inventory/actions'

type ValorAtributo = { id: string; valor: string; slug: string }
type AtributoConValores = { id: string; nombre: string; valores_atributo: ValorAtributo[] }

type VarianteConStock = {
  id: string
  sku: string
  precio: number
  activo: boolean
  permite_a_pedido: boolean
  stock: number
  variante_valores_atributo: Array<{
    valor_atributo_id: string
    valores_atributo: ValorAtributo | null
  }>
}

interface VariantManagerProps {
  productoId: string
  productoSlug: string
  precioBase: number
  atributosDisponibles: AtributoConValores[]
  atributosAsignados: string[]
  variantes: VarianteConStock[]
}

type EditableRow = {
  id: string
  label: string
  sku: string
  precio: number
  activo: boolean
  permite_a_pedido: boolean
  stock: number
  nuevoStock: number
}

function buildRows(variantes: VarianteConStock[]): EditableRow[] {
  return variantes.map(v => ({
    id: v.id,
    label:
      v.variante_valores_atributo
        .map(vv => vv.valores_atributo?.valor)
        .filter(Boolean)
        .join(' / ') || v.sku,
    sku: v.sku,
    precio: v.precio,
    activo: v.activo,
    permite_a_pedido: v.permite_a_pedido,
    stock: v.stock,
    nuevoStock: v.stock,
  }))
}

export default function VariantManager({
  productoId,
  productoSlug,
  precioBase,
  atributosDisponibles,
  atributosAsignados,
  variantes,
}: VariantManagerProps) {
  const [selectedAttrs, setSelectedAttrs] = useState<string[]>(atributosAsignados)
  const [rows, setRows] = useState<EditableRow[]>(() => buildRows(variantes))
  const [generating, startGenerate] = useTransition()
  const [saving, startSave] = useTransition()

  function toggleAttr(id: string) {
    setSelectedAttrs(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  function updateRow(index: number, field: keyof EditableRow, value: string | number | boolean) {
    setRows(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  function handleGenerate() {
    startGenerate(async () => {
      const result = await generateVariantesV2(productoId, productoSlug, selectedAttrs, precioBase)
      if (result.error) toast.error(result.error)
      else toast.success(result.success ?? 'Variantes generadas')
    })
  }

  function handleSave() {
    if (rows.length === 0) return
    startSave(async () => {
      const stockChanges = rows.filter(r => r.nuevoStock !== r.stock)
      const [saveResult, stockResult] = await Promise.all([
        upsertVariantes(
          productoId,
          rows.map(r => ({
            id: r.id,
            sku: r.sku,
            precio: r.precio,
            activo: r.activo,
            permite_a_pedido: r.permite_a_pedido,
          }))
        ),
        stockChanges.length > 0
          ? ajustarStocks(productoId, stockChanges.map(r => ({
              varianteId: r.id,
              nuevoStock: r.nuevoStock,
              stockActual: r.stock,
            })))
          : Promise.resolve({ success: '' } as ActionState),
      ])
      if (saveResult.error) toast.error(saveResult.error)
      else if (stockResult.error) toast.error(stockResult.error)
      else toast.success('Variantes guardadas')
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Attribute selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Atributos</p>
        {atributosDisponibles.length === 0 ? (
          <p style={{ fontSize: 14, color: '#6b7280' }}>
            No hay atributos configurados con valores activos.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {atributosDisponibles.map(attr => (
              <label key={attr.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedAttrs.includes(attr.id)}
                  onChange={() => toggleAttr(attr.id)}
                  style={{ marginTop: 2, width: 16, height: 16, accentColor: '#6366f1', cursor: 'pointer' }}
                />
                <div>
                  <span style={{ fontSize: 14, color: '#d1d5db' }}>{attr.nombre}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                    {attr.valores_atributo.map(v => (
                      <span
                        key={v.id}
                        style={{ fontSize: 11, padding: '2px 6px', background: '#374151', color: '#9ca3af', borderRadius: 4 }}
                      >
                        {v.valor}
                      </span>
                    ))}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: 12, background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.5 : 1, transition: 'opacity 0.2s' }}
        >
          {generating ? 'Generando…' : rows.length > 0 ? 'Regenerar variantes' : 'Generar variantes'}
        </button>
        {rows.length > 0 && (
          <p style={{ fontSize: 11, color: '#6b7280' }}>
            Regenerar desactiva las variantes anteriores sin eliminarlas.
          </p>
        )}
      </div>

      {/* Variant table */}
      {rows.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {rows.length} variante{rows.length !== 1 ? 's' : ''}
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #374151' }}>
                  <th style={{ textAlign: 'left', paddingBottom: 8, paddingRight: 12, fontSize: 11, fontWeight: 400, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                    Variante
                  </th>
                  <th style={{ textAlign: 'left', paddingBottom: 8, paddingRight: 12, fontSize: 11, fontWeight: 400, color: '#9ca3af' }}>SKU</th>
                  <th style={{ textAlign: 'left', paddingBottom: 8, paddingRight: 12, fontSize: 11, fontWeight: 400, color: '#9ca3af' }}>Precio</th>
                  <th style={{ textAlign: 'center', paddingBottom: 8, paddingRight: 12, fontSize: 11, fontWeight: 400, color: '#9ca3af', whiteSpace: 'nowrap' }}>Stock actual</th>
                  <th style={{ textAlign: 'center', paddingBottom: 8, paddingRight: 12, fontSize: 11, fontWeight: 400, color: '#9ca3af', whiteSpace: 'nowrap' }}>Nuevo stock</th>
                  <th style={{ textAlign: 'center', paddingBottom: 8, paddingRight: 12, fontSize: 11, fontWeight: 400, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                    A pedido
                  </th>
                  <th style={{ textAlign: 'center', paddingBottom: 8, fontSize: 11, fontWeight: 400, color: '#9ca3af' }}>Activa</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #374151' }}>
                    <td style={{ paddingTop: 8, paddingBottom: 8, paddingRight: 12, color: '#d1d5db', fontSize: 12, whiteSpace: 'nowrap', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.label}
                    </td>
                    <td style={{ paddingTop: 8, paddingBottom: 8, paddingRight: 12 }}>
                      <input
                        value={row.sku}
                        onChange={e => updateRow(i, 'sku', e.target.value)}
                        style={{ ...inputStyle, fontFamily: 'monospace', width: '100%', minWidth: 130 }}
                      />
                    </td>
                    <td style={{ paddingTop: 8, paddingBottom: 8, paddingRight: 12 }}>
                      <input
                        type="number"
                        value={row.precio}
                        min={0}
                        step={10}
                        onChange={e => updateRow(i, 'precio', Number(e.target.value))}
                        style={{ ...inputStyle, width: 96 }}
                      />
                    </td>
                    <td style={{ paddingTop: 8, paddingBottom: 8, paddingRight: 12, textAlign: 'center', fontSize: 12, color: '#9ca3af', fontVariantNumeric: 'tabular-nums' }}>
                      {row.stock}
                    </td>
                    <td style={{ paddingTop: 8, paddingBottom: 8, paddingRight: 12 }}>
                      <input
                        type="number"
                        value={row.nuevoStock}
                        min={0}
                        step={1}
                        onChange={e => updateRow(i, 'nuevoStock', Number(e.target.value))}
                        style={{
                          ...inputStyle,
                          width: 80,
                          textAlign: 'center',
                          border: row.nuevoStock !== row.stock ? '1px solid #6366f1' : '1px solid #374151',
                        }}
                      />
                    </td>
                    <td style={{ paddingTop: 8, paddingBottom: 8, paddingRight: 12, textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={row.permite_a_pedido}
                        onChange={e => updateRow(i, 'permite_a_pedido', e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: '#6366f1', cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ paddingTop: 8, paddingBottom: 8, textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={row.activo}
                        onChange={e => updateRow(i, 'activo', e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: '#6366f1', cursor: 'pointer' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: 12, background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1, transition: 'opacity 0.2s' }}
          >
            {saving ? 'Guardando…' : 'Guardar variantes'}
          </button>
        </div>
      )}
    </div>
  )
}
