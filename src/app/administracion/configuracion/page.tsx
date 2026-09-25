import PageHeader from '@/components/admin/PageHeader'
import { createClient } from '@/lib/supabase/server'
import SettingsForm from './SettingsForm'
import type { Tables } from '@/types/database'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('configuracion_tienda')
    .select('*')
    .eq('id', 1)
    .single()

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Configuración"
        description="Ajustes generales de la tienda"
      />
      <SettingsForm settings={data as Tables<'configuracion_tienda'> | null} />
    </div>
  )
}
