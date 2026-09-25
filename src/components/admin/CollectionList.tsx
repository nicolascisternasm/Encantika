'use client'

import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import { createColeccion, toggleColeccion } from '@/features/collections/actions'

type Coleccion = {
  id: string
  nombre: string
  slug: string
  activo: boolean
  descripcion: string | null
}

type ActionState = { error?: string; success?: string }

export default function CollectionList({ colecciones }: { colecciones: Coleccion[] }) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(createColeccion, {})

  useEffect(() => {
    if (state.error) toast.error(state.error)
    if (state.success) toast.success(state.success)
  }, [state])

  async function handleToggle(id: string, activo: boolean) {
    const result = await toggleColeccion(id, !activo)
    if (result.error) toast.error(result.error)
    else toast.success(result.success ?? 'Colección actualizada')
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-stone-100 rounded-sm overflow-hidden">
        {colecciones.length === 0 ? (
          <div className="p-10 text-center text-stone-400 text-sm">No hay colecciones todavía</div>
        ) : (
          <ul className="divide-y divide-stone-50">
            {colecciones.map((col) => (
              <li key={col.id} className="flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition-colors">
                <div>
                  <span className="text-sm text-stone-800">{col.nombre}</span>
                  <span className="ml-2 text-xs text-stone-400 font-mono">{col.slug}</span>
                  {col.descripcion && (
                    <p className="text-xs text-stone-400 mt-0.5">{col.descripcion}</p>
                  )}
                </div>
                <button
                  onClick={() => handleToggle(col.id, col.activo)}
                  className={`text-xs px-2 py-0.5 rounded transition-colors ${
                    col.activo
                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                      : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  {col.activo ? 'Activa' : 'Inactiva'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white border border-stone-100 rounded-sm p-6">
        <h3 className="text-sm font-medium text-stone-700 mb-4">Nueva colección</h3>
        <form action={formAction} className="space-y-3 max-w-md">
          <input
            name="nombre"
            type="text"
            placeholder="Nombre de la colección"
            required
            className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400"
          />
          <textarea
            name="descripcion"
            placeholder="Descripción (opcional)"
            rows={2}
            className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400 resize-none"
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-sm bg-stone-800 text-white hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            {isPending ? '...' : 'Crear colección'}
          </button>
        </form>
      </div>
    </div>
  )
}
