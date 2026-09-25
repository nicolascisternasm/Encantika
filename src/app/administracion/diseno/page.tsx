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
    .select('tema, fuente_titulos, hero_imagen_id, hero_posicion, banner_joya_imagen_id, banner_joya_posicion, historia_imagen_id, historia_posicion')
    .limit(1)
    .single()

  // Obtener URLs de las imágenes configuradas
  const imageIds = [
    config?.hero_imagen_id,
    config?.banner_joya_imagen_id,
    config?.historia_imagen_id,
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

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-light text-stone-800 tracking-wide mb-1">
        Diseño de la tienda
      </h1>
      <p className="text-sm text-stone-500 mb-10">
        Elige la paleta de colores, la fuente y las imágenes de cada sección.
      </p>

      <DesignEditor
        currentTema={config?.tema ?? TEMA_DEFAULT}
        currentFuente={config?.fuente_titulos ?? FUENTE_DEFAULT}
        hero={{
          imagenId: config?.hero_imagen_id ?? null,
          posicion: config?.hero_posicion ?? 'center center',
          imagenUrl: config?.hero_imagen_id ? (imagenUrlMap[config.hero_imagen_id] ?? null) : null,
        }}
        bannerJoya={{
          imagenId: config?.banner_joya_imagen_id ?? null,
          posicion: config?.banner_joya_posicion ?? 'center center',
          imagenUrl: config?.banner_joya_imagen_id ? (imagenUrlMap[config.banner_joya_imagen_id] ?? null) : null,
        }}
        historia={{
          imagenId: config?.historia_imagen_id ?? null,
          posicion: config?.historia_posicion ?? 'center center',
          imagenUrl: config?.historia_imagen_id ? (imagenUrlMap[config.historia_imagen_id] ?? null) : null,
        }}
      />
    </div>
  )
}
