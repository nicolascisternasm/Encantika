import PageHeader from '@/components/admin/PageHeader'
import ProductForm from '@/components/admin/ProductForm'
import { getCategorias } from '@/features/categories/queries'

export default async function NuevoProductoPage() {
  const categorias = await getCategorias()

  return (
    <div>
      <PageHeader
        title="Nuevo producto"
        description="Completa la información del producto"
      />
      <ProductForm
        categorias={categorias.map((c) => ({ id: c.id, nombre: c.nombre }))}
      />
    </div>
  )
}
