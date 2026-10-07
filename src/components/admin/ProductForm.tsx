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
  tipo_producto: string
  descripcion: string | null
  categoria_id: string | null
  destacado: boolean
}

type ActionState = { error?: string; success?: string; id?: string }

interface ProductFormProps {
  categorias: Categoria[]
  producto?: Product
}

const input = {
  background: '#111827',
  border: '1px solid #374151',
  color: '#f9fafb',
  borderRadius: 6,
  padding: '8px 12px',
  fontSize: 13,
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.15s',
} as const

const label = {
  display: 'block',
  fontSize: 11,
  color: '#6b7280',
  marginBottom: 6,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
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

  function focusBorder(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    e.currentTarget.style.borderColor = '#6366f1'
  }
  function blurBorder(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    e.currentTarget.style.borderColor = '#374151'
  }

  return (
    <form action={formAction} style={{ maxWidth: 672 }}>
      <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 11, fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24 }}>
          Información básica
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Nombre */}
          <div>
            <label style={label}>Nombre *</label>
            <input
              name="nombre"
              type="text"
              defaultValue={producto?.nombre}
              onChange={handleNombreChange}
              required
              placeholder="Collar Luna"
              style={input}
              onFocus={focusBorder}
              onBlur={blurBorder}
            />
          </div>

          {/* Slug */}
          <div>
            <label style={label}>Slug *</label>
            <input
              name="slug"
              type="text"
              ref={slugRef}
              defaultValue={producto?.slug}
              onInput={() => { slugEdited.current = true }}
              required
              placeholder="collar-luna"
              style={{ ...input, fontFamily: 'monospace', fontSize: 12 }}
              onFocus={focusBorder}
              onBlur={blurBorder}
            />
            <p style={{ marginTop: 4, fontSize: 11, color: '#4b5563' }}>Se genera automáticamente desde el nombre</p>
          </div>

          {/* Precio + Estado */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={label}>Precio base (CLP) *</label>
              <input
                name="precio_base"
                type="number"
                min={0}
                step={1}
                defaultValue={producto?.precio_base ?? 0}
                required
                placeholder="29990"
                style={input}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
            </div>
            <div>
              <label style={label}>Estado *</label>
              <select
                name="estado"
                defaultValue={producto?.estado ?? 'borrador'}
                style={{ ...input, cursor: 'pointer' }}
                onFocus={focusBorder}
                onBlur={blurBorder}
              >
                <option value="borrador">Borrador</option>
                <option value="activo">Activo</option>
                <option value="archivado">Archivado</option>
              </select>
            </div>
          </div>

          {/* Tipo de producto */}
          <div>
            <label style={label}>Tipo de producto *</label>
            <select
              name="tipo_producto"
              defaultValue={producto?.tipo_producto ?? 'terminado'}
              style={{ ...input, cursor: 'pointer' }}
              onFocus={focusBorder}
              onBlur={blurBorder}
            >
              <option value="terminado">Producto terminado (comprado, llega listo)</option>
              <option value="fabricado">Fabricado por Encantika (lo hacemos nosotros)</option>
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label style={label}>Categoría</label>
            <select
              name="categoria_id"
              defaultValue={producto?.categoria_id ?? ''}
              style={{ ...input, cursor: 'pointer' }}
              onFocus={focusBorder}
              onBlur={blurBorder}
            >
              <option value="">Sin categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label style={label}>Descripción</label>
            <textarea
              name="descripcion"
              defaultValue={producto?.descripcion ?? ''}
              rows={4}
              placeholder="Descripción del producto..."
              style={{ ...input, resize: 'none' }}
              onFocus={focusBorder as any}
              onBlur={blurBorder as any}
            />
          </div>

          {/* Destacado */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              name="destacado"
              type="checkbox"
              id="destacado"
              value="true"
              defaultChecked={producto?.destacado}
              style={{ width: 16, height: 16, accentColor: '#6366f1', cursor: 'pointer' }}
            />
            <label htmlFor="destacado" style={{ fontSize: 13, color: '#d1d5db', cursor: 'pointer' }}>
              Producto destacado
            </label>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            padding: '10px 20px',
            fontSize: 13,
            color: '#9ca3af',
            border: '1px solid #374151',
            borderRadius: 6,
            background: 'transparent',
            cursor: 'pointer',
            transition: 'border-color 0.15s',
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '10px 24px',
            fontSize: 13,
            background: isPending ? '#4f46e5' : '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.7 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </div>
    </form>
  )
}
