'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { guardarCaracteristicas } from '@/features/products/actions'

type Caracteristica = { nombre: string; valor: string }

interface Props {
  productoId: string
  inicial: Caracteristica[]
}

export default function CaracteristicasEditor({ productoId, inicial }: Props) {
  const [rows, setRows] = useState<Caracteristica[]>(inicial)
  const [saving, startSave] = useTransition()

  function addRow() {
    setRows(prev => [...prev, { nombre: '', valor: '' }])
  }

  function removeRow(i: number) {
    setRows(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateRow(i: number, field: 'nombre' | 'valor', value: string) {
    setRows(prev => {
      const next = [...prev]
      next[i] = { ...next[i], [field]: value }
      return next
    })
  }

  function handleSave() {
    const clean = rows.filter(r => r.nombre.trim() && r.valor.trim())
    startSave(async () => {
      const result = await guardarCaracteristicas(productoId, clean)
      if (result.error) toast.error(result.error)
      else toast.success(result.success ?? 'Guardado')
    })
  }

  return (
    <div className="space-y-3">
      {rows.length > 0 && (
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={row.nombre}
                onChange={e => updateRow(i, 'nombre', e.target.value)}
                placeholder="Nombre (ej: Material)"
                className="w-40 border border-stone-200 px-2 py-1.5 text-sm focus:outline-none focus:border-stone-400"
              />
              <input
                value={row.valor}
                onChange={e => updateRow(i, 'valor', e.target.value)}
                placeholder="Valor (ej: Plata 925)"
                className="flex-1 border border-stone-200 px-2 py-1.5 text-sm focus:outline-none focus:border-stone-400"
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="text-stone-300 hover:text-red-400 transition-colors w-6 text-lg leading-none"
                aria-label="Eliminar fila"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {rows.length === 0 && (
        <p className="text-xs text-stone-400">
          Sin características definidas. Agrega pares nombre/valor para describir la pieza.
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={addRow}
          className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
        >
          + Agregar característica
        </button>
        {rows.length > 0 && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 text-xs bg-stone-800 text-white hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        )}
      </div>
    </div>
  )
}
