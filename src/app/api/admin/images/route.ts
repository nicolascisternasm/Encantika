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

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Formato de archivo no permitido' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const ruta = `${productoId}/${Date.now()}.${ext}`

  const admin = createAdminClient()
  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { error: storageError } = await admin.storage
    .from('imagenes-producto')
    .upload(ruta, buffer, { contentType: file.type, upsert: false })

  if (storageError) {
    return NextResponse.json({ error: 'Error al subir el archivo al almacenamiento' }, { status: 500 })
  }

  const { data: existing } = await admin
    .from('imagenes_producto')
    .select('orden')
    .eq('producto_id', productoId)
    .order('orden', { ascending: false })
    .limit(1)
    .single()

  const orden = existing ? (existing.orden ?? 0) + 1 : 0

  const { error: dbError } = await admin.from('imagenes_producto').insert({
    producto_id: productoId,
    ruta_almacenamiento: ruta,
    orden,
  })

  if (dbError) {
    await admin.storage.from('imagenes-producto').remove([ruta])
    return NextResponse.json({ error: 'Error al guardar la imagen en la base de datos' }, { status: 500 })
  }

  return NextResponse.json({ success: true, ruta })
}
