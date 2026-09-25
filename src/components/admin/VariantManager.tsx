'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { generateVariantesV2, upsertVariantes } from '@/features/variants/actions'

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
      const result = await upsertVariantes(
        productoId,
        rows.map(r => ({
          id: r.id,
          sku: r.sku,
          precio: r.precio,
          activo: r.activo,
          permite_a_pedido: r.permite_a_pedido,
        }))
      )
      if (result.error) toast.error(result.error)
      else toast.success(result.success ?? 'Variantes guardadas')
    })
  }

  return (
    <div className="space-y-6">
      {/* Attribute selection */}
      <div className="space-y-3">
        <p className="text-xs text-stone-500 uppercase tracking-wider">Atributos</p>
        {atributosDisponibles.length === 0 ? (
          <p className="text-sm text-stone-400">
            No hay atributos configurados con valores activos.
          </p>
        ) : (
          <div className="space-y-2.5">
            {atributosDisponibles.map(attr => (
              <label key={attr.id} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAttrs.includes(attr.id)}
                  onChange={() => toggleAttr(attr.id)}
                  className="mt-0.5 w-4 h-4 accent-stone-700 cursor-pointer"
                />
                <div>
                  <span className="text-sm text-stone-700">{attr.nombre}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {attr.valores_atributo.map(v => (
                      <span
                        key={v.id}
                        className="text-[11px] px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded-sm"
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
          className="px-4 py-2 text-xs bg-stone-800 text-white hover:bg-stone-700 transition-colors disabled:opacity-50"
        >
          {generating ? 'Generando…' : rows.length > 0 ? 'Regenerar variantes' : 'Generar variantes'}
        </button>
        {rows.length > 0 && (
          <p className="text-[11px] text-stone-400">
            Regenerar desactiva las variantes anteriores sin eliminarlas.
          </p>
        )}
      </div>

      {/* Variant table */}
      {rows.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-stone-500 uppercase tracking-wider">
            {rows.length} variante{rows.length !== 1 ? 's' : ''}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left pb-2 pr-3 text-xs font-normal text-stone-400 whitespace-nowrap">
                    Variante
                  </th>
                  <th className="text-left pb-2 pr-3 text-xs font-normal text-stone-400">SKU</th>
                  <th className="text-left pb-2 pr-3 text-xs font-normal text-stone-400">Precio</th>
                  <th className="text-center pb-2 pr-3 text-xs font-normal text-stone-400">Stock</th>
                  <th className="text-center pb-2 pr-3 text-xs font-normal text-stone-400 whitespace-nowrap">
                    A pedido
                  </th>
                  <th className="text-center pb-2 text-xs font-normal text-stone-400">Activa</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id} className="border-b border-stone-50">
                    <td className="py-2 pr-3 text-stone-700 text-xs whitespace-nowrap max-w-[120px] truncate">
                      {row.label}
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        value={row.sku}
                        onChange={e => updateRow(i, 'sku', e.target.value)}
                        className="w-full min-w-[130px] border border-stone-200 px-2 py-1 text-xs font-mono focus:outline-none focus:border-stone-400"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        value={row.precio}
                        min={0}
                        step={10}
                        onChange={e => updateRow(i, 'precio', Number(e.target.value))}
                        className="w-24 border border-stone-200 px-2 py-1 text-xs focus:outline-none focus:border-stone-400"
                      />
                    </td>
                    <td className="py-2 pr-3 text-center text-xs text-stone-600 font-medium tabular-nums">
                      {row.stock}
                    </td>
                    <td className="py-2 pr-3 text-center">
                      <input
                        type="checkbox"
                        checked={row.permite_a_pedido}
                        onChange={e => updateRow(i, 'permite_a_pedido', e.target.checked)}
                        className="w-4 h-4 accent-stone-700 cursor-pointer"
                      />
                    </td>
                    <td className="py-2 text-center">
                      <input
                        type="checkbox"
                        checked={row.activo}
                        onChange={e => updateRow(i, 'activo', e.target.checked)}
                        className="w-4 h-4 accent-stone-700 cursor-pointer"
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
            className="px-4 py-2 text-xs bg-stone-800 text-white hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar variantes'}
          </button>
        </div>
      )}
    </div>
  )
}
