import 'server-only'
import { createClient } from '@/lib/supabase/server'

export type InsumoConStock = {
  id: string
  nombre: string
  descripcion: string | null
  unidad: string
  activo: boolean
  creado_en: string
  stock: number
  movimientos: Array<{
    id: string
    cantidad: number
    tipo: string
    nota: string | null
    creado_en: string
  }>
}

export async function getInsumosConStock(): Promise<InsumoConStock[]> {
  const supabase = await createClient()

  const { data: insumos, error } = await supabase
    .from('insumos')
    .select('id, nombre, descripcion, unidad, activo, creado_en')
    .order('nombre')

  if (error || !insumos || insumos.length === 0) return []

  const insumoIds = insumos.map(i => i.id)

  const [{ data: stocks }, { data: movimientos }] = await Promise.all([
    supabase
      .from('stock_insumos')
      .select('insumo_id, stock')
      .in('insumo_id', insumoIds),
    supabase
      .from('movimientos_insumos')
      .select('id, insumo_id, cantidad, tipo, nota, creado_en')
      .in('insumo_id', insumoIds)
      .order('creado_en', { ascending: false }),
  ])

  const stockMap = new Map(
    (stocks ?? []).map(s => [s.insumo_id!, s.stock ?? 0])
  )

  type MovRow = { id: string; insumo_id: string; cantidad: number; tipo: string; nota: string | null; creado_en: string }
  const movimientosMap = new Map<string, MovRow[]>()
  for (const m of (movimientos ?? []) as MovRow[]) {
    if (!movimientosMap.has(m.insumo_id)) movimientosMap.set(m.insumo_id, [])
    movimientosMap.get(m.insumo_id)!.push(m)
  }

  return insumos.map(i => ({
    ...i,
    stock: stockMap.get(i.id) ?? 0,
    movimientos: (movimientosMap.get(i.id) ?? []).slice(0, 10),
  }))
}

export type InsumoBasico = {
  id: string
  nombre: string
  unidad: string
}

export async function getInsumosActivos(): Promise<InsumoBasico[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('insumos')
    .select('id, nombre, unidad')
    .eq('activo', true)
    .order('nombre')
  return (data ?? []).map(i => ({ id: i.id, nombre: i.nombre, unidad: i.unidad }))
}
