'use client'

import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import { enviarConsulta, type ConsultaFormState } from '@/features/contacto/actions'

const initial: ConsultaFormState = {}

const ASUNTOS = [
  'Consulta sobre producto',
  'Pedido personalizado',
  'Información de envío',
  'Otro',
]

export default function ContactoFormClient() {
  const [state, action, isPending] = useActionState(enviarConsulta, initial)

  useEffect(() => {
    if (state.success) toast.success('¡Mensaje enviado! Te responderemos pronto.')
    if (state.error) toast.error(state.error)
  }, [state])

  const fe = state.fieldErrors ?? {}

  if (state.success) {
    return (
      <div className="border border-stone-200 p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="font-display text-[22px] font-normal text-stone-800">
          ¡Mensaje enviado!
        </h3>
        <p className="text-sm text-stone-500">
          Te responderemos en menos de 24 horas.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] uppercase tracking-[.12em] text-stone-500 mb-1.5">
            Nombre completo <span className="text-stone-400">*</span>
          </label>
          <input
            name="nombre"
            type="text"
            required
            placeholder="María González"
            className="w-full px-3 py-2.5 border border-sand text-sm text-stone-800 bg-white focus:outline-none focus:border-stone-400 transition-colors"
          />
          {fe.nombre && <p className="text-xs text-red-500 mt-0.5">{fe.nombre[0]}</p>}
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[.12em] text-stone-500 mb-1.5">
            Email <span className="text-stone-400">*</span>
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="maria@gmail.com"
            className="w-full px-3 py-2.5 border border-sand text-sm text-stone-800 bg-white focus:outline-none focus:border-stone-400 transition-colors"
          />
          {fe.email && <p className="text-xs text-red-500 mt-0.5">{fe.email[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] uppercase tracking-[.12em] text-stone-500 mb-1.5">
            Teléfono <span className="text-stone-400 normal-case text-[10px]">(opcional)</span>
          </label>
          <input
            name="telefono"
            type="tel"
            placeholder="+56 9 1234 5678"
            className="w-full px-3 py-2.5 border border-sand text-sm text-stone-800 bg-white focus:outline-none focus:border-stone-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[.12em] text-stone-500 mb-1.5">
            Asunto
          </label>
          <select
            name="asunto"
            defaultValue=""
            className="w-full px-3 py-2.5 border border-sand text-sm text-stone-800 bg-white focus:outline-none focus:border-stone-400 transition-colors"
          >
            <option value="" disabled>Selecciona un asunto</option>
            {ASUNTOS.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-[.12em] text-stone-500 mb-1.5">
          Mensaje <span className="text-stone-400">*</span>
        </label>
        <textarea
          name="mensaje"
          required
          rows={5}
          placeholder="Escribe tu consulta aquí..."
          className="w-full px-3 py-2.5 border border-sand text-sm text-stone-800 bg-white focus:outline-none focus:border-stone-400 transition-colors resize-none"
        />
        {fe.mensaje && <p className="text-xs text-red-500 mt-0.5">{fe.mensaje[0]}</p>}
      </div>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 border border-red-200">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-4 text-xs tracking-[.15em] uppercase font-medium bg-onyx text-ivory hover:bg-[var(--color-acento,#C9A035)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Enviando…' : 'Enviar mensaje'}
      </button>
    </form>
  )
}
