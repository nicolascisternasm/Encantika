'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type ActionState = { error?: string; success?: string }

// Valid tipos per DB CHECK constraint: ('compra', 'venta', 'ajuste', 'devolucion')
const TIPOS = ['compra', 'venta', 'ajuste', 'devolucion']

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

// ── Batch stock adjustment (used by InventoryPanel) ───────────────────────────

export async function ajustarStocks(
  productoId: string,
  ajustes: Array<{ varianteId: string; nuevoStock: number; stockActual: number }>
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const movimientos = ajustes
    .filter(a => a.nuevoStock !== a.stockActual)
    .map(a => ({
      variante_id: a.varianteId,
      cantidad: a.nuevoStock - a.stockActual,
      tipo: 'ajuste',
      creado_por: user.id,
      nota: 'Ajuste manual desde panel admin',
    }))

  if (movimientos.length === 0) {
    return { success: 'Sin cambios de stock' }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('movimientos_inventario').insert(movimientos)
  if (error) return { error: 'Error al registrar los movimientos de inventario' }

  revalidatePath(`/administracion/productos/${productoId}`)
  return { success: `${movimientos.length} ajuste${movimientos.length !== 1 ? 's' : ''} guardado${movimientos.length !== 1 ? 's' : ''}` }
}
