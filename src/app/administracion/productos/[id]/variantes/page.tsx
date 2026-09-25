import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageHeader from '@/components/admin/PageHeader'
import VariantMatrix from '@/components/admin/VariantMatrix'
import { getProducto } from '@/features/products/queries'
import { createClient } from '@/lib/supabase/server'

export default async function VariantesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const producto = await getProducto(id)
  if (!producto) notFound()

  const supabase = await createClient()
  const variantesRaw = (producto as any).variantes_producto ?? []
  const varianteIds: string[] = variantesRaw.map((v: any) => v.id)

  const { data: stocks } = varianteIds.length > 0
    ? await supabase.from('stock_variantes').select('variante_id, stock').in('variante_id', varianteIds)
    : { data: [] }

  const stockMap = new Map((stocks ?? []).map((s) => [s.variante_id, s.stock]))

  const variantes = variantesRaw.map((v: any) => ({
    ...v,
    stock: stockMap.get(v.id) ?? 0,
  }))

  const atributos = ((producto as any).producto_atributos ?? [])
    .map((pa: any) => pa.atributos)
    .filter(Boolean)

  return (
    <div>
      <PageHeader
        title={`Variantes — ${producto.nombre}`}
        description="Gestiona las variantes del producto"
        action={
          <Link
            href={`/administracion/productos/${id}`}
            className="text-xs text-stone-500 hover:text-stone-700 underline"
          >
            ← Volver al producto
          </Link>
        }
      />
      <VariantMatrix productoId={id} atributos={atributos} variantes={variantes} />
    </div>
  )
}
