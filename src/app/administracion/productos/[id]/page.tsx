import { notFound } from 'next/navigation'
import PageHeader from '@/components/admin/PageHeader'
import ProductForm from '@/components/admin/ProductForm'
import MainImageUpload from '@/components/admin/MainImageUpload'
import AdditionalGallery from '@/components/admin/AdditionalGallery'
import CollapsibleSection from '@/components/admin/CollapsibleSection'
import VariantManager from '@/components/admin/VariantManager'
import InventoryPanel from '@/components/admin/InventoryPanel'
import { getProducto } from '@/features/products/queries'
import { getCategorias } from '@/features/categories/queries'
import { createClient } from '@/lib/supabase/server'

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

  const [producto, categorias, { data: imagesData }, { data: allAttrsData }] = await Promise.all([
    getProducto(id),
    getCategorias(),
    supabase
      .from('imagenes_producto')
      .select('id, ruta_almacenamiento, orden, texto_alt')
      .eq('producto_id', id)
      .order('orden', { ascending: true }),
    supabase
      .from('atributos')
      .select('id, nombre, orden, valores_atributo(id, valor, slug, orden, activo)')
      .order('orden', { ascending: true }),
  ])

  if (!producto) notFound()

  const imagenes: ImagenRow[] = (imagesData ?? []) as ImagenRow[]
  const mainImage = imagenes.find(img => img.orden === 0) ?? null
  const additionalImages = imagenes.filter(img => img.orden > 0)

  const variantesRaw = (producto as any).variantes_producto ?? []
  const varianteIds: string[] = variantesRaw.map((v: any) => v.id)
  const { data: stocks } = varianteIds.length > 0
    ? await supabase
        .from('stock_variantes')
        .select('variante_id, stock')
        .in('variante_id', varianteIds)
    : { data: [] as { variante_id: string; stock: number }[] }

  const stockMap = new Map((stocks ?? []).map((s) => [s.variante_id, s.stock]))
  const variantesConStock = variantesRaw.map((v: any) => ({
    ...v,
    stock: stockMap.get(v.id) ?? 0,
  }))
  const variantesInventario = variantesConStock
    .filter((v: any) => v.activo)
    .map((v: any) => ({ id: v.id, sku: v.sku, precio: v.precio, stock: v.stock }))

  // All available attributes with active values (for VariantManager checkboxes)
  const atributosDisponibles = (allAttrsData ?? [])
    .map((a: any) => ({
      id: a.id as string,
      nombre: a.nombre as string,
      valores_atributo: ((a.valores_atributo ?? []) as any[])
        .filter((v: any) => v.activo)
        .sort((a: any, b: any) => a.orden - b.orden)
        .map((v: any) => ({ id: v.id as string, valor: v.valor as string, slug: v.slug as string })),
    }))
    .filter((a: any) => a.valores_atributo.length > 0)

  // Current product-attribute assignments
  const atributosAsignados = ((producto as any).producto_atributos ?? [])
    .map((pa: any) => pa.atributo_id as string)
    .filter(Boolean)

  // Keys ensure components remount with fresh state when data changes
  const variantManagerKey = variantesConStock.map((v: any) => v.id).sort().join('_') || 'empty'
  const inventoryPanelKey = variantesInventario.map((v: any) => `${v.id}:${v.stock}`).join('_') || 'empty'

  const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}/storage/v1/object/public`

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
          descripcion: producto.descripcion,
          categoria_id: producto.categoria_id ?? null,
          destacado: producto.destacado,
        }}
      />

      <CollapsibleSection title="Variantes">
        <VariantManager
          key={variantManagerKey}
          productoId={id}
          productoSlug={producto.slug}
          precioBase={producto.precio_base}
          atributosDisponibles={atributosDisponibles}
          atributosAsignados={atributosAsignados}
          variantes={variantesConStock}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Inventario">
        <InventoryPanel
          key={inventoryPanelKey}
          productoId={id}
          variantes={variantesInventario}
        />
      </CollapsibleSection>
    </div>
  )
}
