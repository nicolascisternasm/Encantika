'use client'

import { useState, useTransition } from 'react'
import { guardarConfigArmaJoya, type ConfigArmaJoya } from '@/app/actions/arma-joya-configuracion'

export default function ConfigArmaJoyaForm({ inicial }: { inicial: ConfigArmaJoya }) {
  const [form, setForm] = useState(inicial)
  const [pending, start] = useTransition()
  const [guardado, setGuardado] = useState(false)

  function toggle(k: keyof ConfigArmaJoya) {
    setForm((f) => ({ ...f, [k]: !f[k] }))
    setGuardado(false)
  }

  function handleGuardar() {
    start(async () => {
      await guardarConfigArmaJoya(form)
      setGuardado(true)
    })
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="bg-white border border-stone-100 rounded-lg p-6 space-y-5">
        <h3 className="text-sm font-medium text-stone-700 uppercase tracking-wider">Tarjetas de componente</h3>

        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <div>
            <p className="text-sm text-stone-700">Mostrar precio</p>
            <p className="text-xs text-stone-400 mt-0.5">Muestra el valor de cada componente en la tarjeta</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.mostrar_precio}
            onClick={() => toggle('mostrar_precio')}
            className="relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200"
            style={{ background: form.mostrar_precio ? '#C9A035' : '#d1d5db' }}
          >
            <span
              className="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5"
              style={{ transform: form.mostrar_precio ? 'translateX(22px)' : 'translateX(2px)' }}
            />
          </button>
        </label>

        <div className="h-px bg-stone-100" />

        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <div>
            <p className="text-sm text-stone-700">Mostrar descripción</p>
            <p className="text-xs text-stone-400 mt-0.5">Muestra la descripción corta del componente bajo el nombre</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.mostrar_descripcion}
            onClick={() => toggle('mostrar_descripcion')}
            className="relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200"
            style={{ background: form.mostrar_descripcion ? '#C9A035' : '#d1d5db' }}
          >
            <span
              className="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5"
              style={{ transform: form.mostrar_descripcion ? 'translateX(22px)' : 'translateX(2px)' }}
            />
          </button>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleGuardar}
          disabled={pending}
          className="px-5 py-2 text-xs uppercase tracking-wider text-white rounded transition-opacity disabled:opacity-50"
          style={{ background: '#C9A035' }}
        >
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </button>
        {guardado && (
          <p className="text-xs text-green-600">✓ Guardado</p>
        )}
      </div>
    </div>
  )
}
