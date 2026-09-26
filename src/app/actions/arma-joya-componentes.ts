'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// ── Toggle activo ──────────────────────────────────────────────────────────

export async function toggleComponenteActivo(id: string, activo: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('componentes')
    .update({ activo })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/administracion/arma-joya')
  revalidatePath('/administracion/arma-joya/componentes')
}

// ── Guardar (crear o actualizar) ───────────────────────────────────────────

export type ComponenteFormData = {
  id?: string
  sku: string
  nombre: string
  descripcion: string
  tipo_componente_id: string
  material: string
  color: string
  precio: number
  stock: number
  color_primario: string
  color_secundario: string
  color_acento: string
  estilo_energia: string
  intensidad: number
  textura: string
  estilo_particulas: string
  desc_holistica: string
  tradicion: string
  orden: number
  activo: boolean
}

export async function guardarComponente(data: ComponenteFormData): Promise<{ id: string }> {
  const supabase = await createClient()

  const payload = {
    sku: data.sku.trim().toUpperCase(),
    nombre: data.nombre.trim(),
    descripcion: data.descripcion.trim() || null,
    tipo_componente_id: data.tipo_componente_id,
    material: data.material.trim() || null,
    color: data.color.trim() || null,
    precio: data.precio,
    stock: data.stock,
    color_primario: data.color_primario || null,
    color_secundario: data.color_secundario || null,
    color_acento: data.color_acento || null,
    estilo_energia: data.estilo_energia || null,
    intensidad: data.intensidad,
    textura: data.textura || null,
    estilo_particulas: data.estilo_particulas || 'ninguno',
    desc_holistica: data.desc_holistica.trim() || null,
    tradicion: data.tradicion || null,
    orden: data.orden,
    activo: data.activo,
  }

  if (data.id) {
    const { data: updated, error } = await supabase
      .from('componentes')
      .update(payload)
      .eq('id', data.id)
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    revalidatePath('/administracion/arma-joya/componentes')
    return { id: updated.id }
  } else {
    const { data: created, error } = await supabase
      .from('componentes')
      .insert(payload)
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    revalidatePath('/administracion/arma-joya/componentes')
    return { id: created.id }
  }
}

// ── Eliminar ───────────────────────────────────────────────────────────────

export async function eliminarComponente(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('componentes').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/administracion/arma-joya/componentes')
}
