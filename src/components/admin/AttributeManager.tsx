'use client'

import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  createAtributo,
  createValorAtributo,
  updateAtributo,
  updateValorAtributo,
  toggleValorAtributo,
  deleteValorAtributo,
} from '@/features/attributes/actions'

type ValorAtributo = { id: string; valor: string; slug: string; activo: boolean; color_hex: string | null }
type Atributo = { id: string; nombre: string; codigo: string; valores_atributo: ValorAtributo[] }
type ActionState = { error?: string; success?: string }

// ── Value row with inline edit ────────────────────────────────────────────────

function ValorRow({ valor }: { valor: ValorAtributo }) {
  const [editMode, setEditMode] = useState(false)
  const [editValor, setEditValor] = useState(valor.valor)
  const [editColor, setEditColor] = useState(valor.color_hex ?? '#000000')
  const inputRef = useRef<HTMLInputElement>(null)

  const [saving, startSave] = useTransition()
  const [toggling, startToggle] = useTransition()
  const [deleting, startDelete] = useTransition()

  function handleEdit() {
    setEditValor(valor.valor)
    setEditColor(valor.color_hex ?? '#000000')
    setEditMode(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleSave() {
    if (!editValor.trim()) return
    startSave(async () => {
      const result = await updateValorAtributo(valor.id, {
        valor: editValor.trim(),
        color_hex: editColor === '#000000' ? null : editColor,
      })
      if (result.error) toast.error(result.error)
      else { toast.success('Valor actualizado'); setEditMode(false) }
    })
  }

  function handleToggle() {
    startToggle(async () => {
      const result = await toggleValorAtributo(valor.id, !valor.activo)
      if (result.error) toast.error(result.error)
    })
  }

  function handleDelete() {
    startDelete(async () => {
      const result = await deleteValorAtributo(valor.id)
      if (result.error) toast.error(result.error)
      else toast.success('Valor eliminado')
    })
  }

  if (editMode) {
    return (
      <tr className="border-b border-stone-50 bg-stone-50">
        <td className="py-2 pr-3">
          <input
            ref={inputRef}
            value={editValor}
            onChange={e => setEditValor(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditMode(false) }}
            className="w-full border border-stone-300 px-2 py-1 text-xs focus:outline-none focus:border-stone-500"
          />
        </td>
        <td className="py-2 pr-3">
          <input
            type="color"
            value={editColor}
            onChange={e => setEditColor(e.target.value)}
            className="h-7 w-12 border border-stone-200 cursor-pointer"
          />
        </td>
        <td colSpan={3} className="py-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="text-xs px-3 py-1 bg-stone-800 text-white hover:bg-stone-700 disabled:opacity-50"
            >
              {saving ? '…' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="text-xs text-stone-500 hover:text-stone-700"
            >
              Cancelar
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-stone-50 group hover:bg-stone-50 transition-colors">
      <td className="py-2 pr-3">
        <span className={`flex items-center gap-1.5 text-sm ${!valor.activo ? 'text-stone-400 line-through' : 'text-stone-700'}`}>
          {valor.color_hex && (
            <span
              className="inline-block w-3 h-3 rounded-full border border-stone-200 flex-shrink-0"
              style={{ backgroundColor: valor.color_hex }}
            />
          )}
          {valor.valor}
        </span>
      </td>
      <td className="py-2 pr-3">
        {valor.color_hex ? (
          <span
            className="inline-block w-5 h-5 rounded border border-stone-200"
            style={{ backgroundColor: valor.color_hex }}
            title={valor.color_hex}
          />
        ) : (
          <span className="text-xs text-stone-300">—</span>
        )}
      </td>
      <td className="py-2 pr-3">
        <button
          type="button"
          onClick={handleToggle}
          disabled={toggling}
          className={`text-[11px] px-2 py-0.5 rounded transition-colors ${
            valor.activo
              ? 'bg-green-50 text-green-700 hover:bg-green-100'
              : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
          } disabled:opacity-50`}
        >
          {toggling ? '…' : valor.activo ? 'Activo' : 'Inactivo'}
        </button>
      </td>
      <td className="py-2 pr-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={handleEdit}
          className="text-xs text-stone-400 hover:text-stone-700"
        >
          Editar
        </button>
      </td>
      <td className="py-2 text-right opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
        >
          {deleting ? '…' : 'Eliminar'}
        </button>
      </td>
    </tr>
  )
}

// ── Attribute header with inline name edit ────────────────────────────────────

function AtributoNombreEditor({ attr }: { attr: Atributo }) {
  const [editMode, setEditMode] = useState(false)
  const [nombre, setNombre] = useState(attr.nombre)
  const [codigo, setCodigo] = useState(attr.codigo)
  const [saving, startSave] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleEdit() {
    setNombre(attr.nombre)
    setCodigo(attr.codigo)
    setEditMode(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleSave() {
    if (!nombre.trim() || !codigo.trim()) return
    startSave(async () => {
      const result = await updateAtributo(attr.id, { nombre: nombre.trim(), codigo: codigo.trim() })
      if (result.error) toast.error(result.error)
      else { toast.success('Atributo actualizado'); setEditMode(false) }
    })
  }

  if (editMode) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <input
          ref={inputRef}
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditMode(false) }}
          placeholder="Nombre"
          className="border border-stone-300 px-2 py-1 text-sm focus:outline-none focus:border-stone-500 w-40"
        />
        <input
          value={codigo}
          onChange={e => setCodigo(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditMode(false) }}
          placeholder="código"
          className="border border-stone-300 px-2 py-1 text-sm font-mono focus:outline-none focus:border-stone-500 w-28"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="text-xs px-3 py-1 bg-stone-800 text-white hover:bg-stone-700 disabled:opacity-50"
        >
          {saving ? '…' : 'Guardar'}
        </button>
        <button type="button" onClick={() => setEditMode(false)} className="text-xs text-stone-400 hover:text-stone-600">
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 group">
      <span className="text-sm font-medium text-stone-800">{attr.nombre}</span>
      <span className="text-xs text-stone-400 font-mono">{attr.codigo}</span>
      <button
        type="button"
        onClick={handleEdit}
        className="text-xs text-stone-300 hover:text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        Editar
      </button>
    </div>
  )
}

// ── Add value inline form ─────────────────────────────────────────────────────

function AddValorForm({ atributoId }: { atributoId: string }) {
  const [show, setShow] = useState(false)
  const [state, action, pending] = useActionState<ActionState, FormData>(createValorAtributo, {})
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.error) toast.error(state.error)
    if (state.success) {
      toast.success(state.success)
      formRef.current?.reset()
      setShow(false)
    }
  }, [state])

  if (!show) {
    return (
      <button
        type="button"
        onClick={() => setShow(true)}
        className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
      >
        + Agregar valor
      </button>
    )
  }

  return (
    <form ref={formRef} action={action} className="flex items-center gap-2 flex-wrap mt-1">
      <input type="hidden" name="atributo_id" value={atributoId} />
      <input
        name="valor"
        type="text"
        placeholder="Nuevo valor"
        required
        autoFocus
        className="border border-stone-200 px-2 py-1 text-xs focus:outline-none focus:border-stone-400 w-36"
      />
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-stone-400">Color</span>
        <input
          name="color_hex"
          type="color"
          defaultValue="#000000"
          className="h-6 w-10 border border-stone-200 cursor-pointer"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="text-xs px-3 py-1 bg-stone-700 text-white hover:bg-stone-600 disabled:opacity-50"
      >
        {pending ? '…' : 'Agregar'}
      </button>
      <button type="button" onClick={() => setShow(false)} className="text-xs text-stone-400 hover:text-stone-600">
        Cancelar
      </button>
    </form>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AttributeManager({ atributos }: { atributos: Atributo[] }) {
  const [expandedId, setExpandedId] = useState<string>(atributos[0]?.id ?? '')
  const [attrState, attrAction, attrPending] = useActionState<ActionState, FormData>(createAtributo, {})

  useEffect(() => {
    if (attrState.error) toast.error(attrState.error)
    if (attrState.success) toast.success(attrState.success)
  }, [attrState])

  return (
    <div className="space-y-6">
      {/* Attribute list */}
      <div className="bg-white border border-stone-100 divide-y divide-stone-50">
        {atributos.length === 0 ? (
          <div className="p-10 text-center text-stone-400 text-sm">No hay atributos todavía</div>
        ) : (
          atributos.map(attr => (
            <div key={attr.id} className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between gap-4">
                <AtributoNombreEditor attr={attr} />
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === attr.id ? '' : attr.id)}
                  className="text-xs text-stone-400 hover:text-stone-700 flex-shrink-0"
                >
                  {expandedId === attr.id ? '▲ cerrar' : `▼ ${attr.valores_atributo.length} valor${attr.valores_atributo.length !== 1 ? 'es' : ''}`}
                </button>
              </div>

              {/* Expanded values */}
              {expandedId === attr.id && (
                <div className="mt-3 space-y-3">
                  {attr.valores_atributo.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-stone-100">
                            <th className="text-left pb-1.5 pr-3 text-[11px] font-normal text-stone-400 uppercase tracking-wider">Valor</th>
                            <th className="text-left pb-1.5 pr-3 text-[11px] font-normal text-stone-400 uppercase tracking-wider">Color</th>
                            <th className="text-left pb-1.5 pr-3 text-[11px] font-normal text-stone-400 uppercase tracking-wider">Estado</th>
                            <th colSpan={2} />
                          </tr>
                        </thead>
                        <tbody>
                          {attr.valores_atributo.map(val => (
                            <ValorRow key={val.id} valor={val} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-stone-400">Sin valores todavía.</p>
                  )}
                  <AddValorForm atributoId={attr.id} />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New attribute form */}
      <div className="bg-white border border-stone-100 p-6">
        <h3 className="text-xs text-stone-500 uppercase tracking-wider mb-4">Nuevo atributo</h3>
        <form action={attrAction} className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-xs text-stone-400 mb-1">Nombre</label>
            <input
              name="nombre"
              type="text"
              placeholder="ej: Color"
              required
              className="border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400 w-44"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-400 mb-1">Código</label>
            <input
              name="codigo"
              type="text"
              placeholder="ej: color"
              required
              className="border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400 font-mono w-32"
            />
          </div>
          <button
            type="submit"
            disabled={attrPending}
            className="py-2 px-4 text-sm bg-stone-800 text-white hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            {attrPending ? '…' : 'Crear atributo'}
          </button>
        </form>
      </div>
    </div>
  )
}
