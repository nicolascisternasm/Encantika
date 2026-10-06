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
    <div style={{ maxWidth: 960 }}>
      <h1 style={{ fontSize: 24, fontWeight: 300, color: '#f9fafb', letterSpacing: '0.02em', marginBottom: 4 }}>
        Biblioteca de imágenes
      </h1>
      <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 40 }}>
        Sube y gestiona las imágenes del sitio — hero, banner, historia.
      </p>

      <ImagenesManager imagenes={imagenes ?? []} />
    </div>
  )
}
