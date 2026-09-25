import PageHeader from '@/components/admin/PageHeader'
import AttributeManager from '@/components/admin/AttributeManager'
import { getAtributos } from '@/features/attributes/queries'

export default async function AtributosPage() {
  const atributos = await getAtributos()

  return (
    <div>
      <PageHeader
        title="Atributos"
        description="Define atributos y sus valores para generar variantes de productos"
      />
      <AttributeManager atributos={atributos as any} />
    </div>
  )
}
