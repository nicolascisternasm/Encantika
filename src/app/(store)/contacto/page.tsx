import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ContactoFormClient from './ContactoFormClient'

type Config = {
  contacto_titulo: string | null
  contacto_subtitulo: string | null
  contacto_email: string | null
  footer_telefono: string | null
  footer_direccion: string | null
  footer_horario: string | null
  numero_whatsapp: string | null
  url_instagram: string | null
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

export default async function ContactoPage() {
  const supabase = await createClient()
  const { data: raw } = await supabase
    .from('configuracion_tienda')
    .select('contacto_titulo, contacto_subtitulo, contacto_email, footer_telefono, footer_direccion, footer_horario, numero_whatsapp, url_instagram')
    .single()

  const c = raw as unknown as Config | null

  const infoItems = [
    c?.footer_direccion && {
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: 'var(--color-acento, #C9A035)' }}>
          <path d="M12 22s-8-6.4-8-12a8 8 0 0 1 16 0c0 5.6-8 12-8 12z" /><circle cx="12" cy="10" r="2.5" />
        </svg>
      ),
      label: 'Ubicación',
      value: c.footer_direccion,
      href: undefined,
    },
    c?.footer_telefono && {
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: 'var(--color-acento, #C9A035)' }}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 4.07 4.18 2 2 0 0 1 6 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.81a2 2 0 0 1-.45 2.11L10.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      label: 'Teléfono',
      value: c.footer_telefono,
      href: `tel:${c.footer_telefono}`,
    },
    c?.contacto_email && {
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: 'var(--color-acento, #C9A035)' }}>
          <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" />
        </svg>
      ),
      label: 'Email',
      value: c.contacto_email,
      href: `mailto:${c.contacto_email}`,
    },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string; href?: string }[]

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section
        className="px-8 py-16 text-center"
        style={{ backgroundColor: 'var(--color-tarjeta, #F5F0EB)' }}
      >
        <h1 className="font-display text-[48px] font-normal leading-tight text-stone-800 mb-4 max-w-xl mx-auto">
          {c?.contacto_titulo ?? '¿Tienes alguna pregunta?'}
        </h1>
        <p className="text-[16px] text-stone-600 max-w-md mx-auto leading-relaxed">
          {c?.contacto_subtitulo ?? 'Estamos aquí para ayudarte.'}
        </p>
      </section>

      {/* Contenido */}
      <section className="px-6 sm:px-8 py-14 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Columna izquierda — Info */}
          <div className="space-y-8">
            {/* Items de contacto */}
            <div className="space-y-5">
              {infoItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  {item.icon}
                  <div>
                    <p className="text-[11px] uppercase tracking-[.10em] text-stone-400 mb-0.5">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm text-stone-700 hover:text-stone-900 transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-stone-700">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp button */}
            {c?.numero_whatsapp && (
              <a
                href={`https://wa.me/${c.numero_whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-3.5 bg-[#25D366] text-white text-sm font-medium hover:bg-[#20BC5A] transition-colors w-fit"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.463 3.48 11.815 11.815 0 0 0 12.05 0z" opacity=".9" />
                </svg>
                Chatear ahora
              </a>
            )}

            {/* Instagram */}
            {c?.url_instagram && (
              <a
                href={c.url_instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-3.5 border border-stone-200 text-stone-700 text-sm font-medium hover:border-stone-400 transition-colors w-fit"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
                Seguirnos en Instagram
              </a>
            )}

            {/* Horario */}
            {c?.footer_horario && (
              <div
                className="p-5 border"
                style={{
                  backgroundColor: 'var(--color-tarjeta, #F5F0EB)',
                  borderColor: 'var(--color-borde, #E8E2DB)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: 'var(--color-acento, #C9A035)' }}>
                    <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 12" />
                  </svg>
                  <p className="text-[11px] uppercase tracking-[.10em] text-stone-500">Horario de atención</p>
                </div>
                <p className="text-sm text-stone-700 leading-relaxed">{c.footer_horario}</p>
                <p className="text-[12px] text-stone-500 mt-2">Te respondemos en menos de 24 horas</p>
              </div>
            )}
          </div>

          {/* Columna derecha — Formulario */}
          <div>
            <h2 className="font-display text-[28px] font-normal text-stone-800 mb-6">
              Envíanos un mensaje
            </h2>
            <ContactoFormClient />
          </div>
        </div>
      </section>
    </main>
  )
}
