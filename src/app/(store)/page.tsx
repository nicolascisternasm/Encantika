import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatCLP } from '@/lib/utils'
import ScrollIndicator from '@/components/store/ScrollIndicator'
import { FadeIn, FadeInStagger, FadeInItem } from '@/components/store/FadeIn'
import StatsCounter from '@/components/store/StatsCounter'
import LandingHero from '@/components/store/LandingHero'
import LandingCategoriasSection, { type ProductoLanding } from '@/components/store/LandingCategoriasSection'

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

  // ── Datos extra para layout landing ──────────────────────────────────────────

  let landingCategorias: { nombre: string; slug: string }[] = []
  let landingProductos: ProductoLanding[] = []

  if (layout === 'landing') {
    const [{ data: cats }, { data: prodsLanding }] = await Promise.all([
      supabase
        .from('categorias')
        .select('nombre, slug')
        .eq('activo', true)
        .order('orden')
        .limit(8),
      supabase
        .from('productos')
        .select(`
          id, nombre, slug, precio_base,
          categorias(nombre, slug),
          imagenes_producto(ruta_almacenamiento, orden)
        `)
        .eq('estado', 'activo')
        .order('destacado', { ascending: false })
        .order('creado_en', { ascending: false })
        .limit(32),
    ])

    landingCategorias = (cats ?? []) as { nombre: string; slug: string }[]
    landingProductos = (prodsLanding ?? []).map((p) => {
      const cat = (p.categorias as { nombre: string; slug: string } | null)
      const imgs = (p.imagenes_producto as { ruta_almacenamiento: string; orden: number }[] | null) ?? []
      const mainImg = imgs.length > 0
        ? [...imgs].sort((a, b) => a.orden - b.orden)[0].ruta_almacenamiento
        : null
      return {
        id: p.id as string,
        nombre: p.nombre as string,
        slug: p.slug as string,
        precio_base: p.precio_base as number,
        categoria_slug: cat?.slug ?? '',
        imagen: mainImg,
      }
    }).filter((p) => p.categoria_slug !== '')
  }

  // Columnas de productos según layout
  const productGridCols = layout === 'magazine'
    ? 'grid-cols-1 sm:grid-cols-3'
    : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4'

  // ── Secciones reutilizables ───────────────────────────────────────────────────

  const bannerSection = (
    <section className="relative flex items-center justify-center text-center overflow-hidden"
      style={{ height: 'clamp(280px, 40vw, 400px)' }}>
      <Image src={bannerUrl ?? '/hero-2.jpg'} alt="Crea tu joya única" fill
        className="object-cover" style={{ objectPosition: bannerPos }}
        sizes="100vw" unoptimized={!!bannerUrl} />
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(201,160,53,0.72)' }} />
      <FadeIn className="relative z-10 px-6 max-w-xl">
        <h2 className="font-display text-white font-normal tracking-[.06em] text-[40px] sm:text-[52px] leading-[1.1]">
          Crea tu joya única
        </h2>
        <p className="mt-4 text-white/85 text-base">Elige cada detalle y diseña la pieza perfecta para ti</p>
        <Link href="/arma-tu-joya"
          className="inline-block mt-8 border border-white text-white text-xs tracking-[.12em] uppercase px-8 py-3 hover:bg-white hover:text-onyx transition-all duration-300">
          Comenzar ahora
        </Link>
      </FadeIn>
    </section>
  )

  const historiaSection = config?.mostrar_historia && config?.historia ? (
    <section className="bg-ivory py-20 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        <FadeIn className="relative rounded overflow-hidden group" style={{ height: 'clamp(320px, 50vw, 500px)' } as React.CSSProperties}>
          <Image src={historiaUrl ?? '/hero-3.jpg'} alt="Nuestra historia" fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            style={{ objectPosition: historiaPos }}
            sizes="(max-width: 768px) 100vw, 50vw" unoptimized={!!historiaUrl} />
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="text-[11px] uppercase tracking-[.15em] text-gold">Nuestra historia</p>
          <h2 className="font-display text-4xl sm:text-5xl font-normal text-onyx mt-4 leading-tight">
            {config.nombre_tienda}
          </h2>
          <p className="mt-6 text-[15px] text-encantika-stone leading-[1.8]">{config.historia}</p>
          <Link href="/nosotros"
            className="inline-block mt-8 text-sm text-onyx border-b border-onyx pb-0.5 hover:text-encantika-stone hover:border-encantika-stone transition-colors duration-200">
            Conoce más →
          </Link>
        </FadeIn>
      </div>
    </section>
  ) : null

  // ── Layout landing ────────────────────────────────────────────────────────────

  if (layout === 'landing') {
    return (
      <>
        <LandingHero heroUrl={heroUrl} heroPos={heroPos} />
        <StatsCounter />
        <LandingCategoriasSection
          categorias={landingCategorias}
          productos={landingProductos}
          storageUrl={storageUrl}
        />
        {bannerSection}
        {historiaSection}
      </>
    )
  }

  // ── Hero section según layout ─────────────────────────────────────────────────

  let heroSection: React.ReactNode

  if (layout === 'split') {
    heroSection = (
      <section className="flex min-h-[100svh]">
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
    // clasico y lateral
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
          <FadeIn className="text-center">
            <h2 className="font-display text-4xl font-normal tracking-wide text-onyx">
              Explora nuestra colección
            </h2>
            <p className="mt-3 text-sm text-encantika-stone">
              Encuentra la joya perfecta para cada ocasión
            </p>
          </FadeIn>
          <FadeInStagger className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4" staggerDelay={0.08}>
            {CATEGORIAS.map(({ nombre, slug, Icon }) => (
              <FadeInItem key={slug}>
                <Link href={`/catalogo?categoria=${slug}`}
                  className="group flex flex-col items-center gap-4 bg-nude rounded p-6 sm:p-8 hover:shadow-sm transition-shadow duration-300">
                  <div className="w-10 h-10 text-gold"><Icon /></div>
                  <span className="font-display text-xl text-onyx">{nombre}</span>
                  <span className="text-encantika-stone text-sm group-hover:translate-x-1 transition-transform duration-200">→</span>
                </Link>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* ── Sección 3: Destacados (condicional) ───────────────────────────── */}
      {productos.length > 0 && (
        <section className="bg-white py-20 px-6 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <FadeIn className="text-center">
              <h2 className="font-display text-4xl font-normal text-onyx tracking-wide">
                Piezas destacadas
              </h2>
            </FadeIn>
            <FadeInStagger className={`mt-12 grid gap-4 sm:gap-6 ${productGridCols}`} staggerDelay={0.07}>
              {productos.map((p) => {
                const ruta = getMainImage(
                  (p.imagenes_producto as { ruta_almacenamiento: string; orden: number }[]) ?? []
                )
                const imgSrc = ruta ? `${storageUrl}/${ruta}` : null
                const cat = (p.categorias as { nombre: string } | null)?.nombre
                return (
                  <FadeInItem key={p.id}>
                    <Link href={`/catalogo/${p.slug}`} className="group block">
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
                  </FadeInItem>
                )
              })}
            </FadeInStagger>
            <FadeIn className="mt-12 text-center" delay={0.1}>
              <Link href="/catalogo"
                className="inline-block border border-onyx text-onyx text-xs tracking-[.12em] uppercase px-8 py-3 hover:bg-onyx hover:text-white transition-all duration-300">
                Ver todo el catálogo
              </Link>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ── Sección 4: Banner "Arma tu joya" ──────────────────────────────── */}
      {bannerSection}

      {/* ── Sección 5: Historia (condicional) ─────────────────────────────── */}
      {historiaSection}
    </>
  )
}
