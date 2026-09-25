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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-stone-600">
            {variantes.length} variante{variantes.length !== 1 ? 's' : ''}
          </p>
          {atributos.length > 0 && (
            <p className="text-xs text-stone-400 mt-0.5">
              Atributos: {atributos.map((a) => a.nombre).join(', ')}
            </p>
          )}
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 text-xs bg-stone-800 text-white hover:bg-stone-700 transition-colors disabled:opacity-50"
        >
          {generating ? 'Generando...' : 'Generar variantes'}
        </button>
      </div>

      {variantes.length === 0 ? (
        <div className="bg-white border border-stone-100 rounded-sm p-10 text-center text-stone-400 text-sm">
          No hay variantes. Asigna atributos y genera las combinaciones.
        </div>
      ) : (
        <div className="bg-white border border-stone-100 rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left px-4 py-3 text-xs font-normal text-stone-500 uppercase tracking-wider">Variante</th>
                <th className="text-left px-4 py-3 text-xs font-normal text-stone-500 uppercase tracking-wider">SKU</th>
                <th className="text-left px-4 py-3 text-xs font-normal text-stone-500 uppercase tracking-wider">Precio</th>
                <th className="text-left px-4 py-3 text-xs font-normal text-stone-500 uppercase tracking-wider">Estado</th>
                <th className="text-right px-4 py-3"></th>
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

  if (editing) {
    return (
      <tr className="border-b border-stone-50 bg-stone-50">
        <td className="px-4 py-3 text-stone-700 text-sm">{label}</td>
        <td colSpan={3} className="px-4 py-2">
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <input
              name="sku"
              defaultValue={variante.sku}
              className="border border-stone-200 px-2 py-1 text-xs font-mono w-36 focus:outline-none focus:border-stone-400"
              placeholder="SKU"
            />
            <input
              name="precio"
              type="number"
              min={0}
              defaultValue={variante.precio}
              className="border border-stone-200 px-2 py-1 text-xs w-28 focus:outline-none focus:border-stone-400"
              placeholder="Precio"
            />
            <button
              type="submit"
              disabled={isPending}
              className="text-xs bg-stone-800 text-white px-3 py-1 hover:bg-stone-700 disabled:opacity-50"
            >
              {isPending ? '...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-stone-500 hover:text-stone-700"
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
    <tr className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
      <td className="px-4 py-3 text-stone-700 text-sm">{label}</td>
      <td className="px-4 py-3 text-stone-500 font-mono text-xs">{variante.sku}</td>
      <td className="px-4 py-3 text-stone-700 text-sm">{formatCLP(variante.precio)}</td>
      <td className="px-4 py-3">
        <span
          className={`text-xs px-2 py-0.5 rounded ${
            variante.activo ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-500'
          }`}
        >
          {variante.activo ? 'Activa' : 'Inactiva'}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button onClick={onEdit} className="text-xs text-stone-500 hover:text-stone-800">
          Editar
        </button>
      </td>
    </tr>
  )
}
