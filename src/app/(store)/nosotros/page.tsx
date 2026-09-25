import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type Config = {
  nosotros_titulo: string | null
  nosotros_subtitulo: string | null
  nosotros_historia: string | null
  nosotros_vision: string | null
  nosotros_seccion1_titulo: string | null
  nosotros_seccion1_texto: string | null
  nosotros_seccion1_imagen_id: string | null
  nosotros_seccion2_titulo: string | null
  nosotros_seccion2_texto: string | null
  nosotros_seccion2_imagen_id: string | null
  nosotros_seccion3_titulo: string | null
  nosotros_seccion3_texto: string | null
  nosotros_seccion3_imagen_id: string | null
}

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('configuracion_tienda')
    .select('nosotros_titulo, nosotros_subtitulo')
    .single()
  const c = data as unknown as Config | null
  return {
    title: `${c?.nosotros_titulo ?? 'Nosotros'} | Encantika`,
    description: c?.nosotros_subtitulo ?? undefined,
  }
}

const EYEBROWS = [
  '01 — Nuestra esencia',
  '02 — Nuestra promesa',
  '03 — Nuestra propuesta',
]

// ── Sección alternada ──────────────────────────────────────────────────────────

function SeccionAlternada({
  titulo,
  texto,
  imagenUrl,
  imagenIzquierda,
  eyebrow,
}: {
  titulo: string
  texto: string
  imagenUrl: string | null
  imagenIzquierda: boolean
  eyebrow: string
}) {
  const Imagen = (
    <div
      className="w-full overflow-hidden bg-[var(--color-tarjeta,#F5F0EB)]"
      style={{ minHeight: 500 }}
    >
      {imagenUrl ? (
        <img
          src={imagenUrl}
          alt={titulo}
          className="w-full h-full object-cover object-center"
          style={{ minHeight: 500 }}
        />
      ) : (
        <div className="w-full flex items-center justify-center" style={{ minHeight: 500 }}>
          <p className="text-xs text-stone-400 text-center px-6 leading-relaxed">
            Agrega una imagen<br />desde el admin
          </p>
        </div>
      )}
    </div>
  )

  const Texto = (
    <div
      className="flex flex-col justify-center py-10 px-8 md:px-16"
      style={{ minHeight: 500 }}
    >
      <p
        className="text-[11px] uppercase tracking-[.15em] mb-4"
        style={{ color: 'var(--color-acento, #C9A035)' }}
      >
        {eyebrow}
      </p>
      <h3 className="font-display text-[32px] font-normal text-stone-800 leading-tight">
        {titulo}
      </h3>
      <div
        className="mt-4 mb-6"
        style={{ width: 40, height: 1, backgroundColor: 'var(--color-acento, #C9A035)' }}
      />
      <p className="text-[15px] text-stone-600 leading-[1.9]">
        {texto}
      </p>
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      {imagenIzquierda ? (
        <>
          <div className="order-1">{Imagen}</div>
          <div className="order-2">{Texto}</div>
        </>
      ) : (
        <>
          <div className="order-2 md:order-1">{Texto}</div>
          <div className="order-1 md:order-2">{Imagen}</div>
        </>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function NosotrosPage() {
  const supabase = await createClient()
  const { data: raw } = await supabase
    .from('configuracion_tienda')
    .select('nosotros_titulo, nosotros_subtitulo, nosotros_historia, nosotros_vision, nosotros_seccion1_titulo, nosotros_seccion1_texto, nosotros_seccion1_imagen_id, nosotros_seccion2_titulo, nosotros_seccion2_texto, nosotros_seccion2_imagen_id, nosotros_seccion3_titulo, nosotros_seccion3_texto, nosotros_seccion3_imagen_id')
    .single()

  const c = raw as unknown as Config | null

  // Cargar URLs de imágenes configuradas
  const imageIds = [
    c?.nosotros_seccion1_imagen_id,
    c?.nosotros_seccion2_imagen_id,
    c?.nosotros_seccion3_imagen_id,
  ].filter(Boolean) as string[]

  let imagenUrlMap: Record<string, string> = {}
  if (imageIds.length > 0) {
    const admin = createAdminClient()
    const { data: imgs } = await admin
      .from('imagenes_sitio')
      .select('id, url')
      .in('id', imageIds)
    if (imgs) {
      for (const img of imgs) imagenUrlMap[img.id] = img.url
    }
  }

  const secciones = [
    {
      eyebrow: EYEBROWS[0],
      titulo: c?.nosotros_seccion1_titulo ?? 'Creadas con amor',
      texto: c?.nosotros_seccion1_texto ?? '',
      imagenUrl: c?.nosotros_seccion1_imagen_id ? imagenUrlMap[c.nosotros_seccion1_imagen_id] ?? null : null,
      imagenIzquierda: true,
    },
    {
      eyebrow: EYEBROWS[1],
      titulo: c?.nosotros_seccion2_titulo ?? 'Materiales de calidad',
      texto: c?.nosotros_seccion2_texto ?? '',
      imagenUrl: c?.nosotros_seccion2_imagen_id ? imagenUrlMap[c.nosotros_seccion2_imagen_id] ?? null : null,
      imagenIzquierda: false,
    },
    {
      eyebrow: EYEBROWS[2],
      titulo: c?.nosotros_seccion3_titulo ?? 'Para momentos únicos',
      texto: c?.nosotros_seccion3_texto ?? '',
      imagenUrl: c?.nosotros_seccion3_imagen_id ? imagenUrlMap[c.nosotros_seccion3_imagen_id] ?? null : null,
      imagenIzquierda: true,
    },
  ]

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section
        className="px-8 py-20 text-center"
        style={{ backgroundColor: 'var(--color-tarjeta, #F5F0EB)' }}
      >
        <p
          className="text-[11px] uppercase tracking-[.15em] mb-4"
          style={{ color: 'var(--color-acento, #C9A035)' }}
        >
          Encantika
        </p>
        <h1 className="font-display text-[52px] font-normal leading-tight text-stone-800 mb-5 max-w-xl mx-auto">
          {c?.nosotros_titulo ?? 'Nuestra historia'}
        </h1>
        <p className="text-[18px] text-stone-600 max-w-lg mx-auto leading-relaxed">
          {c?.nosotros_subtitulo ?? 'Joyas hechas con amor desde el corazón de Chile'}
        </p>
      </section>

      {/* Historia y visión */}
      <section className="bg-white px-8 py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="font-display text-[32px] font-normal text-stone-800 mb-5">
              Nuestra historia
            </h2>
            <p className="text-[15px] text-stone-600 leading-[1.8]">
              {c?.nosotros_historia ?? ''}
            </p>
          </div>
          <div
            className="p-8 rounded-sm"
            style={{ backgroundColor: 'var(--color-tarjeta, #F5F0EB)' }}
          >
            <h2
              className="font-display text-[24px] font-normal mb-4"
              style={{ color: 'var(--color-acento, #C9A035)' }}
            >
              Nuestra visión
            </h2>
            <p className="text-[15px] text-stone-600 leading-[1.8] italic">
              {c?.nosotros_vision ?? ''}
            </p>
          </div>
        </div>
      </section>

      {/* Secciones alternadas */}
      {secciones.map((s, i) => (
        <section key={i} style={{ borderTop: '1px solid var(--color-borde, #E8E2DB)' }}>
          <SeccionAlternada {...s} />
        </section>
      ))}
    </main>
  )
}
