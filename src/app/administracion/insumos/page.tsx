import PageHeader from '@/components/admin/PageHeader'
import InsumosManager from './InsumosManager'
import { getInsumosConStock } from '@/features/insumos/queries'

export default async function InsumosPage() {
  const insumos = await getInsumosConStock()

  return (
    <div>
      <PageHeader
        title="Insumos"
        description="Materiales y componentes utilizados en la fabricación"
      />
      <InsumosManager insumos={insumos} />
    </div>
  )
}
