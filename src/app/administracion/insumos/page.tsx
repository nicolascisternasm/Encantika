import PageHeader from '@/components/admin/PageHeader'
import InsumosManager from './InsumosManager'
import { getInsumosConStock } from '@/features/insumos/queries'

export default async function InsumosPage() {
  const insumos = await getInsumosConStock()
  const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}/storage/v1/object/public/imagenes-productos`

  return (
    <div>
      <PageHeader
        title="Insumos"
        description="Materiales y componentes utilizados en la fabricación"
      />
      <InsumosManager insumos={insumos} storageUrl={storageUrl} />
    </div>
  )
}
