'use client'

import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import { saveSettings, type SettingsFormState } from '@/features/settings/actions'
import type { Tables } from '@/types/database'

interface SettingsFormProps {
  settings: Tables<'configuracion_tienda'> | null
}

const initial: SettingsFormState = {}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#1f2937',
  border: '1px solid #374151',
  color: '#f9fafb',
  borderRadius: 8,
  padding: '10px 14px',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#9ca3af',
  fontSize: 12,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 6,
}

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
      <label style={labelStyle}>{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
        onBlur={e => (e.currentTarget.style.borderColor = '#374151')}
      />
      {hint && <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{hint}</p>}
      {error && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{error[0]}</p>}
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
      <label style={labelStyle}>{label}</label>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        style={{ ...inputStyle, resize: 'none' }}
        onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
        onBlur={e => (e.currentTarget.style.borderColor = '#374151')}
      />
      {hint && <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{hint}</p>}
      {error && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{error[0]}</p>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6b7280', borderBottom: '1px solid #374151', paddingBottom: 8, marginTop: 32, marginBottom: 16 }}>
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
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
        <label style={labelStyle}>Moneda</label>
        <select
          name="moneda"
          defaultValue={s?.moneda ?? 'CLP'}
          style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
          onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
          onBlur={e => (e.currentTarget.style.borderColor = '#374151')}
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <input
          type="hidden"
          name="mostrar_historia"
          value="false"
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            name="mostrar_historia"
            value="true"
            defaultChecked={s?.mostrar_historia ?? false}
            style={{ accentColor: '#6366f1', width: 16, height: 16 }}
            onChange={e => {
              const hidden = e.currentTarget.form?.querySelector<HTMLInputElement>(
                'input[type="hidden"][name="mostrar_historia"]'
              )
              if (hidden) hidden.disabled = e.currentTarget.checked
            }}
          />
          <span style={{ fontSize: 14, color: '#d1d5db' }}>Mostrar sección &quot;Nuestra historia&quot; en la tienda</span>
        </label>
      </div>

      {state.error && (
        <p style={{ fontSize: 14, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>
          {state.error}
        </p>
      )}

      <div style={{ paddingTop: 16 }}>
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '8px 24px',
            background: '#6366f1',
            color: '#ffffff',
            borderRadius: 8,
            border: 'none',
            fontSize: 13,
            fontWeight: 500,
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.5 : 1,
            transition: 'opacity 0.15s, background 0.15s',
          }}
          onMouseEnter={e => { if (!isPending) e.currentTarget.style.background = '#4f46e5' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#6366f1' }}
        >
          {isPending ? 'Guardando…' : 'Guardar configuración'}
        </button>
      </div>
    </form>
  )
}
