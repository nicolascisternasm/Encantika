'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createProducto, updateProducto } from '@/features/products/actions'
import { generateSlug } from '@/lib/utils'

type Categoria = { id: string; nombre: string }

type Product = {
  id: string
  nombre: string
  slug: string
  precio_base: number
  estado: string
  descripcion: string | null
  categoria_id: string | null
  destacado: boolean
}

type ActionState = { error?: string; success?: string; id?: string }

interface ProductFormProps {
  categorias: Categoria[]
  producto?: Product
}

export default function ProductForm({ categorias, producto }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!producto

  const action = isEdit
    ? updateProducto.bind(null, producto.id)
    : createProducto

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(action, {})

  useEffect(() => {
    if (state.error) toast.error(state.error)
    if (state.success) {
      toast.success(state.success)
      if (!isEdit && state.id) {
        router.push(`/administracion/productos/${state.id}`)
      }
    }
  }, [state, isEdit, router])

  const slugRef = useRef<HTMLInputElement>(null)
  const slugEdited = useRef(false)

  function handleNombreChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isEdit && slugRef.current && !slugEdited.current) {
      slugRef.current.value = generateSlug(e.target.value)
    }
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div className="bg-white border border-stone-100 rounded-sm p-6 space-y-5">
        <h2 className="text-xs font-medium text-stone-500 uppercase tracking-widest">
          Información básica
        </h2>

        <div>
          <label className="block text-xs text-stone-500 mb-1">Nombre *</label>
          <input
            name="nombre"
            type="text"
            defaultValue={producto?.nombre}
            onChange={handleNombreChange}
            required
            className="w-full border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-stone-400 transition-colors"
            placeholder="Collar Luna"
          />
        </div>

        <div>
          <label className="block text-xs text-stone-500 mb-1">Slug *</label>
          <input
            name="slug"
            type="text"
            ref={slugRef}
            defaultValue={producto?.slug}
            onInput={() => { slugEdited.current = true }}
            required
            className="w-full border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-stone-400 transition-colors font-mono"
            placeholder="collar-luna"
          />
          <p className="mt-1 text-xs text-stone-400">Se genera automáticamente desde el nombre</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-stone-500 mb-1">Precio base (CLP) *</label>
            <input
              name="precio_base"
              type="number"
              min={0}
              step={1}
              defaultValue={producto?.precio_base ?? 0}
              required
              className="w-full border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-stone-400 transition-colors"
              placeholder="29990"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Estado *</label>
            <select
              name="estado"
              defaultValue={producto?.estado ?? 'borrador'}
              className="w-full border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-stone-400 transition-colors bg-white"
            >
              <option value="borrador">Borrador</option>
              <option value="activo">Activo</option>
              <option value="archivado">Archivado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-stone-500 mb-1">Categoría</label>
          <select
            name="categoria_id"
            defaultValue={producto?.categoria_id ?? ''}
            className="w-full border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-stone-400 transition-colors bg-white"
          >
            <option value="">Sin categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-stone-500 mb-1">Descripción</label>
          <textarea
            name="descripcion"
            defaultValue={producto?.descripcion ?? ''}
            rows={4}
            className="w-full border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-stone-400 transition-colors resize-none"
            placeholder="Descripción del producto..."
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            name="destacado"
            type="checkbox"
            id="destacado"
            value="true"
            defaultChecked={producto?.destacado}
            className="border-stone-300"
          />
          <label htmlFor="destacado" className="text-sm text-stone-700">Producto destacado</label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 text-sm bg-stone-800 text-white hover:bg-stone-700 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </div>
    </form>
  )
}
