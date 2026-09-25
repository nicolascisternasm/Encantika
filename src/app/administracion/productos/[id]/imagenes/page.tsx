import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageHeader from '@/components/admin/PageHeader'
import ImageGallery from '@/components/admin/ImageGallery'
import { createClient } from '@/lib/supabase/server'

export default async function ImagenesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: producto } = await supabase
    .from('productos')
    .select('id, nombre')
    .eq('id', id)
    .single()
  if (!producto) notFound()

  const { data: imagenes } = await supabase
    .from('imagenes_producto')
    .select('*')
    .eq('producto_id', id)
    .order('orden', { ascending: true })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  return (
    <div>
      <PageHeader
        title={`Imágenes — ${producto.nombre}`}
        description="Sube y gestiona las imágenes del producto"
        action={
          <Link
            href={`/administracion/productos/${id}`}
            className="text-xs text-stone-500 hover:text-stone-700 underline"
          >
            ← Volver al producto
          </Link>
        }
      />
      <ImageGallery
        productoId={id}
        imagenes={imagenes ?? []}
        storageUrl={`${supabaseUrl}/storage/v1/object/public`}
      />
    </div>
  )
}
