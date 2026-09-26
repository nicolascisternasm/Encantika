import { Cormorant_Garamond } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'
import { Toaster } from 'sonner'
import { createClient } from '@/lib/supabase/server'
import StoreHeader, { type HeaderVariant } from '@/components/store/StoreHeader'
import StoreSidebar from '@/components/store/StoreSidebar'
import WhatsAppButton from '@/components/store/WhatsAppButton'
import PageLoader from '@/components/store/PageLoader'
import { getTema, getFuente } from '@/lib/temas'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
})

const FOOTER_NAV = [
  { label: 'Home', href: '/' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Joyas', href: '/catalogo' },
  { label: 'Arma tu joya', href: '/arma-tu-joya' },
  { label: 'Contacto', href: '/contacto' },
]

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: config } = await supabase
    .from('configuracion_tienda')
    .select('nombre_tienda, numero_whatsapp, url_instagram, url_mercadolibre, tema, fuente_titulos, layout, footer_horario, footer_direccion, footer_telefono, contacto_email')
    .single()

  const c = config as typeof config & {
    footer_horario: string | null
    footer_direccion: string | null
    footer_telefono: string | null
    contacto_email: string | null
  } | null

  const temaConfig = getTema(c?.tema)
  const fuenteConfig = getFuente(c?.fuente_titulos)
  const layout = (c as { layout?: string } | null)?.layout ?? 'clasico'

  const headerVariant: HeaderVariant =
    layout === 'inmersivo' ? 'hidden-scroll' :
    layout === 'split' ? 'transparent' :
    'default'

  const isLateral = layout === 'lateral'

  const scriptFonts = 'Great+Vibes&family=Pinyon+Script&family=Sacramento&family=Tangerine:wght@700&family=Alex+Brush'
  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${scriptFonts}&display=swap`

  const themeStyle = {
    ...temaConfig.vars,
    '--font-titulos': fuenteConfig.css,
  } as React.CSSProperties

  const fontLinks = (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={googleFontsUrl} />
    </>
  )

  const footer = (
    <footer style={{ backgroundColor: '#111111' }}>

      {/* Cuerpo — 4 columnas estilo MAMKAM */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Dirección */}
          {c?.footer_direccion && (
            <div className="flex gap-4">
              <div className="shrink-0 mt-0.5" style={{ color: '#C9A035' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path d="M12 22s-8-6.4-8-12a8 8 0 0 1 16 0c0 5.6-8 12-8 12z" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </div>
              <div>
                <h4 className="text-[11px] uppercase tracking-[.14em] font-medium mb-2" style={{ color: '#F5F0EB' }}>Dirección</h4>
                <p className="text-[13px] leading-relaxed" style={{ color: '#9A9490' }}>{c.footer_direccion}</p>
              </div>
            </div>
          )}

          {/* Contacto */}
          <div className="flex gap-4">
            <div className="shrink-0 mt-0.5" style={{ color: '#C9A035' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 4.07 4.18 2 2 0 0 1 6 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.81a2 2 0 0 1-.45 2.11L10.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-[.14em] font-medium mb-2" style={{ color: '#F5F0EB' }}>Contacto</h4>
              <div className="space-y-1.5">
                {c?.footer_telefono && (
                  <p className="text-[13px]" style={{ color: '#9A9490' }}>
                    <span style={{ color: '#ccc' }}>Tel: </span>{c.footer_telefono}
                  </p>
                )}
                {c?.numero_whatsapp && (
                  <p className="text-[13px]">
                    <a href={`https://wa.me/${c.numero_whatsapp}`} target="_blank" rel="noopener noreferrer"
                      className="transition-colors hover:text-white" style={{ color: '#9A9490' }}>
                      <span style={{ color: '#ccc' }}>WA: </span>+{c.numero_whatsapp}
                    </a>
                  </p>
                )}
                {c?.contacto_email && (
                  <p className="text-[13px]">
                    <a href={`mailto:${c.contacto_email}`} className="transition-colors hover:text-white" style={{ color: '#9A9490' }}>
                      {c.contacto_email}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Horario */}
          {c?.footer_horario && (
            <div className="flex gap-4">
              <div className="shrink-0 mt-0.5" style={{ color: '#C9A035' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <polyline points="12 7 12 12 15.5 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h4 className="text-[11px] uppercase tracking-[.14em] font-medium mb-2" style={{ color: '#F5F0EB' }}>Horario</h4>
                <p className="text-[13px] leading-relaxed" style={{ color: '#9A9490' }}>{c.footer_horario}</p>
              </div>
            </div>
          )}

          {/* Síguenos */}
          <div className="flex gap-4">
            <div className="shrink-0 mt-0.5" style={{ color: '#C9A035' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32" />
              </svg>
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-[.14em] font-medium mb-3" style={{ color: '#F5F0EB' }}>Síguenos</h4>
              <div className="flex gap-3">
                {c?.url_instagram && (
                  <a href={c.url_instagram} target="_blank" rel="noopener noreferrer"
                    className="transition-opacity hover:opacity-70" aria-label="Instagram">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#9A9490" strokeWidth={1.5} className="w-5 h-5">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="0.5" fill="#9A9490" />
                    </svg>
                  </a>
                )}
                {c?.numero_whatsapp && (
                  <a href={`https://wa.me/${c.numero_whatsapp}`} target="_blank" rel="noopener noreferrer"
                    className="transition-opacity hover:opacity-70" aria-label="WhatsApp">
                    <svg viewBox="0 0 24 24" fill="#9A9490" className="w-5 h-5">
                      <path d="M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.463 3.48 11.815 11.815 0 0 0 12.05 0zm0 21.784h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26C2.169 6.89 6.604 2.456 12.054 2.456c2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Línea inferior */}
      <div style={{ borderTop: '1px solid #2a2a2a' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Image
            src="/logo.png"
            alt="Encantika"
            width={100}
            height={26}
            className="h-6 w-auto"
            style={{ filter: 'brightness(0) invert(1)', opacity: 0.5 }}
          />
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
            {FOOTER_NAV.map(({ label, href }) => (
              <Link key={href} href={href} className="text-[11px] transition-colors hover:text-white" style={{ color: '#555' }}>
                {label}
              </Link>
            ))}
          </div>
          <Link href="/administracion" className="text-[11px] transition-colors hover:text-white" style={{ color: '#444' }}>
            © 2026 Encantika
          </Link>
        </div>
      </div>
    </footer>
  )

  const whatsapp = <WhatsAppButton numero={c?.numero_whatsapp ?? null} />

  if (isLateral) {
    return (
      <div className={`${cormorant.variable} flex flex-row min-h-screen`} style={themeStyle}>
        {fontLinks}
        <PageLoader />
        <StoreSidebar />
        <div className="flex flex-col flex-1 min-w-0 bg-ivory">
          <main className="flex-1">{children}</main>
          {footer}
        </div>
        {whatsapp}
        <Toaster position="top-center" />
      </div>
    )
  }

  return (
    <div className={`${cormorant.variable} flex flex-col min-h-screen bg-ivory`} style={themeStyle}>
      {fontLinks}
      <PageLoader />
      <StoreHeader variant={headerVariant} />
      <main className="flex-1">{children}</main>
      {footer}
      {whatsapp}
      <Toaster position="top-center" />
    </div>
  )
}
