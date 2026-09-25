import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatCLP } from '@/lib/utils'
import ScrollIndicator from '@/components/store/ScrollIndicator'

// ── Íconos de categoría ────────────────────────────────────────────────────────

function IconCollar() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M9 12 Q9 36 24 36 Q39 36 39 12" />
      <circle cx="24" cy="41" r="4" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconAnillo() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-full h-full">
      <ellipse cx="24" cy="22" rx="15" ry="9" />
      <path d="M9 22 Q9 36 24 36 Q39 36 39 22" strokeLinecap="round" />
    </svg>
  )
}

function IconAros() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" className="w-full h-full">
      <circle cx="16" cy="15" r="6" />
      <path d="M16 21 L16 35" />
      <circle cx="32" cy="15" r="6" />
      <path d="M32 21 L32 35" />
    </svg>
  )
}

function IconPulsera() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-full h-full">
      <ellipse cx="24" cy="24" rx="18" ry="11" />
      <ellipse cx="24" cy="24" rx="10" ry="6" />
    </svg>
  )
}

const CATEGORIAS = [
  { nombre: 'Collares', slug: 'collares', Icon: IconCollar },
  { nombre: 'Anillos', slug: 'anillos', Icon: IconAnillo },
  { nombre: 'Aros', slug: 'aros', Icon: IconAros },
  { nombre: 'Pulseras', slug: 'pulseras', Icon: IconPulsera },
]

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function StorePage() {
  const supabase = await createClient()
  const admin = createAdminClient()

  const [{ data: productosRaw }, { data: configRaw }] = await Promise.all([
    supabase
      .from('productos')
      .select(`
        id, nombre, slug, precio_base,
        categorias(nombre),
        imagenes_producto(ruta_almacenamiento, orden)
      `)
      .eq('estado', 'activo')
      .eq('destacado', true)
      .order('creado_en', { ascending: false })
      .limit(4),
    admin
      .from('configuracion_tienda')
      .select('nombre_tienda, historia, mostrar_historia, hero_imagen_id, hero_posicion, banner_joya_imagen_id, banner_joya_posicion, historia_imagen_id, historia_posicion, layout')
      .single(),
  ])

  const config = configRaw as {
    nombre_tienda: string
    historia: string | null
    mostrar_historia: boolean
    hero_imagen_id: string | null
    hero_posicion: string
    banner_joya_imagen_id: string | null
    banner_joya_posicion: string
    historia_imagen_id: string | null
    historia_posicion: string
    layout: string
  } | null

  const layout = config?.layout ?? 'clasico'

  // Resolver URLs de imágenes configuradas
  const imageIds = [
    config?.hero_imagen_id,
    config?.banner_joya_imagen_id,
    config?.historia_imagen_id,
  ].filter(Boolean) as string[]

  let imagenUrlMap: Record<string, string> = {}
  if (imageIds.length > 0) {
    const { data: imgs } = await admin
      .from('imagenes_sitio')
      .select('id, url')
      .in('id', imageIds)
    if (imgs) {
      for (const img of imgs as { id: string; url: string }[]) imagenUrlMap[img.id] = img.url
    }
  }

  const heroUrl = config?.hero_imagen_id ? (imagenUrlMap[config.hero_imagen_id] ?? null) : null
  const heroPos = config?.hero_posicion ?? 'center center'
  const bannerUrl = config?.banner_joya_imagen_id ? (imagenUrlMap[config.banner_joya_imagen_id] ?? null) : null
  const bannerPos = config?.banner_joya_posicion ?? 'center center'
  const historiaUrl = config?.historia_imagen_id ? (imagenUrlMap[config.historia_imagen_id] ?? null) : null
  const historiaPos = config?.historia_posicion ?? 'center center'

  const productos = productosRaw ?? []
  const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}/storage/v1/object/public/imagenes-productos`

  function getMainImage(imgs: { ruta_almacenamiento: string; orden: number }[] | null) {
    if (!imgs || imgs.length === 0) return null
    return [...imgs].sort((a, b) => a.orden - b.orden)[0].ruta_almacenamiento
  }

  // Columnas de productos según layout
  const productGridCols = layout === 'magazine'
    ? 'grid-cols-1 sm:grid-cols-3'
    : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4'

  // ── Hero section según heroStyle ────────────────────────────────────────────

  let heroSection: React.ReactNode

  if (layout === 'split') {
    // Hero partido: texto izquierda, imagen derecha
    heroSection = (
      <section className="flex min-h-[100svh]">
        {/* Lado texto */}
        <div className="w-full md:w-[45%] flex flex-col justify-center px-10 md:px-16 py-20 bg-ivory">
          <p className="text-[11px] tracking-[.20em] uppercase mb-5 text-encantika-stone">
            Nueva colección
          </p>
          <h1 className="font-display font-normal leading-[1.1] tracking-[.08em] text-5xl sm:text-6xl text-onyx">
            Brilla con magia
          </h1>
          <p className="mt-5 text-[15px] text-encantika-stone">
            Joyería hecha con amor para momentos únicos
          </p>
          <Link href="/catalogo"
            className="inline-block mt-8 border border-onyx text-onyx text-xs tracking-[.12em] uppercase px-8 py-3 hover:bg-onyx hover:text-white transition-all duration-300 w-fit">
            Ver colección
          </Link>
        </div>
        {/* Lado imagen */}
        <div className="hidden md:block md:w-[55%] relative">
          <Image
            src={heroUrl ?? '/hero-1.jpg'}
            alt="Encantika — Brilla con magia"
            fill
            className="object-cover"
            style={{ objectPosition: heroPos }}
            sizes="55vw"
            priority
            unoptimized={!!heroUrl}
          />
        </div>
      </section>
    )
  } else if (layout === 'magazine') {
    // Hero compacto
    heroSection = (
      <section className="relative overflow-hidden" style={{ height: '45vh', minHeight: 300 }}>
        <Image
          src={heroUrl ?? '/hero-1.jpg'}
          alt="Encantika — Brilla con magia"
          fill
          className="object-cover"
          style={{ objectPosition: heroPos }}
          sizes="100vw"
          priority
          unoptimized={!!heroUrl}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-white/80 text-[10px] tracking-[.20em] uppercase mb-3">Nueva colección</p>
          <h1 className="font-display text-white font-normal leading-[1.1] tracking-[.08em] text-4xl sm:text-5xl">
            Brilla con magia
          </h1>
          <Link href="/catalogo"
            className="inline-block mt-6 border border-white text-white text-xs tracking-[.12em] uppercase px-6 py-2.5 hover:bg-white hover:text-onyx transition-all duration-300">
            Ver colección
          </Link>
        </div>
      </section>
    )
  } else if (layout === 'inmersivo') {
    // Hero fullscreen con logo centrado
    heroSection = (
      <section className="relative overflow-hidden" style={{ height: '100svh', minHeight: 600 }}>
        <Image
          src={heroUrl ?? '/hero-1.jpg'}
          alt="Encantika — Brilla con magia"
          fill
          className="object-cover"
          style={{ objectPosition: heroPos }}
          sizes="100vw"
          priority
          unoptimized={!!heroUrl}
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <Image src="/logo.png" alt="Encantika" width={200} height={50} className="h-14 w-auto mb-8 brightness-0 invert" />
          <p className="text-white/80 text-[11px] tracking-[.20em] uppercase mb-5">Nueva colección</p>
          <h1 className="font-display text-white font-normal leading-[1.1] tracking-[.08em] text-5xl sm:text-7xl">
            Brilla con magia
          </h1>
          <Link href="/catalogo"
            className="inline-block mt-8 border border-white text-white text-xs tracking-[.12em] uppercase px-8 py-3 hover:bg-white hover:text-onyx transition-all duration-300">
            Ver colección
          </Link>
        </div>
        <ScrollIndicator />
      </section>
    )
  } else {
    // clasico y lateral: hero 100svh estándar
    heroSection = (
      <section className="relative overflow-hidden" style={{ height: '100svh', minHeight: 600 }}>
        <Image
          src={heroUrl ?? '/hero-1.jpg'}
          alt="Encantika — Brilla con magia"
          fill
          className="object-cover"
          style={{ objectPosition: heroPos }}
          sizes="100vw"
          priority
          unoptimized={!!heroUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/35" />
        <div className="absolute inset-0 flex items-center">
          <div className="pl-[8%] pr-8 max-w-2xl">
            <p className="text-white/80 text-[11px] tracking-[.20em] uppercase mb-5">Nueva colección</p>
            <h1 className="font-display text-white font-normal leading-[1.1] tracking-[.08em] text-5xl sm:text-7xl">
              Brilla con magia
            </h1>
            <p className="mt-5 text-white/75 text-base sm:text-lg">
              Joyería hecha con amor para momentos únicos
            </p>
            <Link href="/catalogo"
              className="inline-block mt-8 border border-white text-white text-xs tracking-[.12em] uppercase px-8 py-3 hover:bg-white hover:text-onyx transition-all duration-300">
              Ver colección
            </Link>
          </div>
        </div>
        <ScrollIndicator />
      </section>
    )
  }

  return (
    <>
      {heroSection}

      {/* ── Sección 2: Categorías ──────────────────────────────────────────── */}
      <section className="bg-ivory py-20 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-4xl font-normal tracking-wide text-onyx text-center">
            Explora nuestra colección
          </h2>
          <p className="mt-3 text-sm text-encantika-stone text-center">
            Encuentra la joya perfecta para cada ocasión
          </p>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIAS.map(({ nombre, slug, Icon }) => (
              <Link key={slug} href={`/catalogo?categoria=${slug}`}
                className="group flex flex-col items-center gap-4 bg-nude rounded p-6 sm:p-8 hover:shadow-sm transition-shadow duration-300">
                <div className="w-10 h-10 text-gold"><Icon /></div>
                <span className="font-display text-xl text-onyx">{nombre}</span>
                <span className="text-encantika-stone text-sm group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sección 3: Destacados (condicional) ───────────────────────────── */}
      {productos.length > 0 && (
        <section className="bg-white py-20 px-6 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-4xl font-normal text-onyx text-center tracking-wide">
              Piezas destacadas
            </h2>
            <div className={`mt-12 grid gap-4 sm:gap-6 ${productGridCols}`}>
              {productos.map((p) => {
                const ruta = getMainImage(
                  (p.imagenes_producto as { ruta_almacenamiento: string; orden: number }[]) ?? []
                )
                const imgSrc = ruta ? `${storageUrl}/${ruta}` : null
                const cat = (p.categorias as { nombre: string } | null)?.nombre
                return (
                  <Link key={p.id} href={`/catalogo/${p.slug}`} className="group">
                    <div className="relative aspect-square overflow-hidden bg-nude">
                      {imgSrc ? (
                        <Image src={imgSrc} alt={p.nombre} fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw" />
                      ) : (
                        <div className="absolute inset-0 bg-nude" />
                      )}
                    </div>
                    <div className="mt-3 space-y-1">
                      {cat && <p className="text-[10px] uppercase tracking-[.12em] text-encantika-stone">{cat}</p>}
                      <h3 className="font-display text-xl text-onyx leading-tight">{p.nombre}</h3>
                      <p className="text-sm text-encantika-stone">{formatCLP(p.precio_base)}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
            <div className="mt-12 text-center">
              <Link href="/catalogo"
                className="inline-block border border-onyx text-onyx text-xs tracking-[.12em] uppercase px-8 py-3 hover:bg-onyx hover:text-white transition-all duration-300">
                Ver todo el catálogo
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Sección 4: Banner "Arma tu joya" ──────────────────────────────── */}
      <section className="relative flex items-center justify-center text-center overflow-hidden"
        style={{ height: 'clamp(280px, 40vw, 400px)' }}>
        <Image src={bannerUrl ?? '/hero-2.jpg'} alt="Crea tu joya única" fill
          className="object-cover" style={{ objectPosition: bannerPos }}
          sizes="100vw" unoptimized={!!bannerUrl} />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(201,160,53,0.72)' }} />
        <div className="relative z-10 px-6 max-w-xl">
          <h2 className="font-display text-white font-normal tracking-[.06em] text-[40px] sm:text-[52px] leading-[1.1]">
            Crea tu joya única
          </h2>
          <p className="mt-4 text-white/85 text-base">Elige cada detalle y diseña la pieza perfecta para ti</p>
          <Link href="/arma-tu-joya"
            className="inline-block mt-8 border border-white text-white text-xs tracking-[.12em] uppercase px-8 py-3 hover:bg-white hover:text-onyx transition-all duration-300">
            Comenzar ahora
          </Link>
        </div>
      </section>

      {/* ── Sección 5: Historia (condicional) ─────────────────────────────── */}
      {config?.mostrar_historia && config?.historia && (
        <section className="bg-ivory py-20 px-6 sm:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="relative rounded overflow-hidden" style={{ height: 'clamp(320px, 50vw, 500px)' }}>
              <Image src={historiaUrl ?? '/hero-3.jpg'} alt="Nuestra historia" fill
                className="object-cover" style={{ objectPosition: historiaPos }}
                sizes="(max-width: 768px) 100vw, 50vw" unoptimized={!!historiaUrl} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[.15em] text-gold">Nuestra historia</p>
              <h2 className="font-display text-4xl sm:text-5xl font-normal text-onyx mt-4 leading-tight">
                {config.nombre_tienda}
              </h2>
              <p className="mt-6 text-[15px] text-encantika-stone leading-[1.8]">{config.historia}</p>
              <Link href="/sobre-nosotros"
                className="inline-block mt-8 text-sm text-onyx border-b border-onyx pb-0.5 hover:text-encantika-stone hover:border-encantika-stone transition-colors duration-200">
                Conoce más →
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
