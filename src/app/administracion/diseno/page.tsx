import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TEMA_DEFAULT, FUENTE_DEFAULT } from '@/lib/temas'
import DesignEditor from './DesignEditor'

export default async function DisenoPaginaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/administracion/login')

  const admin = createAdminClient()
  const { data: config } = await admin
    .from('configuracion_tienda')
    .select('tema, fuente_titulos')
    .limit(1)
    .single()

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-light text-stone-800 tracking-wide mb-1">
        Diseño de la tienda
      </h1>
      <p className="text-sm text-stone-500 mb-10">
        Elige la paleta de colores y la fuente de los títulos. Los cambios se aplican en la tienda inmediatamente.
      </p>

      <DesignEditor
        currentTema={config?.tema ?? TEMA_DEFAULT}
        currentFuente={config?.fuente_titulos ?? FUENTE_DEFAULT}
      />
    </div>
  )
}
