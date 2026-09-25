'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

// ── Enviar consulta de contacto ───────────────────────────────────────────────

const consultaSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  telefono: z.string().optional(),
  asunto: z.string().optional(),
  mensaje: z.string().min(20, 'El mensaje debe tener al menos 20 caracteres'),
})

export type ConsultaFormState = {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function enviarConsulta(
  _prev: ConsultaFormState,
  formData: FormData,
): Promise<ConsultaFormState> {
  const raw = {
    nombre: formData.get('nombre')?.toString().trim() ?? '',
    email: formData.get('email')?.toString().trim() ?? '',
    telefono: formData.get('telefono')?.toString().trim() || undefined,
    asunto: formData.get('asunto')?.toString().trim() || undefined,
    mensaje: formData.get('mensaje')?.toString().trim() ?? '',
  }

  const result = consultaSchema.safeParse(raw)
  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('consultas_contacto').insert({
    nombre: result.data.nombre,
    email: result.data.email,
    telefono: result.data.telefono ?? null,
    asunto: result.data.asunto ?? null,
    mensaje: result.data.mensaje,
  })

  if (error) {
    return { error: 'No se pudo enviar el mensaje. Inténtalo nuevamente.' }
  }

  return { success: true }
}

// ── Marcar consulta como leída (admin) ────────────────────────────────────────

export async function marcarConsultaLeida(
  id: string,
  leido: boolean,
): Promise<{ error?: string }> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('consultas_contacto')
    .update({ leido })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/administracion/consultas')
  return {}
}
