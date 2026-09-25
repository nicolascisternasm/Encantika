import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageHeader from '@/components/admin/PageHeader'
import InventoryForm from '@/components/admin/InventoryForm'
import { createClient } from '@/lib/supabase/server'

export default async function InventarioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: producto } = await supabase
    .from('productos')
    .select('id, nombre')
    .eq('id', id)
    .single()
  if (!producto) notFound()

  const { data: variantes } = await supabase
    .from('variantes_producto')
    .select('id, sku, precio')
    .eq('producto_id', id)
    .eq('activo', true)
    .order('sku')

  const varianteIds = (variantes ?? []).map((v) => v.id)

  const { data: stocks } = varianteIds.length > 0
    ? await supabase.from('stock_variantes').select('variante_id, stock').in('variante_id', varianteIds)
    : { data: [] }

  const stockMap = new Map((stocks ?? []).map((s) => [s.variante_id, s.stock]))

  const variantesConStock = (variantes ?? []).map((v) => ({
    ...v,
    stock: stockMap.get(v.id) ?? 0,
  }))

  return (
    <div>
      <PageHeader
        title={`Inventario — ${producto.nombre}`}
        description="Registra movimientos de inventario"
        action={
          <Link
            href={`/administracion/productos/${id}`}
            className="text-xs text-stone-500 hover:text-stone-700 underline"
          >
            ← Volver al producto
          </Link>
        }
      />
      <InventoryForm productoId={id} variantes={variantesConStock} />
    </div>
  )
}
