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
    <div className={`border-b border-stone-100 transition-colors ${leido ? '' : 'bg-stone-50'}`}>
      {/* Fila resumen */}
      <button
        className="w-full text-left px-4 py-3 hover:bg-stone-100 transition-colors flex items-start gap-3"
        onClick={() => setAbierta(v => !v)}
      >
        <div className="mt-0.5 shrink-0">
          {leido ? (
            <div className="w-2 h-2 rounded-full bg-stone-200" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-stone-700" />
          )}
        </div>
        <div className="flex-1 min-w-0 grid grid-cols-4 gap-3 text-sm">
          <span className={`truncate ${leido ? 'text-stone-500' : 'text-stone-800 font-medium'}`}>
            {c.nombre}
          </span>
          <span className="truncate text-stone-500 text-xs mt-0.5">{c.email}</span>
          <span className="truncate text-stone-500 text-xs mt-0.5">
            {c.asunto ?? '—'}
          </span>
          <span className="text-stone-400 text-xs mt-0.5 text-right">{formatFecha(c.creado_en)}</span>
        </div>
        <svg
          className={`w-4 h-4 shrink-0 text-stone-400 mt-0.5 transition-transform ${abierta ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" />
        </svg>
      </button>

      {/* Detalle expandido */}
      {abierta && (
        <div className="px-9 pb-5 space-y-3">
          {c.telefono && (
            <p className="text-xs text-stone-500">
              <span className="uppercase tracking-wider mr-2">Teléfono:</span>{c.telefono}
            </p>
          )}
          <div className="bg-white border border-stone-100 rounded p-4">
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{c.mensaje}</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`mailto:${c.email}?subject=Re: ${c.asunto ?? 'Tu consulta'}`}
              className="text-xs text-stone-600 border border-stone-200 px-3 py-1.5 hover:border-stone-400 transition-colors"
            >
              Responder por email
            </a>
            <button
              onClick={toggleLeido}
              disabled={isPending}
              className="text-xs text-stone-500 hover:text-stone-800 transition-colors disabled:opacity-50"
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
      <div className="text-center py-16 text-stone-400">
        <p className="text-4xl mb-4">✉️</p>
        <p className="text-sm">Aún no hay consultas de contacto.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-stone-100 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 border-b border-stone-100 grid grid-cols-4 gap-3 text-[10px] uppercase tracking-widest text-stone-400">
        <span className="pl-5">Nombre</span>
        <span>Email</span>
        <span>Asunto</span>
        <span className="text-right">Fecha</span>
      </div>
      {consultas.map(c => (
        <ConsultaRow key={c.id} consulta={c} />
      ))}
    </div>
  )
}
