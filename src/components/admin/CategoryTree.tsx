'use client'

import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import { createCategoria, toggleCategoria } from '@/features/categories/actions'

type Categoria = {
  id: string
  nombre: string
  slug: string
  activo: boolean
  orden: number
  categoria_padre_id: string | null
}

type ActionState = { error?: string; success?: string }

export default function CategoryTree({ categorias }: { categorias: Categoria[] }) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(createCategoria, {})

  useEffect(() => {
    if (state.error) toast.error(state.error)
    if (state.success) toast.success(state.success)
  }, [state])

  async function handleToggle(id: string, activo: boolean) {
    const result = await toggleCategoria(id, !activo)
    if (result.error) toast.error(result.error)
    else toast.success(result.success ?? 'Categoría actualizada')
  }

  const raices = categorias.filter((c) => !c.categoria_padre_id)
  const hijos = (padreId: string) => categorias.filter((c) => c.categoria_padre_id === padreId)

  return (
    <div className="space-y-6">
      <div className="bg-white border border-stone-100 rounded-sm overflow-hidden">
        {categorias.length === 0 ? (
          <div className="p-10 text-center text-stone-400 text-sm">No hay categorías todavía</div>
        ) : (
          <ul className="divide-y divide-stone-50">
            {raices.map((cat) => (
              <li key={cat.id}>
                <CategoryItem categoria={cat} onToggle={handleToggle} indent={0} />
                {hijos(cat.id).map((hijo) => (
                  <CategoryItem key={hijo.id} categoria={hijo} onToggle={handleToggle} indent={1} />
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white border border-stone-100 rounded-sm p-6">
        <h3 className="text-sm font-medium text-stone-700 mb-4">Nueva categoría</h3>
        <form action={formAction} className="flex gap-3 max-w-md">
          <input
            name="nombre"
            type="text"
            placeholder="Nombre de la categoría"
            required
            className="flex-1 border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-stone-400"
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-sm bg-stone-800 text-white hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            {isPending ? '...' : 'Crear'}
          </button>
        </form>
      </div>
    </div>
  )
}

function CategoryItem({
  categoria,
  onToggle,
  indent,
}: {
  categoria: Categoria
  onToggle: (id: string, activo: boolean) => void
  indent: number
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition-colors ${indent > 0 ? 'pl-10' : ''}`}
    >
      <div>
        {indent > 0 && <span className="text-stone-300 mr-2">└</span>}
        <span className="text-sm text-stone-800">{categoria.nombre}</span>
        <span className="ml-2 text-xs text-stone-400 font-mono">{categoria.slug}</span>
      </div>
      <button
        onClick={() => onToggle(categoria.id, categoria.activo)}
        className={`text-xs px-2 py-0.5 rounded transition-colors ${
          categoria.activo
            ? 'bg-green-50 text-green-700 hover:bg-green-100'
            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
        }`}
      >
        {categoria.activo ? 'Activa' : 'Inactiva'}
      </button>
    </div>
  )
}
