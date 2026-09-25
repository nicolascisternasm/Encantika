import Link from 'next/link'
import PageHeader from '@/components/admin/PageHeader'
import ProductTable from '@/components/admin/ProductTable'
import { getProductos } from '@/features/products/queries'

export default async function ProductosPage() {
  const productos = await getProductos()

  return (
    <div>
      <PageHeader
        title="Productos"
        description="Gestiona el catálogo de productos"
        action={
          <Link
            href="/administracion/productos/nuevo"
            className="px-4 py-2 text-sm bg-stone-800 text-white hover:bg-stone-700 transition-colors"
          >
            + Nuevo producto
          </Link>
        }
      />
      <ProductTable productos={productos as any} />
    </div>
  )
}
