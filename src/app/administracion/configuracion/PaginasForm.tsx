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
      <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1">{label}</label>
      <input
        name={name}
        type="text"
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-sand text-sm text-stone-800 focus:outline-none focus:border-gold transition-colors"
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
}: {
  label: string
  name: string
  defaultValue?: string | null
  rows?: number
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1">{label}</label>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-sand text-sm text-stone-800 focus:outline-none focus:border-gold transition-colors resize-none"
      />
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs tracking-[0.2em] uppercase text-stone-400 border-b border-sand pb-2 mt-6 mb-4">
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
      <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">{label}</label>
      <div className="flex items-start gap-4">
        <div className="relative overflow-hidden bg-stone-100 rounded" style={{ width: 120, height: 80 }}>
          {imagenUrl ? (
            <Image src={imagenUrl} alt="Imagen" fill className="object-cover" unoptimized />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-stone-300 text-[10px] text-center px-1">Sin imagen</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          className="text-xs border border-stone-200 px-3 py-1.5 hover:border-stone-400 transition-colors text-stone-600"
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
      <div className="flex border-b border-sand mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-xs uppercase tracking-widest transition-colors -mb-px border-b-2 ${
              activeTab === t.key
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Pestaña Nosotros */}
      {activeTab === 'nosotros' && (
        <div className="space-y-4 max-w-2xl">
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
      )}

      {/* Pestaña Footer */}
      {activeTab === 'footer' && (
        <div className="space-y-4 max-w-2xl">
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
      )}

      {/* Pestaña Contacto */}
      {activeTab === 'contacto' && (
        <div className="space-y-4 max-w-2xl">
          <SectionTitle>Página de contacto</SectionTitle>
          <Field label="Título" name="contacto_titulo" defaultValue={contacto.titulo} placeholder="¿Tienes alguna pregunta?" />
          <TextareaField label="Subtítulo" name="contacto_subtitulo" defaultValue={contacto.subtitulo} rows={2} />
          <Field label="Email de contacto" name="contacto_email" defaultValue={contacto.email} placeholder="contacto@encantika.cl" />
          <div>
            <label className="block text-xs tracking-widests uppercase text-stone-500 mb-1">URL embed Google Maps</label>
            <p className="text-[11px] text-stone-400 mb-1.5">
              En Google Maps → Compartir → Insertar mapa → copia solo el valor del atributo <code className="bg-stone-100 px-1">src="..."</code>
            </p>
            <textarea
              name="contacto_maps_url"
              rows={3}
              defaultValue={contacto.maps_url ?? ''}
              placeholder="https://www.google.com/maps/embed?pb=..."
              className="w-full px-3 py-2 border border-sand text-sm text-stone-800 focus:outline-none focus:border-gold transition-colors resize-none font-mono text-[11px]"
            />
          </div>
        </div>
      )}

      <div className="pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-onyx text-white text-xs tracking-widest uppercase hover:bg-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Guardando…' : 'Guardar páginas'}
        </button>
      </div>
    </form>
  )
}
