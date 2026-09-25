import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatCLP } from '@/lib/utils'
import ProductPageClient, {
  type ImagenPDP,
  type AtributoPDP,
  type VariantePDP,
} from '@/components/store/ProductPageClient'

// ── Metadata SEO ──────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('productos')
    .select('nombre, descripcion, titulo_seo, descripcion_seo, imagenes_producto(ruta_almacenamiento, orden)')
    .eq('slug', slug)
    .eq('estado', 'activo')
    .single()

  if (!data) return { title: 'Producto | Encantika' }

  const title = (data.titulo_seo as string | null) ?? `${data.nombre} | Encantika`
  const description =
    (data.descripcion_seo as string | null) ??
    (data.descripcion as string | null)?.substring(0, 160) ??
    undefined

  const imgs = (data.imagenes_producto as { ruta_almacenamiento: string; orden: number }[]) ?? []
  const sorted = [...imgs].sort((a, b) => a.orden - b.orden)
  const mainRuta = sorted[0]?.ruta_almacenamiento
  const imgUrl = mainRuta
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/imagenes-productos/${mainRuta}`
    : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(imgUrl ? { images: [{ url: imgUrl, width: 1200, height: 1200 }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imgUrl ? { images: [imgUrl] } : {}),
    },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ProductoPDPPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  // Producto completo
  const { data: raw } = await supabase
    .from('productos')
    .select(`
      id, nombre, slug, descripcion, precio_base, precio_comparacion,
      estado, destacado, tipo_producto, dias_tiempo_produccion,
      titulo_seo, descripcion_seo, categoria_id,
      categorias(id, nombre, slug),
      imagenes_producto(id, ruta_almacenamiento, texto_alt, orden, variante_id),
      variantes_producto(
        id, sku, precio, precio_comparacion, activo, permite_a_pedido,
        dias_tiempo_produccion,
        variante_valores_atributo(
          valor_atributo_id,
          valores_atributo(id, valor, slug, color_hex, atributo_id,
            atributos(id, nombre, codigo, orden)
          )
        )
      ),
      producto_colecciones(coleccion_id, colecciones(id, nombre, slug))
    `)
    .eq('slug', slug)
    .single()

  if (!raw || raw.estado !== 'activo') notFound()

  const variantesRaw = (raw.variantes_producto as any[]) ?? []
  const varianteIds = variantesRaw.map((v: any) => v.id as string)

  // Stock
  const { data: stockData } =
    varianteIds.length > 0
      ? await supabase
          .from('stock_variantes')
          .select('variante_id, stock')
          .in('variante_id', varianteIds)
      : { data: [] as { variante_id: string | null; stock: number | null }[] }

  const stockMap = new Map(
    (stockData ?? []).map(s => [s.variante_id!, s.stock ?? 0])
  )

  // Config de tienda (dirección retiro)
  const { data: tienda } = await supabase
    .from('configuracion_tienda')
    .select('direccion_retiro')
    .single()

  // Productos relacionados
  const categoriaId = raw.categoria_id as string | null
  const { data: relacionadosRaw } = categoriaId
    ? await supabase
        .from('productos')
        .select('id, nombre, slug, precio_base, imagenes_producto(ruta_almacenamiento, orden), variantes_producto(precio, activo)')
        .eq('estado', 'activo')
        .eq('categoria_id', categoriaId)
        .neq('id', raw.id)
        .order('creado_en', { ascending: false })
        .limit(4)
    : { data: [] }

  // ── Procesamiento de datos ────────────────────────────────────────────────

  const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}/storage/v1/object/public/imagenes-productos`

  const imagenes: ImagenPDP[] = ((raw.imagenes_producto as any[]) ?? [])
    .sort((a: any, b: any) => a.orden - b.orden)
    .map((img: any) => ({
      id: img.id,
      ruta_almacenamiento: img.ruta_almacenamiento,
      texto_alt: img.texto_alt,
      orden: img.orden,
      variante_id: img.variante_id,
    }))

  // Solo variantes que el cliente puede seleccionar (activas o a pedido)
  const variantes: VariantePDP[] = variantesRaw
    .filter((v: any) => v.activo || v.permite_a_pedido)
    .map((v: any) => ({
      id: v.id,
      sku: v.sku,
      precio: v.precio,
      precio_comparacion: v.precio_comparacion,
      activo: v.activo,
      permite_a_pedido: v.permite_a_pedido,
      dias_tiempo_produccion: v.dias_tiempo_produccion,
      stock: stockMap.get(v.id) ?? 0,
      valores: Object.fromEntries(
        (v.variante_valores_atributo as any[]).map((vva: any) => [
          vva.valores_atributo.atributos.id as string,
          vva.valores_atributo.id as string,
        ])
      ) as Record<string, string>,
    }))

  // Atributos únicos ordenados
  const atributosMap = new Map<string, AtributoPDP>()
  for (const v of variantesRaw.filter((v: any) => v.activo || v.permite_a_pedido)) {
    for (const vva of v.variante_valores_atributo as any[]) {
      const attr = vva.valores_atributo.atributos as any
      if (!atributosMap.has(attr.id)) {
        atributosMap.set(attr.id, {
          id: attr.id,
          nombre: attr.nombre,
          codigo: attr.codigo,
          orden: attr.orden,
          valores: [],
        })
      }
      const atributo = atributosMap.get(attr.id)!
      const val = vva.valores_atributo as any
      if (!atributo.valores.find(vl => vl.id === val.id)) {
        atributo.valores.push({ id: val.id, valor: val.valor, color_hex: val.color_hex })
      }
    }
  }
  const atributos: AtributoPDP[] = [...atributosMap.values()].sort(
    (a, b) => a.orden - b.orden
  )

  // Mapa de imagen por variante
  const variantImageMap: Record<string, number> = {}
  imagenes.forEach((img, idx) => {
    if (img.variante_id) variantImageMap[img.variante_id] = idx
  })

  // Colecciones
  const colecciones = ((raw.producto_colecciones as any[]) ?? [])
    .filter((pc: any) => pc.colecciones)
    .map((pc: any) => ({
      id: pc.colecciones.id as string,
      nombre: pc.colecciones.nombre as string,
      slug: pc.colecciones.slug as string,
    }))

  const categoria = raw.categorias as { id: string; nombre: string; slug: string } | null

  function getMainImg(imgs: { ruta_almacenamiento: string; orden: number }[] | null) {
    if (!imgs || imgs.length === 0) return null
    return `${storageUrl}/${[...imgs].sort((a, b) => a.orden - b.orden)[0].ruta_almacenamiento}`
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-ivory">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="px-6 sm:px-8 py-4 max-w-6xl mx-auto text-xs text-stone-400 flex flex-wrap gap-x-1.5 gap-y-1 items-center"
      >
        <Link href="/" className="hover:text-stone-700 transition-colors">Inicio</Link>
        <span aria-hidden>›</span>
        <Link href="/catalogo" className="hover:text-stone-700 transition-colors">Catálogo</Link>
        {categoria && (
          <>
            <span aria-hidden>›</span>
            <Link
              href={`/catalogo?categoria=${categoria.slug}`}
              className="hover:text-stone-700 transition-colors"
            >
              {categoria.nombre}
            </Link>
          </>
        )}
        <span aria-hidden>›</span>
        <span className="text-stone-600 truncate max-w-[200px]">{raw.nombre as string}</span>
      </nav>

      {/* Grid principal: galería + info */}
      <div className="px-6 sm:px-8 max-w-6xl mx-auto pb-16">
        <ProductPageClient
          producto={{
            id: raw.id,
            nombre: raw.nombre as string,
            descripcion: raw.descripcion as string | null,
            precio_base: raw.precio_base as number,
            precio_comparacion: raw.precio_comparacion as number | null,
            tipo_producto: (raw.tipo_producto as string) ?? 'terminado',
            dias_tiempo_produccion: raw.dias_tiempo_produccion as number | null,
            colecciones,
          }}
          imagenes={imagenes}
          atributos={atributos}
          variantes={variantes}
          variantImageMap={variantImageMap}
          storageUrl={storageUrl}
          direccionRetiro={(tienda as any)?.direccion_retiro ?? null}
        />
      </div>

      {/* Descripción */}
      {raw.descripcion && (
        <section className="border-t border-sand">
          <div className="px-6 sm:px-8 py-12 max-w-6xl mx-auto">
            <h2 className="font-display text-2xl font-normal text-stone-800 mb-5">Descripción</h2>
            <p className="text-[15px] text-stone-600 leading-[1.8] max-w-2xl">
              {raw.descripcion as string}
            </p>
            {colecciones.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {colecciones.map(col => (
                  <Link
                    key={col.id}
                    href={`/colecciones/${col.slug}`}
                    className="text-xs px-3 py-1 border border-stone-200 text-stone-600 hover:border-stone-400 transition-colors"
                  >
                    {col.nombre}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* También te puede gustar */}
      {relacionadosRaw && relacionadosRaw.length > 0 && (
        <section className="border-t border-sand">
          <div className="px-6 sm:px-8 py-16 max-w-6xl mx-auto">
            <h2 className="font-display text-[28px] font-normal text-stone-800 text-center mb-10">
              También te puede gustar
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {(relacionadosRaw as any[]).map(p => {
                const imgUrl = getMainImg(p.imagenes_producto ?? [])
                const vs = (p.variantes_producto as { precio: number; activo: boolean }[]) ?? []
                const precioMin = vs
                  .filter(v => v.activo)
                  .reduce((min, v) => Math.min(min, v.precio), p.precio_base)
                return (
                  <Link key={p.id} href={`/catalogo/${p.slug}`} className="group">
                    <div className="aspect-square overflow-hidden bg-stone-100">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={p.nombre}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-stone-100 to-stone-200" />
                      )}
                    </div>
                    <div className="mt-2 space-y-0.5">
                      <p className="text-sm text-stone-800 group-hover:text-stone-600 transition-colors">
                        {p.nombre}
                      </p>
                      <p className="text-sm text-stone-500">{formatCLP(precioMin)}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
