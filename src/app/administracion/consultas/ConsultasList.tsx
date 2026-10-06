'use client'

import { useState, useTransition } from 'react'
import { marcarConsultaLeida } from '@/features/contacto/actions'

type Consulta = {
  id: string
  nombre: string
  email: string
  telefono: string | null
  asunto: string | null
  mensaje: string
  leido: boolean
  creado_en: string
}

interface Props {
  consultas: Consulta[]
}

function formatFecha(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function ConsultaRow({ consulta: c }: { consulta: Consulta }) {
  const [abierta, setAbierta] = useState(false)
  const [leido, setLeido] = useState(c.leido)
  const [isPending, startTransition] = useTransition()

  function toggleLeido() {
    const nuevo = !leido
    setLeido(nuevo)
    startTransition(async () => {
      const result = await marcarConsultaLeida(c.id, nuevo)
      if (result.error) setLeido(!nuevo)
    })
  }

  return (
    <div style={{ borderBottom: '1px solid #374151', transition: 'background 0.15s', background: leido ? 'transparent' : 'rgba(99,102,241,0.05)' }}>
      {/* Fila resumen */}
      <button
        className="w-full text-left flex items-start gap-3"
        style={{ padding: '12px 16px', transition: 'background 0.15s' }}
        onClick={() => setAbierta(v => !v)}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <div style={{ marginTop: 4, flexShrink: 0 }}>
          {leido ? (
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#374151' }} />
          ) : (
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, fontSize: 13 }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: leido ? '#9ca3af' : '#f9fafb', fontWeight: leido ? 400 : 500 }}>
            {c.nombre}
          </span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#9ca3af', fontSize: 12, marginTop: 2 }}>{c.email}</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#9ca3af', fontSize: 12, marginTop: 2 }}>
            {c.asunto ?? '—'}
          </span>
          <span style={{ color: '#6b7280', fontSize: 12, marginTop: 2, textAlign: 'right' }}>{formatFecha(c.creado_en)}</span>
        </div>
        <svg
          style={{ width: 16, height: 16, flexShrink: 0, color: '#6b7280', marginTop: 2, transition: 'transform 0.2s', transform: abierta ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" />
        </svg>
      </button>

      {/* Detalle expandido */}
      {abierta && (
        <div style={{ padding: '0 16px 20px 36px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {c.telefono && (
            <p style={{ fontSize: 12, color: '#9ca3af' }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 8 }}>Teléfono:</span>{c.telefono}
            </p>
          )}
          <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, padding: 16 }}>
            <p style={{ fontSize: 14, color: '#d1d5db', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{c.mensaje}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <a
              href={`mailto:${c.email}?subject=Re: ${c.asunto ?? 'Tu consulta'}`}
              style={{ fontSize: 12, color: '#d1d5db', border: '1px solid #374151', padding: '6px 12px', borderRadius: 6, textDecoration: 'none', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#6366f1')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#374151')}
            >
              Responder por email
            </a>
            <button
              onClick={toggleLeido}
              disabled={isPending}
              style={{ fontSize: 12, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', opacity: isPending ? 0.5 : 1, transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f9fafb')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
            >
              {leido ? 'Marcar como no leído' : 'Marcar como leído'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ConsultasList({ consultas }: Props) {
  if (consultas.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 0', color: '#6b7280' }}>
        <p style={{ fontSize: 36, marginBottom: 16 }}>✉️</p>
        <p style={{ fontSize: 14 }}>Aún no hay consultas de contacto.</p>
      </div>
    )
  }

  return (
    <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 10, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '8px 16px', borderBottom: '1px solid #374151', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6b7280' }}>
        <span style={{ paddingLeft: 20 }}>Nombre</span>
        <span>Email</span>
        <span>Asunto</span>
        <span style={{ textAlign: 'right' }}>Fecha</span>
      </div>
      {consultas.map(c => (
        <ConsultaRow key={c.id} consulta={c} />
      ))}
    </div>
  )
}
