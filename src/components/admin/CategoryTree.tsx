'use client'

import { useState, useActionState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { createCategoria, toggleCategoria, updateCategoria, deleteCategoria } from '@/features/categories/actions'

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

  async function handleUpdate(id: string, nombre: string) {
    const result = await updateCategoria(id, nombre)
    if (result.error) toast.error(result.error)
    else toast.success('Categoría actualizada')
    return !result.error
  }

  async function handleDelete(id: string, nombre: string) {
    if (!confirm(`¿Eliminar la categoría "${nombre}"? Esta acción no se puede deshacer.`)) return
    const result = await deleteCategoria(id)
    if (result.error) toast.error(result.error)
    else toast.success('Categoría eliminada')
  }

  const raices = categorias.filter((c) => !c.categoria_padre_id)
  const hijos = (padreId: string) => categorias.filter((c) => c.categoria_padre_id === padreId)

  return (
    <div className="space-y-6">
      <div
        className="rounded-sm overflow-hidden"
        style={{ background: '#1f2937', border: '1px solid #374151' }}
      >
        {categorias.length === 0 ? (
          <div className="p-10 text-center text-sm" style={{ color: '#9ca3af' }}>
            No hay categorías todavía
          </div>
        ) : (
          <ul>
            {raices.map((cat) => (
              <li key={cat.id} style={{ borderBottom: '1px solid #374151' }}>
                <CategoryItem
                  categoria={cat}
                  onToggle={handleToggle}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  indent={0}
                />
                {hijos(cat.id).map((hijo) => (
                  <CategoryItem
                    key={hijo.id}
                    categoria={hijo}
                    onToggle={handleToggle}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    indent={1}
                  />
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Crear nueva categoría */}
      <div
        className="rounded-sm p-6"
        style={{ background: '#1f2937', border: '1px solid #374151' }}
      >
        <h3 className="text-sm font-medium mb-4" style={{ color: '#d1d5db' }}>
          Nueva categoría
        </h3>
        <form action={formAction} className="flex gap-3 max-w-md">
          <input
            name="nombre"
            type="text"
            placeholder="Nombre de la categoría"
            required
            className="flex-1 px-3 py-2 text-sm focus:outline-none transition-colors"
            style={{
              background: '#111827',
              border: '1px solid #374151',
              color: '#f9fafb',
              borderRadius: '8px',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
            onBlur={e => (e.currentTarget.style.borderColor = '#374151')}
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-sm transition-colors disabled:opacity-50"
            style={{ background: '#6366f1', color: 'white', borderRadius: '8px' }}
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
  onUpdate,
  onDelete,
  indent,
}: {
  categoria: Categoria
  onToggle: (id: string, activo: boolean) => void
  onUpdate: (id: string, nombre: string) => Promise<boolean>
  onDelete: (id: string, nombre: string) => void
  indent: number
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [value, setValue] = useState(categoria.nombre)
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setValue(categoria.nombre)
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function cancelEdit() {
    setValue(categoria.nombre)
    setEditing(false)
  }

  async function confirmEdit() {
    if (value.trim() === categoria.nombre) { setEditing(false); return }
    setSaving(true)
    const ok = await onUpdate(categoria.id, value)
    setSaving(false)
    if (ok) setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') confirmEdit()
    if (e.key === 'Escape') cancelEdit()
  }

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 transition-colors${indent > 0 ? ' pl-10' : ''}`}
      style={{ background: 'transparent' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#111827')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Nombre / input de edición */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {indent > 0 && <span className="mr-1 shrink-0" style={{ color: '#4b5563' }}>└</span>}

        {editing ? (
          <input
            ref={inputRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={saving}
            className="px-2 py-0.5 text-sm focus:outline-none rounded-sm w-48 transition-colors"
            style={{
              background: '#111827',
              border: '1px solid #374151',
              color: '#f9fafb',
              borderRadius: '6px',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
            onBlur={e => (e.currentTarget.style.borderColor = '#374151')}
          />
        ) : (
          <>
            <span className="text-sm truncate" style={{ color: '#f9fafb' }}>{categoria.nombre}</span>
            <span className="text-xs font-mono hidden sm:inline" style={{ color: '#6b7280' }}>{categoria.slug}</span>
          </>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {editing ? (
          <>
            <button
              onClick={confirmEdit}
              disabled={saving}
              className="text-xs px-2.5 py-1 transition-colors rounded-sm disabled:opacity-50"
              style={{ background: '#6366f1', color: 'white', borderRadius: '6px' }}
            >
              {saving ? '...' : 'Guardar'}
            </button>
            <button
              onClick={cancelEdit}
              disabled={saving}
              className="text-xs px-2.5 py-1 transition-colors rounded-sm"
              style={{ border: '1px solid #374151', color: '#9ca3af', borderRadius: '6px', background: 'transparent' }}
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            {/* Editar */}
            <button
              onClick={startEdit}
              className="p-1.5 transition-colors"
              style={{ color: '#6b7280' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#d1d5db')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
              title="Editar nombre"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Activa / Inactiva */}
            <button
              onClick={() => onToggle(categoria.id, categoria.activo)}
              className="text-xs px-2 py-0.5 rounded transition-colors"
              style={
                categoria.activo
                  ? { background: 'rgba(16,185,129,0.12)', color: '#10b981', borderRadius: '6px' }
                  : { background: '#374151', color: '#9ca3af', borderRadius: '6px' }
              }
            >
              {categoria.activo ? 'Activa' : 'Inactiva'}
            </button>

            {/* Eliminar */}
            <button
              onClick={() => onDelete(categoria.id, categoria.nombre)}
              className="p-1.5 transition-colors"
              style={{ color: '#4b5563' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={e => (e.currentTarget.style.color = '#4b5563')}
              title="Eliminar categoría"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" strokeLinecap="round" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 11v6M14 11v6" strokeLinecap="round" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
