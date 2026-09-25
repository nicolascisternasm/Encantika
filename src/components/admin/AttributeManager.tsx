'use client'

import { useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { createAtributo, createValorAtributo } from '@/features/attributes/actions'

type ValorAtributo = { id: string; valor: string; slug: string; activo: boolean; color_hex: string | null }
type Atributo = { id: string; nombre: string; codigo: string; valores_atributo: ValorAtributo[] }

type ActionState = { error?: string; success?: string }

export default function AttributeManager({ atributos }: { atributos: Atributo[] }) {
  const [selectedId, setSelectedId] = useState<string>(atributos[0]?.id ?? '')
  const [attrState, attrAction, attrPending] = useActionState<ActionState, FormData>(createAtributo, {})
  const [valState, valAction, valPending] = useActionState<ActionState, FormData>(createValorAtributo, {})

  useEffect(() => {
    if (attrState.error) toast.error(attrState.error)
    if (attrState.success) toast.success(attrState.success)
  }, [attrState])

  useEffect(() => {
    if (valState.error) toast.error(valState.error)
    if (valState.success) toast.success(valState.success)
  }, [valState])

  return (
    <div className="space-y-6">
      <div className="bg-white border border-stone-100 rounded-sm overflow-hidden">
        {atributos.length === 0 ? (
          <div className="p-10 text-center text-stone-400 text-sm">No hay atributos todavía</div>
        ) : (
          <div className="divide-y divide-stone-50">
            {atributos.map((attr) => (
              <div
                key={attr.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedId === attr.id ? 'bg-stone-50' : 'hover:bg-stone-50'
                }`}
                onClick={() => setSelectedId(attr.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-stone-800">{attr.nombre}</span>
                    <span className="ml-2 text-xs text-stone-400 font-mono">{attr.codigo}</span>
                  </div>
                  <span className="text-xs text-stone-400">
                    {attr.valores_atributo.length} valor{attr.valores_atributo.length !== 1 ? 'es' : ''}
                  </span>
                </div>
                {selectedId === attr.id && attr.valores_atributo.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {attr.valores_atributo.map((v) => (
                      <span
                        key={v.id}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-white border border-stone-200 text-stone-600"
                      >
                        {v.color_hex && (
                          <span
                            className="inline-block w-3 h-3 rounded-full border border-stone-200"
                            style={{ backgroundColor: v.color_hex }}
                          />
                        )}
                        {v.valor}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-stone-100 rounded-sm p-6">
          <h3 className="text-sm font-medium text-stone-700 mb-4">Nuevo atributo</h3>
          <form action={attrAction} className="space-y-3">
            <input
              name="nombre"
              type="text"
              placeholder="Nombre (ej: Color)"
              required
              className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400"
            />
            <input
              name="codigo"
              type="text"
              placeholder="Código (ej: color)"
              required
              className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400 font-mono"
            />
            <button
              type="submit"
              disabled={attrPending}
              className="w-full py-2 text-sm bg-stone-800 text-white hover:bg-stone-700 transition-colors disabled:opacity-50"
            >
              {attrPending ? '...' : 'Crear atributo'}
            </button>
          </form>
        </div>

        <div className="bg-white border border-stone-100 rounded-sm p-6">
          <h3 className="text-sm font-medium text-stone-700 mb-4">Agregar valor</h3>
          {atributos.length === 0 ? (
            <p className="text-xs text-stone-400">Crea un atributo primero</p>
          ) : (
            <form action={valAction} className="space-y-3">
              <select
                name="atributo_id"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400 bg-white"
              >
                {atributos.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
              <input
                name="valor"
                type="text"
                placeholder="Valor (ej: Dorado)"
                required
                className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400"
              />
              <div className="flex items-center gap-3">
                <label className="text-xs text-stone-500">Color (opcional)</label>
                <input
                  name="color_hex"
                  type="color"
                  defaultValue="#000000"
                  className="h-8 w-16 border border-stone-200 cursor-pointer"
                />
              </div>
              <button
                type="submit"
                disabled={valPending}
                className="w-full py-2 text-sm bg-stone-800 text-white hover:bg-stone-700 transition-colors disabled:opacity-50"
              >
                {valPending ? '...' : 'Agregar valor'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
