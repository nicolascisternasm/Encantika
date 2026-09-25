import { Cormorant_Garamond } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StoreHeader from '@/components/store/StoreHeader'
import WhatsAppButton from '@/components/store/WhatsAppButton'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
})

const FOOTER_LINKS = [
  { label: 'Catálogo', href: '/catalogo' },
  { label: 'Colecciones', href: '/colecciones' },
  { label: 'Arma tu joya', href: '/arma-tu-joya' },
  { label: 'Sobre nosotros', href: '/sobre-nosotros' },
]

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: config } = await supabase
    .from('configuracion_tienda')
    .select('nombre_tienda, numero_whatsapp, url_instagram, url_mercadolibre')
    .single()

  return (
    <div className={`${cormorant.variable} flex flex-col min-h-screen bg-ivory`}>
      <StoreHeader />

      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-onyx text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">

            {/* Col 1: logo + tagline */}
            <div>
              <Image
                src="/logo.png"
                alt="Encantika"
                width={140}
                height={36}
                className="h-9 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <p className="mt-4 text-sm text-encantika-stone tracking-wide">
                Brilla con magia
              </p>
            </div>

            {/* Col 2: navegación */}
            <div>
              <p className="text-[11px] uppercase tracking-[.15em] text-encantika-stone mb-5">
                Navegación
              </p>
              <ul className="space-y-3">
                {FOOTER_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: redes sociales */}
            <div>
              <p className="text-[11px] uppercase tracking-[.15em] text-encantika-stone mb-5">
                Síguenos
              </p>
              <ul className="space-y-3">
                {config?.url_instagram && (
                  <li>
                    <a
                      href={config.url_instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {/* Instagram icon */}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 shrink-0">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <circle cx="12" cy="12" r="4" />
                        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                      </svg>
                      Instagram
                    </a>
                  </li>
                )}
                {config?.numero_whatsapp && (
                  <li>
                    <a
                      href={`https://wa.me/${config.numero_whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {/* WhatsApp icon */}
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                        <path d="M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.463 3.48 11.815 11.815 0 0 0 12.05 0zm0 21.784h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26C2.169 6.89 6.604 2.456 12.054 2.456c2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884z" opacity=".9" />
                      </svg>
                      WhatsApp
                    </a>
                  </li>
                )}
                {config?.url_mercadolibre && (
                  <li>
                    <a
                      href={config.url_mercadolibre}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      Mercado Libre
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Línea inferior */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
            <p className="text-[11px] text-encantika-stone">
              © 2026 Encantika · Todos los derechos reservados
            </p>
            <Link
              href="/administracion"
              className="text-[11px] text-encantika-stone hover:text-white transition-colors"
            >
              Administración
            </Link>
          </div>
        </div>
      </footer>

      <WhatsAppButton numero={config?.numero_whatsapp ?? null} />
    </div>
  )
}
