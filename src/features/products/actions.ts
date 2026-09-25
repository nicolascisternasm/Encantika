'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/utils'

export type ActionState = { error?: string; success?: string; id?: string }

const ESTADOS = ['borrador', 'activo', 'archivado']
const TIPOS_PRODUCTO = ['terminado', 'fabricado']

const productoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  precio_base: z.coerce.number().int('El precio debe ser un número entero').min(0, 'El precio debe ser 0 o mayor'),
  estado: z.string().refine((v) => ESTADOS.includes(v), 'Estado inválido'),
  tipo_producto: z.string().refine((v) => TIPOS_PRODUCTO.includes(v), 'Tipo de producto inválido').optional().default('terminado'),
  descripcion: z.string().optional(),
  categoria_id: z.string().uuid('Categoría inválida').nullable().optional(),
  destacado: z.boolean().optional(),
})

function parseFormData(formData: FormData, nombreOverride?: string) {
  const nombre = (nombreOverride ?? formData.get('nombre')) as string
  return productoSchema.safeParse({
    nombre,
    slug: (formData.get('slug') as string) || generateSlug(nombre),
    precio_base: formData.get('precio_base'),
    estado: formData.get('estado'),
    tipo_producto: (formData.get('tipo_producto') as string) || 'terminado',
    descripcion: (formData.get('descripcion') as string) || undefined,
    categoria_id: (formData.get('categoria_id') as string) || null,
    destacado: formData.get('destacado') === 'true',
  })
}

export async function createProducto(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const parsed = parseFormData(formData)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('productos')
    .insert(parsed.data as any)
    .select('id')
    .single()
  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un producto con ese slug' }
    return { error: 'Error al crear el producto' }
  }
  revalidatePath('/administracion/productos')
  return { success: 'Producto creado exitosamente', id: (data as any).id }
}

export async function updateProducto(id: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const parsed = parseFormData(formData)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const { error } = await admin.from('productos').update(parsed.data as any).eq('id', id)
  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un producto con ese slug' }
    return { error: 'Error al actualizar el producto' }
  }
  revalidatePath('/administracion/productos')
  revalidatePath(`/administracion/productos/${id}`)
  return { success: 'Producto actualizado exitosamente' }
}

export async function deleteProducto(id: string): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const admin = createAdminClient()
  const { error } = await admin.from('productos').delete().eq('id', id)
  if (error) return { error: 'Error al eliminar el producto' }
  revalidatePath('/administracion/productos')
  return { success: 'Producto eliminado' }
}

export async function guardarCaracteristicas(
  productoId: string,
  caracteristicas: Array<{ nombre: string; valor: string }>
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('productos')
    .update({ caracteristicas } as any)
    .eq('id', productoId)

  if (error) return { error: 'Error al guardar las características' }
  revalidatePath(`/administracion/productos/${productoId}`)
  return { success: 'Características guardadas' }
}

export async function updateProductoAtributos(productoId: string, atributoIds: string[]): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const admin = createAdminClient()
  await admin.from('producto_atributos').delete().eq('producto_id', productoId)
  if (atributoIds.length > 0) {
    const { error } = await admin.from('producto_atributos').insert(
      atributoIds.map((atributo_id) => ({ producto_id: productoId, atributo_id }))
    )
    if (error) return { error: 'Error al actualizar los atributos' }
  }
  revalidatePath(`/administracion/productos/${productoId}/variantes`)
  return { success: 'Atributos actualizados' }
}
