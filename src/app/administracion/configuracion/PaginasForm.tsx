'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import SelectorImagenModal from '@/app/administracion/diseno/SelectorImagenModal'
import { savePaginas } from '@/features/settings/actions'
import type { ImagenSitio } from '@/app/administracion/imagenes/ImagenesManager'

type SeccionImg = { imagenId: string | null; imagenUrl: string | null }

interface PaginasFormProps {
  nosotros: {
    titulo: string | null
    subtitulo: string | null
    historia: string | null
    vision: string | null
    seccion1_titulo: string | null
    seccion1_texto: string | null
    seccion2_titulo: string | null
    seccion2_texto: string | null
    seccion3_titulo: string | null
    seccion3_texto: string | null
  }
  seccion1: SeccionImg
  seccion2: SeccionImg
  seccion3: SeccionImg
  footer: {
    horario: string | null
    direccion: string | null
    telefono: string | null
  }
  contacto: {
    titulo: string | null
    subtitulo: string | null
    email: string | null
    maps_url: string | null
  }
}

type Tab = 'nosotros' | 'footer' | 'contacto'

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
  placeholder,
}: {
  label: string
  name: string
  defaultValue?: string | null
  placeholder?: string
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        name={name}
        type="text"
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
        onBlur={e => (e.currentTarget.style.borderColor = '#374151')}
      />
    </div>
  )
}

function TextareaField({
  label,
  name,
  defaultValue,
  rows = 4,
  placeholder,
  mono,
}: {
  label: string
  name: string
  defaultValue?: string | null
  rows?: number
  placeholder?: string
  mono?: boolean
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        style={{ ...inputStyle, resize: 'none', fontFamily: mono ? 'monospace' : undefined, fontSize: mono ? 11 : 14 }}
        onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
        onBlur={e => (e.currentTarget.style.borderColor = '#374151')}
      />
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6b7280', borderBottom: '1px solid #374151', paddingBottom: 8, marginTop: 24, marginBottom: 16 }}>
      {children}
    </h3>
  )
}

function ImagenSelector({
  label,
  seccionKey,
  imagenUrl,
  onSelect,
}: {
  label: string
  seccionKey: string
  imagenUrl: string | null
  onSelect: (img: ImagenSitio) => void
}) {
  const [modalAbierto, setModalAbierto] = useState(false)

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ position: 'relative', overflow: 'hidden', background: '#111827', borderRadius: 8, border: '1px solid #374151', width: 120, height: 80, flexShrink: 0 }}>
          {imagenUrl ? (
            <Image src={imagenUrl} alt="Imagen" fill className="object-cover" />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#6b7280', fontSize: 10, textAlign: 'center', padding: '0 4px' }}>Sin imagen</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          style={{ fontSize: 12, color: '#d1d5db', border: '1px solid #374151', padding: '6px 12px', borderRadius: 6, background: 'transparent', cursor: 'pointer', transition: 'border-color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#6366f1')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#374151')}
        >
          {imagenUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}
        </button>
      </div>
      {modalAbierto && (
        <SelectorImagenModal
          seccionKey={seccionKey}
          onSelect={(img) => { onSelect(img); setModalAbierto(false) }}
          onClose={() => setModalAbierto(false)}
        />
      )}
    </div>
  )
}

