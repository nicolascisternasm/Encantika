import { createClient } from '@/lib/supabase/server'
import ComponenteForm from '../ComponenteForm'

export default async function NuevoComponentePage() {
  const supabase = await createClient()
  const { data: tiposComponente } = await supabase
    .from('tipo_componentes')
    .select('id, nombre, slug')
    .order('orden_configurador')

  return <ComponenteForm tiposComponente={tiposComponente ?? []} />
}
