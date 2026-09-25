import PageHeader from '@/components/admin/PageHeader'
import CategoryTree from '@/components/admin/CategoryTree'
import { getCategorias } from '@/features/categories/queries'

export default async function CategoriasPage() {
  const categorias = await getCategorias()

  return (
    <div>
      <PageHeader
        title="Categorías"
        description="Organiza los productos por categorías"
      />
      <CategoryTree categorias={categorias} />
    </div>
  )
}
