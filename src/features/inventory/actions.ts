'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type ActionState = { error?: string; success?: string }

const TIPOS = ['entrada', 'salida', 'ajuste']

const movimientoSchema = z.object({
  variante_id: z.string().uuid('ID de variante inválido'),
  cantidad: z.coerce.number().int('La cantidad debe ser un número entero'),
  tipo: z.string().refine((v) => TIPOS.includes(v), 'Tipo de movimiento inválido'),
  nota: z.string().optional(),
  producto_id: z.string(),
})

export async function createMovimientoInventario(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const parsed = movimientoSchema.safeParse({
    variante_id: formData.get('variante_id'),
    cantidad: formData.get('cantidad'),
    tipo: formData.get('tipo'),
    nota: (formData.get('nota') as string) || undefined,
    producto_id: formData.get('producto_id'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { producto_id, ...movimiento } = parsed.data
  const admin = createAdminClient()
  const { error } = await admin.from('movimientos_inventario').insert({
    ...movimiento,
    creado_por: user.id,
  })
  if (error) return { error: 'Error al registrar el movimiento' }

  revalidatePath(`/administracion/productos/${producto_id}/inventario`)
  return { success: 'Movimiento registrado exitosamente' }
}
