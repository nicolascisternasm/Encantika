import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageHeader from '@/components/admin/PageHeader'
import ProductForm from '@/components/admin/ProductForm'
import { getProducto } from '@/features/products/queries'
import { getCategorias } from '@/features/categories/queries'

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [producto, categorias] = await Promise.all([getProducto(id), getCategorias()])

  if (!producto) notFound()

  return (
    <div>
      <PageHeader
        title={producto.nombre}
        description="Edita la información del producto"
        action={
          <div className="flex gap-2">
            <Link
              href={`/administracion/productos/${id}/variantes`}
              className="px-3 py-2 text-xs border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Variantes
            </Link>
            <Link
              href={`/administracion/productos/${id}/imagenes`}
              className="px-3 py-2 text-xs border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Imágenes
            </Link>
            <Link
              href={`/administracion/productos/${id}/inventario`}
              className="px-3 py-2 text-xs border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Inventario
            </Link>
          </div>
        }
      />
      <ProductForm
        categorias={categorias.map((c) => ({ id: c.id, nombre: c.nombre }))}
        producto={{
          id: producto.id,
          nombre: producto.nombre,
          slug: producto.slug,
          precio_base: producto.precio_base,
          estado: producto.estado,
          descripcion: producto.descripcion,
          categoria_id: producto.categoria_id,
          destacado: producto.destacado,
        }}
      />
    </div>
  )
}
