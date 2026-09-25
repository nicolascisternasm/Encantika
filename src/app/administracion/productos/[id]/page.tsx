import { notFound } from 'next/navigation'
import PageHeader from '@/components/admin/PageHeader'
import ProductForm from '@/components/admin/ProductForm'
import MainImageUpload from '@/components/admin/MainImageUpload'
import AdditionalGallery from '@/components/admin/AdditionalGallery'
import CollapsibleSection from '@/components/admin/CollapsibleSection'
import InventoryPanel from '@/components/admin/InventoryPanel'
import ColeccionesSelector from '@/components/admin/ColeccionesSelector'
import VariantManager from '@/components/admin/VariantManager'
import { getProducto } from '@/features/products/queries'
import { getCategorias } from '@/features/categories/queries'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type ImagenRow = {
  id: string
  ruta_almacenamiento: string
  orden: number
  texto_alt: string | null
}

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [
    producto,
    categorias,
    { data: imagesData },
    { data: productoInsumosData },
    { data: todosInsumosData },
    { data: coleccionesActivasData },
    { data: coleccionesProductoData },
    { data: atributosData },
    { data: productoAtributosData },
    { data: variantesData },
  ] = await Promise.all([
    getProducto(id),
    getCategorias(),
    supabase
      .from('imagenes_producto')
      .select('id, ruta_almacenamiento, orden, texto_alt')
      .eq('producto_id', id)
      .order('orden', { ascending: true }),
    supabase
      .from('producto_insumos')
      .select('insumo_id, cantidad_por_unidad, nota, insumos(id, nombre, unidad)')
      .eq('producto_id', id),
    supabase
      .from('insumos')
      .select('id, nombre, unidad')
      .eq('activo', true)
      .order('nombre'),
    supabase
      .from('colecciones')
      .select('id, nombre')
      .eq('activo', true)
      .order('nombre'),
    supabase
      .from('producto_colecciones')
      .select('coleccion_id')
      .eq('producto_id', id),
    supabase
      .from('atributos')
      .select('id, nombre, codigo, orden, valores_atributo(id, valor, slug, activo)')
      .eq('valores_atributo.activo', true)
      .order('orden', { ascending: true }),
    supabase
      .from('producto_atributos')
      .select('atributo_id')
      .eq('producto_id', id),
    createAdminClient()
      .from('variantes_producto')
      .select(`id, sku, precio, activo, permite_a_pedido,
        variante_valores_atributo(valor_atributo_id, valores_atributo(id, valor, slug))`)
      .eq('producto_id', id),
  ])

  if (!producto) notFound()

  const imagenes: ImagenRow[] = (imagesData ?? []) as ImagenRow[]
  const mainImage = imagenes.find(img => img.orden === 0) ?? null
  const additionalImages = imagenes.filter(img => img.orden > 0)

  // Stock: sum of all active variants
  const variantesRaw = (producto as any).variantes_produto ?? (producto as any).variantes_producto ?? []
  const activeVariants = variantesRaw.filter((v: any) => v.activo)
  const varianteIds: string[] = variantesRaw.map((v: any) => v.id)

  const { data: stocks } = varianteIds.length > 0
    ? await supabase
        .from('stock_variantes')
        .select('variante_id, stock')
        .in('variante_id', varianteIds)
    : { data: [] as { variante_id: string | null; stock: number | null }[] }

  const stockMap = new Map((stocks ?? []).map(s => [s.variante_id!, s.stock ?? 0]))
  const stockActual = activeVariants.reduce(
    (sum: number, v: any) => sum + (stockMap.get(v.id) ?? 0),
    0
  )
  const varianteId: string | null = activeVariants[0]?.id ?? null

  // Insumos for fabricado products
  const insumos = (productoInsumosData ?? []).map((pi: any) => ({
    insumo_id: pi.insumo_id as string,
    nombre: (pi.insumos as any)?.nombre as string ?? '',
    unidad: (pi.insumos as any)?.unidad as string ?? 'unidad',
    cantidad_por_unidad: pi.cantidad_por_unidad as number,
    nota: pi.nota as string | null,
  }))

  const todosInsumos = (todosInsumosData ?? []).map(i => ({
    id: i.id,
    nombre: i.nombre,
    unidad: i.unidad,
  }))

  const tipoProducto = (producto as any).tipo_producto as string ?? 'terminado'

  // Keys ensure client components remount with fresh state when data changes
  const inventoryKey = `s:${stockActual}|v:${varianteId ?? 'none'}`

  const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}/storage/v1/object/public`

  const coleccionesActivas = (coleccionesActivasData ?? []).map(c => ({ id: c.id, nombre: c.nombre }))
  const coleccionesSeleccionadas = (coleccionesProductoData ?? []).map(c => c.coleccion_id)

  // VariantManager data
  const atributosDisponibles = (atributosData ?? [])
    .map((a: any) => ({
      id: a.id as string,
      nombre: a.nombre as string,
      codigo: a.codigo as string,
      valores_atributo: ((a.valores_atributo as any[]) ?? []).map((v: any) => ({
        id: v.id as string,
        valor: v.valor as string,
        slug: v.slug as string,
      })),
    }))
    .filter((a: any) => a.valores_atributo.length > 0)

  const atributosAsignados = (productoAtributosData ?? []).map((pa: any) => pa.atributo_id as string)

  const variantesParaManager = (variantesData ?? []).map((v: any) => ({
    id: v.id as string,
    sku: v.sku as string,
    precio: v.precio as number,
    activo: v.activo as boolean,
    permite_a_pedido: v.permite_a_pedido as boolean,
    stock: stockMap.get(v.id) ?? 0,
    variante_valores_atributo: ((v.variante_valores_atributo as any[]) ?? []).map((vva: any) => ({
      valor_atributo_id: vva.valor_atributo_id as string,
      valores_atributo: vva.valores_atributo
        ? { id: vva.valores_atributo.id as string, valor: vva.valores_atributo.valor as string, slug: vva.valores_atributo.slug as string }
        : null,
    })),
  }))

  const variantManagerKey = variantesParaManager.map(v => `${v.id}:${v.stock}`).join('|')

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader
        title={producto.nombre}
        description="Edita la información del producto"
      />

      <div className="bg-white border border-stone-100 p-6 space-y-5">
        <MainImageUpload
          productoId={id}
          imagen={mainImage}
          storageUrl={storageUrl}
        />
        <div className="border-t border-stone-100 pt-5">
          <AdditionalGallery
            productoId={id}
            imagenes={additionalImages}
            storageUrl={storageUrl}
          />
        </div>
      </div>

      <ProductForm
        categorias={categorias.map(c => ({ id: c.id, nombre: c.nombre }))}
        producto={{
          id: producto.id,
          nombre: producto.nombre,
          slug: producto.slug,
          precio_base: producto.precio_base,
          estado: producto.estado,
          tipo_producto: tipoProducto,
          descripcion: producto.descripcion,
          categoria_id: producto.categoria_id ?? null,
          destacado: producto.destacado,
        }}
      />

      <CollapsibleSection title="Inventario">
        <InventoryPanel
          key={inventoryKey}
          productoId={id}
          productoSlug={producto.slug}
          tipoProducto={tipoProducto}
          stockActual={stockActual}
          varianteId={varianteId}
          insumos={insumos}
          todosInsumos={todosInsumos}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Atributos y Variantes" defaultOpen>
        <VariantManager
          key={variantManagerKey}
          productoId={id}
          productoSlug={producto.slug}
          precioBase={producto.precio_base}
          atributosDisponibles={atributosDisponibles}
          atributosAsignados={atributosAsignados}
          variantes={variantesParaManager}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Colecciones">
        <ColeccionesSelector
          productoId={id}
          todas={coleccionesActivas}
          seleccionadas={coleccionesSeleccionadas}
        />
      </CollapsibleSection>
    </div>
  )
}
