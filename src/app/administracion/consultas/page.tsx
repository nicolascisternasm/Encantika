import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import PageHeader from '@/components/admin/PageHeader'
import ConsultasList from './ConsultasList'

export default async function ConsultasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/administracion/login')

  const admin = createAdminClient()
  const { data: consultas } = await admin
    .from('consultas_contacto')
    .select('id, nombre, email, telefono, asunto, mensaje, leido, creado_en')
    .order('creado_en', { ascending: false })

  const noLeidas = (consultas ?? []).filter(c => !c.leido).length

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Consultas de contacto"
        description={
          noLeidas > 0
            ? `${noLeidas} consulta${noLeidas !== 1 ? 's' : ''} sin leer`
            : 'Todos los mensajes han sido leídos'
        }
      />
      <ConsultasList consultas={consultas ?? []} />
    </div>
  )
}
