import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { FadeIn, FadeInStagger, FadeInItem } from '@/components/store/FadeIn'
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
  const supabase = await createClient()
  const { data } = await supabase
    .from('configuracion_tienda')
    .select('contacto_titulo, contacto_subtitulo')
    .single()
  const c = data as unknown as Config | null
  return {
    title: `Contacto | Encantika`,
    description: c?.contacto_subtitulo ?? undefined,
  }
}

// ── Ícono circular al estilo MAMKAM ─────────────────────────────────────────

function InfoIcon({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
      style={{ backgroundColor: 'var(--color-acento, #C9A035)' }}
    >
      {children}
    </div>
  )
}

// ── Card de información ──────────────────────────────────────────────────────

function InfoCard({
  icon,
  titulo,
  children,
}: {
  icon: React.ReactNode
  titulo: string
  children: React.ReactNode
}) {
  return (
    <div
      className="flex items-start gap-5 p-6 rounded-sm"
      style={{ backgroundColor: 'var(--color-tarjeta, #F5F0EB)' }}
    >
      <InfoIcon>{icon}</InfoIcon>
      <div className="pt-1">
        <h3 className="font-display text-[18px] font-normal mb-1" style={{ color: 'var(--color-texto, #1a1a1a)' }}>
          {titulo}
        </h3>
        <div className="text-sm leading-relaxed" style={{ color: 'var(--color-texto-suave, #666)' }}>
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

      {/* ── Encabezado ────────────────────────────────────────────────────── */}
      <FadeIn>
        <section className="px-8 py-16 text-center" style={{ backgroundColor: 'var(--color-tarjeta, #F5F0EB)' }}>
          <p
            className="text-[11px] uppercase tracking-[.18em] mb-3"
            style={{ color: 'var(--color-acento, #C9A035)' }}
          >
            Encantika
          </p>
          <h1
            className="font-display text-[48px] sm:text-[56px] font-normal leading-tight mb-4 max-w-xl mx-auto"
            style={{ color: 'var(--color-texto, #1a1a1a)' }}
          >
            {c?.contacto_titulo ?? '¿Tienes alguna pregunta?'}
          </h1>
          {c?.contacto_subtitulo && (
            <p className="text-[16px] max-w-md mx-auto leading-relaxed" style={{ color: 'var(--color-texto-suave, #666)' }}>
              {c.contacto_subtitulo}
            </p>
          )}
        </section>
      </FadeIn>

      {/* ── Mapa ──────────────────────────────────────────────────────────── */}
      {c?.contacto_maps_url && (
        <div className="w-full" style={{ height: 350 }}>
          <iframe
            src={c.contacto_maps_url}
            width="100%"
            height="350"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      {/* ── Cards de información ──────────────────────────────────────────── */}
      <section className="px-6 sm:px-8 py-12 max-w-5xl mx-auto">
        <FadeInStagger className="grid grid-cols-1 sm:grid-cols-2 gap-4" staggerDelay={0.08}>

          {c?.footer_direccion && (
            <FadeInItem>
              <InfoCard
                titulo="Dirección"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="white" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path d="M12 22s-8-6.4-8-12a8 8 0 0 1 16 0c0 5.6-8 12-8 12z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                }
              >
                {c.footer_direccion}
              </InfoCard>
            </FadeInItem>
          )}

          {c?.contacto_email && (
            <FadeInItem>
              <InfoCard
                titulo="Email"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="white" strokeWidth={1.8} viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m2 7 10 7 10-7" strokeLinecap="round" />
                  </svg>
                }
              >
                <a href={`mailto:${c.contacto_email}`} className="hover:underline">
                  {c.contacto_email}
                </a>
              </InfoCard>
            </FadeInItem>
          )}

          {(c?.footer_telefono || c?.numero_whatsapp) && (
            <FadeInItem>
              <InfoCard
                titulo="Teléfonos"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="white" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 4.07 4.18 2 2 0 0 1 6 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.81a2 2 0 0 1-.45 2.11L10.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
              >
                {c?.footer_telefono && (
                  <a href={`tel:${c.footer_telefono}`} className="block hover:underline">
                    {c.footer_telefono}
                  </a>
                )}
                {c?.numero_whatsapp && (
                  <a
                    href={`https://wa.me/${c.numero_whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:underline"
                  >
                    WhatsApp: +{c.numero_whatsapp}
                  </a>
                )}
              </InfoCard>
            </FadeInItem>
          )}

          {c?.footer_horario && (
            <FadeInItem>
              <InfoCard
                titulo="Horario"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="white" strokeWidth={1.8} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" />
                    <polyline points="12 7 12 12 15.5 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
              >
                <span>{c.footer_horario}</span>
                <span className="block mt-1 text-[12px]" style={{ color: 'var(--color-texto-suave)' }}>
                  Te respondemos en menos de 24 horas
                </span>
              </InfoCard>
            </FadeInItem>
          )}

        </FadeInStagger>
      </section>

      {/* ── Formulario ────────────────────────────────────────────────────── */}
      <FadeIn>
        <section className="px-6 sm:px-8 pb-20 max-w-2xl mx-auto">
          <h2
            className="font-display text-[32px] font-normal mb-8 text-center"
            style={{ color: 'var(--color-texto, #1a1a1a)' }}
          >
            Envíanos un mensaje
          </h2>
          <ContactoFormClient />
        </section>
      </FadeIn>

    </main>
  )
}
