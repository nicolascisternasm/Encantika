import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ComponenteForm from '../ComponenteForm'

export default async function EditarComponentePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: comp }, { data: tiposComponente }] = await Promise.all([
    supabase
      .from('componentes')
      .select('*')
      .eq('id', id)
      .single(),
    supabase
      .from('tipo_componentes')
      .select('id, nombre, slug')
      .order('orden_configurador'),
  ])

  if (!comp) notFound()

  return (
    <ComponenteForm
      tiposComponente={tiposComponente ?? []}
      inicial={{
        id: comp.id,
        sku: comp.sku,
        nombre: comp.nombre,
        descripcion: comp.descripcion ?? '',
        tipo_componente_id: comp.tipo_componente_id,
        material: comp.material ?? '',
        color: comp.color ?? '',
        precio: comp.precio,
        stock: comp.stock,
        url_imagen: comp.url_imagen ?? '',
        color_primario: comp.color_primario ?? '',
        color_secundario: comp.color_secundario ?? '',
        color_acento: comp.color_acento ?? '',
        estilo_energia: comp.estilo_energia ?? 'neutro',
        intensidad: comp.intensidad ?? 5,
        textura: comp.textura ?? 'suave',
        estilo_particulas: comp.estilo_particulas ?? 'ninguno',
        desc_holistica: comp.desc_holistica ?? '',
        tradicion: comp.tradicion ?? '',
        orden: comp.orden,
        activo: comp.activo,
      }}
    />
  )
}