export default function PaginasForm({ nosotros, seccion1: s1, seccion2: s2, seccion3: s3, footer, contacto }: PaginasFormProps) {
  const [activeTab, setActiveTab] = useState<Tab>('nosotros')
  const [img1, setImg1] = useState<SeccionImg>(s1)
  const [img2, setImg2] = useState<SeccionImg>(s2)
  const [img3, setImg3] = useState<SeccionImg>(s3)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('nosotros_seccion1_imagen_id', img1.imagenId ?? '')
    fd.set('nosotros_seccion2_imagen_id', img2.imagenId ?? '')
    fd.set('nosotros_seccion3_imagen_id', img3.imagenId ?? '')

    startTransition(async () => {
      const result = await savePaginas(fd)
      if (result.success) toast.success('Páginas guardadas')
      else toast.error(result.error ?? 'Error al guardar')
    })
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'nosotros', label: 'Nosotros' },
    { key: 'footer', label: 'Footer' },
    { key: 'contacto', label: 'Contacto' },
  ]

  return (
    <form onSubmit={handleSubmit}>
      {/* Sub-pestañas */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '7px 16px',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
              background: activeTab === t.key ? '#6366f1' : '#374151',
              color: activeTab === t.key ? '#ffffff' : '#9ca3af',
              fontWeight: 500,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Pestaña Nosotros — siempre en DOM, se oculta con CSS */}
      <div className={`space-y-4 max-w-2xl${activeTab !== 'nosotros' ? ' hidden' : ''}`}>
        <SectionTitle>Encabezado</SectionTitle>
        <Field label="Título" name="nosotros_titulo" defaultValue={nosotros.titulo} placeholder="Nuestra historia" />
        <Field label="Subtítulo" name="nosotros_subtitulo" defaultValue={nosotros.subtitulo} placeholder="Joyas hechas con amor…" />

        <SectionTitle>Historia y visión</SectionTitle>
        <TextareaField label="Nuestra historia" name="nosotros_historia" defaultValue={nosotros.historia} rows={5} />
        <TextareaField label="Nuestra visión" name="nosotros_vision" defaultValue={nosotros.vision} rows={3} />

        <SectionTitle>Sección 1</SectionTitle>
        <Field label="Título" name="nosotros_seccion1_titulo" defaultValue={nosotros.seccion1_titulo} placeholder="Creadas con amor" />
        <TextareaField label="Texto" name="nosotros_seccion1_texto" defaultValue={nosotros.seccion1_texto} />
        <ImagenSelector
          label="Imagen"
          seccionKey="seccion1"
          imagenUrl={img1.imagenUrl}
          onSelect={img => setImg1({ imagenId: img.id, imagenUrl: img.url })}
        />

        <SectionTitle>Sección 2</SectionTitle>
        <Field label="Título" name="nosotros_seccion2_titulo" defaultValue={nosotros.seccion2_titulo} placeholder="Materiales de calidad" />
        <TextareaField label="Texto" name="nosotros_seccion2_texto" defaultValue={nosotros.seccion2_texto} />
        <ImagenSelector
          label="Imagen"
          seccionKey="seccion2"
          imagenUrl={img2.imagenUrl}
          onSelect={img => setImg2({ imagenId: img.id, imagenUrl: img.url })}
        />

        <SectionTitle>Sección 3</SectionTitle>
        <Field label="Título" name="nosotros_seccion3_titulo" defaultValue={nosotros.seccion3_titulo} placeholder="Para momentos únicos" />
        <TextareaField label="Texto" name="nosotros_seccion3_texto" defaultValue={nosotros.seccion3_texto} />
        <ImagenSelector
          label="Imagen"
          seccionKey="seccion3"
          imagenUrl={img3.imagenUrl}
          onSelect={img => setImg3({ imagenId: img.id, imagenUrl: img.url })}
        />
      </div>

      {/* Pestaña Footer — siempre en DOM */}
      <div className={`space-y-4 max-w-2xl${activeTab !== 'footer' ? ' hidden' : ''}`}>
        <SectionTitle>Información del footer</SectionTitle>
        <TextareaField
          label="Horario"
          name="footer_horario"
          defaultValue={footer.horario}
          rows={2}
          placeholder="Lunes a viernes: 9:00 - 18:00 hrs"
        />
        <Field label="Dirección" name="footer_direccion" defaultValue={footer.direccion} placeholder="Santiago, Chile · Solo venta online" />
        <Field label="Teléfono" name="footer_telefono" defaultValue={footer.telefono} placeholder="+56 9 XXXX XXXX" />
      </div>

      {/* Pestaña Contacto — siempre en DOM */}
      <div className={`space-y-4 max-w-2xl${activeTab !== 'contacto' ? ' hidden' : ''}`}>
        <SectionTitle>Página de contacto</SectionTitle>
        <Field label="Título" name="contacto_titulo" defaultValue={contacto.titulo} placeholder="¿Tienes alguna pregunta?" />
        <TextareaField label="Subtítulo" name="contacto_subtitulo" defaultValue={contacto.subtitulo} rows={2} />
        <Field label="Email de contacto" name="contacto_email" defaultValue={contacto.email} placeholder="contacto@encantika.cl" />
        <div>
          <label style={labelStyle}>URL embed Google Maps</label>
          <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>
            En Google Maps → Compartir → Insertar mapa → copia solo el valor del atributo <code style={{ background: '#111827', padding: '1px 4px', borderRadius: 4 }}>src=&quot;...&quot;</code>
          </p>
          <textarea
            name="contacto_maps_url"
            rows={3}
            defaultValue={contacto.maps_url ?? ''}
            placeholder="https://www.google.com/maps/embed?pb=..."
            style={{ ...inputStyle, resize: 'none', fontFamily: 'monospace', fontSize: 11 }}
            onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
            onBlur={e => (e.currentTarget.style.borderColor = '#374151')}
          />
        </div>
      </div>

      <div style={{ paddingTop: 24 }}>
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
          {isPending ? 'Guardando…' : 'Guardar páginas'}
        </button>
      </div>
    </form>
  )
}
