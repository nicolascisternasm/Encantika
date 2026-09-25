import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import CarritoClient from './CarritoClient'

export const metadata: Metadata = {
  title: 'Carrito | Encantika',
}

export type ProductoCard = {
  id: string
  nombre: string
  slug: string
  precio_base: number
  imagen: string | null
}

export default async function CarritoPage() {
  const supabase = await createClient()

  const [{ data: config }, { data: productosRaw }] = await Promise.all([
    supabase.from('configuracion_tienda').select('numero_whatsapp').single(),
    supabase
      .from('productos')
      .select('id, nombre, slug, precio_base, imagenes_producto(ruta_almacenamiento, orden)')
      .eq('estado', 'activo')
      .order('creado_en', { ascending: false })
      .limit(8),
  ])

  const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}/storage/v1/object/public/imagenes-productos`

  const candidatos: ProductoCard[] = (productosRaw ?? []).map((p: any) => {
    const imgs = (p.imagenes_producto as any[]) ?? []
    const sorted = [...imgs].sort((a: any, b: any) => a.orden - b.orden)
    const mainRuta = sorted[0]?.ruta_almacenamiento
    return {
      id: p.id as string,
      nombre: p.nombre as string,
      slug: p.slug as string,
      precio_base: p.precio_base as number,
      imagen: mainRuta ? `${storageUrl}/${mainRuta}` : null,
    }
  })

  return (
    <CarritoClient
      whatsapp={(config as any)?.numero_whatsapp ?? null}
      candidatos={candidatos}
    />
  )
}
