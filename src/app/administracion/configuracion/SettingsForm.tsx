'use client'

import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import { saveSettings, type SettingsFormState } from '@/features/settings/actions'
import type { Tables } from '@/types/database'

interface SettingsFormProps {
  settings: Tables<'configuracion_tienda'> | null
}

const initial: SettingsFormState = {}

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  placeholder,
  hint,
  error,
}: {
  label: string
  name: string
  defaultValue?: string | null
  type?: string
  placeholder?: string
  hint?: string
  error?: string[]
}) {
  return (
    <div>
      <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1">
        {label}
      </label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-sand text-sm text-stone-800 focus:outline-none focus:border-gold transition-colors"
      />
      {hint && <p className="text-xs text-stone-400 mt-0.5">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-0.5">{error[0]}</p>}
    </div>
  )
}

function Textarea({
  label,
  name,
  defaultValue,
  rows = 3,
  placeholder,
  hint,
  error,
}: {
  label: string
  name: string
  defaultValue?: string | null
  rows?: number
  placeholder?: string
  hint?: string
  error?: string[]
}) {
  return (
    <div>
      <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1">
        {label}
      </label>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-sand text-sm text-stone-800 focus:outline-none focus:border-gold transition-colors resize-none"
      />
      {hint && <p className="text-xs text-stone-400 mt-0.5">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-0.5">{error[0]}</p>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs tracking-[0.2em] uppercase text-stone-400 border-b border-sand pb-2 mt-8 mb-4">
      {children}
    </h2>
  )
}

export default function SettingsForm({ settings: s }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState(saveSettings, initial)

  useEffect(() => {
    if (state.success) toast.success('Configuración guardada')
    if (state.error) toast.error(state.error)
  }, [state])

  const fe = state.fieldErrors ?? {}

  return (
    <form action={formAction} className="space-y-4">
      {/* General */}
      <SectionTitle>General</SectionTitle>

      <Field
        label="Nombre de la tienda *"
        name="nombre_tienda"
        defaultValue={s?.nombre_tienda}
        placeholder="Encantika"
        error={fe.nombre_tienda}
      />

      <Field
        label="Correo de contacto"
        name="email_contacto"
        type="email"
        defaultValue={s?.email_contacto}
        placeholder="hola@encantika.cl"
        error={fe.email_contacto}
      />

      <div>
        <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1">
          Moneda
        </label>
        <select
          name="moneda"
          defaultValue={s?.moneda ?? 'CLP'}
          className="w-full px-3 py-2 border border-sand text-sm text-stone-800 bg-white focus:outline-none focus:border-gold transition-colors"
        >
          <option value="CLP">CLP — Peso chileno</option>
          <option value="USD">USD — Dólar estadounidense</option>
        </select>
      </div>

      {/* Contacto y redes */}
      <SectionTitle>Contacto y redes</SectionTitle>

      <Field
        label="WhatsApp"
        name="numero_whatsapp"
        defaultValue={s?.numero_whatsapp}
        placeholder="56912345678"
        hint="Solo números, sin + ni espacios"
        error={fe.numero_whatsapp}
      />

      <Field
        label="Instagram"
        name="url_instagram"
        defaultValue={s?.url_instagram}
        placeholder="https://instagram.com/encantika"
        error={fe.url_instagram}
      />

      <Field
        label="MercadoLibre"
        name="url_mercadolibre"
        defaultValue={s?.url_mercadolibre}
        placeholder="https://www.mercadolibre.cl/tienda/..."
        error={fe.url_mercadolibre}
      />

      <Field
        label="Dirección de retiro"
        name="direccion_retiro"
        defaultValue={s?.direccion_retiro}
        placeholder="Av. Ejemplo 1234, Santiago"
        error={fe.direccion_retiro}
      />

      <Textarea
        label="Instrucciones de retiro"
        name="instrucciones_retiro"
        defaultValue={s?.instrucciones_retiro}
        placeholder="Coordinar horario por WhatsApp con 24h de anticipación…"
        error={fe.instrucciones_retiro}
      />

      {/* SEO */}
      <SectionTitle>SEO</SectionTitle>

      <Field
        label="Título SEO"
        name="seo_titulo"
        defaultValue={s?.seo_titulo}
        placeholder="Encantika — Joyas que cuentan tu historia"
        hint="Máximo 70 caracteres"
        error={fe.seo_titulo}
      />

      <Textarea
        label="Descripción SEO"
        name="seo_descripcion"
        defaultValue={s?.seo_descripcion}
        rows={2}
        placeholder="Descubre nuestra colección de joyas artesanales…"
        hint="Máximo 160 caracteres"
        error={fe.seo_descripcion}
      />

      {/* Sobre nosotros */}
      <SectionTitle>Sobre nosotros</SectionTitle>

      <Textarea
        label="Nuestra historia"
        name="historia"
        defaultValue={s?.historia}
        rows={6}
        placeholder="Encantika nació de la pasión por crear joyas únicas…"
        error={fe.historia}
      />

      <div className="flex items-center gap-3">
        <input
          type="hidden"
          name="mostrar_historia"
          value="false"
        />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="mostrar_historia"
            value="true"
            defaultChecked={s?.mostrar_historia ?? false}
            className="accent-gold w-4 h-4"
            onChange={e => {
              const hidden = e.currentTarget.form?.querySelector<HTMLInputElement>(
                'input[type="hidden"][name="mostrar_historia"]'
              )
              if (hidden) hidden.disabled = e.currentTarget.checked
            }}
          />
          <span className="text-sm text-stone-600">Mostrar sección "Nuestra historia" en la tienda</span>
        </label>
      </div>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 border border-red-200">
          {state.error}
        </p>
      )}

      <div className="pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-onyx text-white text-xs tracking-widest uppercase hover:bg-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Guardando…' : 'Guardar configuración'}
        </button>
      </div>
    </form>
  )
}
