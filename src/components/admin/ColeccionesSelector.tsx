'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { actualizarProductoColecciones } from '@/features/collections/actions'

type Coleccion = { id: string; nombre: string }

interface Props {
  productoId: string
  todas: Coleccion[]
  seleccionadas: string[]
}

export default function ColeccionesSelector({ productoId, todas, seleccionadas: init }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(init))
  const [isPending, startTransition] = useTransition()

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSave() {
    startTransition(async () => {
      const result = await actualizarProductoColecciones(productoId, Array.from(selected))
      if (result.error) toast.error(result.error)
      else toast.success(result.success ?? 'Colecciones actualizadas')
    })
  }

  if (todas.length === 0) {
    return (
      <p className="text-sm text-stone-400 py-2">
        No hay colecciones activas.{' '}
        <a href="/administracion/colecciones" className="underline hover:text-stone-600">
          Créalas en Colecciones
        </a>
        .
      </p>
    )
  }

  return (
    <div className="space-y-4 pt-2">
      <p className="text-xs text-stone-500">Agrupa este producto en una o más colecciones</p>
      <div className="space-y-2">
        {todas.map(col => (
          <label key={col.id} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={selected.has(col.id)}
              onChange={() => toggle(col.id)}
              className="w-4 h-4 accent-stone-800"
            />
            <span className="text-sm text-stone-700 group-hover:text-stone-900 transition-colors">
              {col.nombre}
            </span>
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="px-4 py-2 text-sm bg-stone-800 text-white hover:bg-stone-700 transition-colors disabled:opacity-50"
      >
        {isPending ? 'Guardando…' : 'Guardar colecciones'}
      </button>
    </div>
  )
}
