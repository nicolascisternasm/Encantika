import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ImagenesManager from './ImagenesManager'

export default async function ImagenesPaginaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/administracion/login')

  const admin = createAdminClient()
  const { data: imagenes } = await admin
    .from('imagenes_sitio')
    .select('*')
    .order('creado_en', { ascending: false })

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-light text-stone-800 tracking-wide mb-1">
        Biblioteca de imágenes
      </h1>
      <p className="text-sm text-stone-500 mb-10">
        Sube y gestiona las imágenes del sitio — hero, banner, historia.
      </p>

      <ImagenesManager imagenes={imagenes ?? []} />
    </div>
  )
}
