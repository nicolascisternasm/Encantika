import PageHeader from '@/components/admin/PageHeader'
import CollectionList from '@/components/admin/CollectionList'
import { getColecciones } from '@/features/collections/queries'

export default async function ColeccionesPage() {
  const colecciones = await getColecciones()

  return (
    <div>
      <PageHeader
        title="Colecciones"
        description="Agrupa productos en colecciones temáticas"
      />
      <CollectionList colecciones={colecciones} />
    </div>
  )
}
