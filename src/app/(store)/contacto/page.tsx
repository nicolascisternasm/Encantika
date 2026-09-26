import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { FadeIn } from '@/components/store/FadeIn'
import ContactoFormClient from './ContactoFormClient'

type Config = {
  contacto_titulo: string | null
  contacto_subtitulo: string | null
  contacto_email: string | null
  contacto_maps_url: string | null
  footer_telefono: string | null
  footer_direccion: string | null
  footer_horario: string | null
  numero_whatsapp: string | null
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Contacto | Encantika' }
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-4 items-start">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: 'var(--color-tarjeta, #F5F0EB)' }}
      >
        <span style={{ color: 'var(--color-acento, #C9A035)' }}>{icon}</span>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[.14em] mb-0.5" style={{ color: 'var(--color-acento, #C9A035)' }}>
          {label}
        </p>
        <div className="text-[14px] leading-relaxed" style={{ color: 'var(--color-texto-suave, #666)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default async function ContactoPage() {
  const supabase = await createClient()
  const { data: raw } = await supabase
    .from('configuracion_tienda')
    .select('contacto_titulo, contacto_subtitulo, contacto_email, contacto_maps_url, footer_telefono, footer_direccion, footer_horario, numero_whatsapp')
    .single()

  const c = raw as unknown as Config | null

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-fondo, #FFFDF9)' }}>

      {/* ── Header compacto ───────────────────────────────────────────────── */}
      <section
        className="px-6 pt-10 pb-9 text-center"
        style={{ borderBottom: '1px solid var(--color-borde, #E8E2DB)' }}
      >
        <p className="text-[10px] uppercase tracking-[.22em] mb-1.5" style={{ color: 'var(--color-acento, #C9A035)' }}>
          Encantika
        </p>
        <h1
          className="font-display text-[42px] sm:text-5xl font-light leading-tight"
          style={{ color: 'var(--color-texto, #1a1a1a)' }}
        >
          {c?.contacto_titulo ?? 'Contáctanos'}
        </h1>
        {c?.contacto_subtitulo && (
          <p className="mt-2 text-[13px] tracking-[.04em]" style={{ color: 'var(--color-texto-suave, #666)' }}>
            {c.contacto_subtitulo}
          </p>
        )}
      </section>

      {/* ── Cuerpo: info izquierda + form derecha ────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-14 grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-14 lg:gap-20 items-start">

        {/* Columna izquierda — info de contacto + mapa */}
        <FadeIn>
          <div className="space-y-8">

            <div>
              <p className="text-[11px] uppercase tracking-[.14em] mb-6" style={{ color: 'var(--color-texto-suave, #666)' }}>
                Información de contacto
              </p>
              <div className="space-y-6">

                {c?.footer_direccion && (
                  <InfoRow
                    label="Dirección"
                    icon={
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path d="M12 22s-8-6.4-8-12a8 8 0 0 1 16 0c0 5.6-8 12-8 12z" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="10" r="2.5" />
                      </svg>
                    }
                  >
                    {c.footer_direccion}
                  </InfoRow>
                )}

                {(c?.footer_telefono || c?.numero_whatsapp) && (
                  <InfoRow
                    label="Teléfono"
                    icon={
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 4.07 4.18 2 2 0 0 1 6 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.81a2 2 0 0 1-.45 2.11L10.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    }
                  >
                    {c?.footer_telefono && (
                      <a href={`tel:${c.footer_telefono}`} className="block hover:underline underline-offset-2">
                        {c.footer_telefono}
                      </a>
                    )}
                    {c?.numero_whatsapp && (
                      <a
                        href={`https://wa.me/${c.numero_whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:underline underline-offset-2"
                      >
                        WhatsApp: +{c.numero_whatsapp}
                      </a>
                    )}
                  </InfoRow>
                )}

                {c?.contacto_email && (
                  <InfoRow
                    label="Email"
                    icon={
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m2 7 10 7 10-7" strokeLinecap="round" />
                      </svg>
                    }
                  >
                    <a href={`mailto:${c.contacto_email}`} className="hover:underline underline-offset-2">
                      {c.contacto_email}
                    </a>
                  </InfoRow>
                )}

                {c?.footer_horario && (
                  <InfoRow
                    label="Horario"
                    icon={
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" />
                        <polyline points="12 7 12 12 15.5 12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    }
                  >
                    <span>{c.footer_horario}</span>
                    <span className="block text-[12px] mt-0.5 opacity-70">
                      Respuesta en menos de 24 h
                    </span>
                  </InfoRow>
                )}

              </div>
            </div>

            {/* Línea divisoria + mapa */}
            {c?.contacto_maps_url && (
              <div
                className="pt-8"
                style={{ borderTop: '1px solid var(--color-borde, #E8E2DB)' }}
              >
                <div className="overflow-hidden" style={{ borderRadius: 2 }}>
                  <iframe
                    src={c.contacto_maps_url}
                    width="100%"
                    height="220"
                    style={{ border: 0, display: 'block' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            )}
          </div>
        </FadeIn>

        {/* Columna derecha — formulario */}
        <FadeIn delay={0.1}>
          <div
            className="p-8 sm:p-10"
            style={{ backgroundColor: 'var(--color-tarjeta, #F5F0EB)' }}
          >
            <p className="text-[10px] uppercase tracking-[.18em] mb-1" style={{ color: 'var(--color-acento, #C9A035)' }}>
              Escríbenos
            </p>
            <h2
              className="font-display text-[28px] font-normal mb-7"
              style={{ color: 'var(--color-texto, #1a1a1a)' }}
            >
              Envíanos un mensaje
            </h2>
            <ContactoFormClient />
          </div>
        </FadeIn>

      </div>
    </main>
  )
}
