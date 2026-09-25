import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import PageHeader from '@/components/admin/PageHeader'
import SettingsForm from './SettingsForm'
import PaginasForm from './PaginasForm'
import ConfigTabs from './ConfigTabs'
import type { Tables } from '@/types/database'

type ConfigExtra = {
  nosotros_titulo: string | null
  nosotros_subtitulo: string | null
  nosotros_historia: string | null
  nosotros_vision: string | null
  nosotros_seccion1_titulo: string | null
  nosotros_seccion1_texto: string | null
  nosotros_seccion1_imagen_id: string | null
  nosotros_seccion2_titulo: string | null
  nosotros_seccion2_texto: string | null
  nosotros_seccion2_imagen_id: string | null
  nosotros_seccion3_titulo: string | null
  nosotros_seccion3_texto: string | null
  nosotros_seccion3_imagen_id: string | null
  footer_horario: string | null
  footer_direccion: string | null
  footer_telefono: string | null
  contacto_titulo: string | null
  contacto_subtitulo: string | null
  contacto_email: string | null
}

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/administracion/login')

  const admin = createAdminClient()
  const { data } = await admin
    .from('configuracion_tienda')
    .select('*')
    .eq('id', 1)
    .single()

  const settings = data as Tables<'configuracion_tienda'> | null
  const extra = data as unknown as ConfigExtra | null

  // Cargar URLs de imágenes configuradas para nosotros
  const imageIds = [
    extra?.nosotros_seccion1_imagen_id,
    extra?.nosotros_seccion2_imagen_id,
    extra?.nosotros_seccion3_imagen_id,
  ].filter(Boolean) as string[]

  let imagenUrlMap: Record<string, string> = {}
  if (imageIds.length > 0) {
    const { data: imgs } = await admin
      .from('imagenes_sitio')
      .select('id, url')
      .in('id', imageIds)
    if (imgs) {
      for (const img of imgs) imagenUrlMap[img.id] = img.url
    }
  }

  const paginasProps = {
    nosotros: {
      titulo: extra?.nosotros_titulo ?? null,
      subtitulo: extra?.nosotros_subtitulo ?? null,
      historia: extra?.nosotros_historia ?? null,
      vision: extra?.nosotros_vision ?? null,
      seccion1_titulo: extra?.nosotros_seccion1_titulo ?? null,
      seccion1_texto: extra?.nosotros_seccion1_texto ?? null,
      seccion2_titulo: extra?.nosotros_seccion2_titulo ?? null,
      seccion2_texto: extra?.nosotros_seccion2_texto ?? null,
      seccion3_titulo: extra?.nosotros_seccion3_titulo ?? null,
      seccion3_texto: extra?.nosotros_seccion3_texto ?? null,
    },
    seccion1: {
      imagenId: extra?.nosotros_seccion1_imagen_id ?? null,
      imagenUrl: extra?.nosotros_seccion1_imagen_id
        ? imagenUrlMap[extra.nosotros_seccion1_imagen_id] ?? null
        : null,
    },
    seccion2: {
      imagenId: extra?.nosotros_seccion2_imagen_id ?? null,
      imagenUrl: extra?.nosotros_seccion2_imagen_id
        ? imagenUrlMap[extra.nosotros_seccion2_imagen_id] ?? null
        : null,
    },
    seccion3: {
      imagenId: extra?.nosotros_seccion3_imagen_id ?? null,
      imagenUrl: extra?.nosotros_seccion3_imagen_id
        ? imagenUrlMap[extra.nosotros_seccion3_imagen_id] ?? null
        : null,
    },
    footer: {
      horario: extra?.footer_horario ?? null,
      direccion: extra?.footer_direccion ?? null,
      telefono: extra?.footer_telefono ?? null,
    },
    contacto: {
      titulo: extra?.contacto_titulo ?? null,
      subtitulo: extra?.contacto_subtitulo ?? null,
      email: extra?.contacto_email ?? null,
    },
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Configuración"
        description="Ajustes generales de la tienda"
      />
      <ConfigTabs
        settingsForm={<SettingsForm settings={settings} />}
        paginasForm={<PaginasForm {...paginasProps} />}
      />
    </div>
  )
}
