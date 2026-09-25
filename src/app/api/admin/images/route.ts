import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const productoId = req.nextUrl.searchParams.get('productoId')
  if (!productoId) {
    return NextResponse.json({ error: 'productoId es requerido' }, { status: 400 })
  }

  const ordenParam = req.nextUrl.searchParams.get('orden')
  const isMain = ordenParam === '0'

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'No se pudo leer el formulario' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'El archivo supera los 5 MB' }, { status: 400 })
  }

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Formato de archivo no permitido' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const ruta = isMain
    ? `${productoId}/principal-${Date.now()}.${ext}`
    : `${productoId}/${Date.now()}.${ext}`

  const admin = createAdminClient()

  // For the main image: remove the existing orden=0 record first
  if (isMain) {
    const { data: existingMain } = await admin
      .from('imagenes_producto')
      .select('id, ruta_almacenamiento')
      .eq('producto_id', productoId)
      .eq('orden', 0)
      .maybeSingle()
    if (existingMain) {
      await admin.storage.from('imagenes-productos').remove([existingMain.ruta_almacenamiento])
      await admin.from('imagenes_producto').delete().eq('id', existingMain.id)
    }
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { error: storageError } = await admin.storage
    .from('imagenes-productos')
    .upload(ruta, buffer, { contentType: file.type, upsert: false })

  if (storageError) {
    return NextResponse.json({ error: 'Error al subir el archivo al almacenamiento' }, { status: 500 })
  }

  let orden: number
  if (isMain) {
    orden = 0
  } else {
    // Additional images start at orden=1
    const { data: lastImg } = await admin
      .from('imagenes_producto')
      .select('orden')
      .eq('producto_id', productoId)
      .gte('orden', 1)
      .order('orden', { ascending: false })
      .limit(1)
      .single()
    orden = lastImg ? lastImg.orden + 1 : 1
  }

  const textoAlt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')

  const { error: dbError } = await admin.from('imagenes_producto').insert({
    producto_id: productoId,
    ruta_almacenamiento: ruta,
    texto_alt: textoAlt,
    orden,
  })

  if (dbError) {
    await admin.storage.from('imagenes-productos').remove([ruta])
    return NextResponse.json({ error: 'Error al guardar la imagen en la base de datos' }, { status: 500 })
  }

  return NextResponse.json({ success: true, ruta })
}
