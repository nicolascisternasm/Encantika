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
    <div style={{ maxWidth: 512 }}>
      <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>Tarjetas de componente</h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, cursor: 'pointer' }}>
          <div>
            <p style={{ fontSize: 14, color: '#d1d5db' }}>Mostrar precio</p>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Muestra el valor de cada componente en la tarjeta</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.mostrar_precio}
            onClick={() => toggle('mostrar_precio')}
            style={{
              position: 'relative',
              display: 'inline-flex',
              height: 24,
              width: 44,
              flexShrink: 0,
              borderRadius: 999,
              transition: 'background 0.2s',
              background: form.mostrar_precio ? '#6366f1' : '#374151',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                height: 20,
                width: 20,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s',
                marginTop: 2,
                transform: form.mostrar_precio ? 'translateX(22px)' : 'translateX(2px)',
              }}
            />
          </button>
        </div>

        <div style={{ height: 1, background: '#374151', margin: '20px 0' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, cursor: 'pointer' }}>
          <div>
            <p style={{ fontSize: 14, color: '#d1d5db' }}>Mostrar descripción</p>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Muestra la descripción corta del componente bajo el nombre</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.mostrar_descripcion}
            onClick={() => toggle('mostrar_descripcion')}
            style={{
              position: 'relative',
              display: 'inline-flex',
              height: 24,
              width: 44,
              flexShrink: 0,
              borderRadius: 999,
              transition: 'background 0.2s',
              background: form.mostrar_descripcion ? '#6366f1' : '#374151',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                height: 20,
                width: 20,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s',
                marginTop: 2,
                transform: form.mostrar_descripcion ? 'translateX(22px)' : 'translateX(2px)',
              }}
            />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={handleGuardar}
          disabled={pending}
          style={{
            padding: '8px 20px',
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#fff',
            background: '#6366f1',
            borderRadius: 8,
            border: 'none',
            cursor: pending ? 'not-allowed' : 'pointer',
            opacity: pending ? 0.5 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </button>
        {guardado && (
          <p style={{ fontSize: 12, color: '#10b981' }}>✓ Guardado</p>
        )}
      </div>
    </div>
  )
}
