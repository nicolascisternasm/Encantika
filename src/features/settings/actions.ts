'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

const settingsSchema = z.object({
  nombre_tienda: z.string().min(1, 'El nombre de la tienda es requerido').max(100),
  email_contacto: z.string().email('Correo inválido').nullable().optional(),
  moneda: z.enum(['CLP', 'USD']),
  numero_whatsapp: z
    .string()
    .regex(/^\d{8,15}$/, 'Formato inválido (ej: 56912345678)')
    .nullable()
    .optional(),
  url_instagram: z.string().url('URL inválida').nullable().optional(),
  url_mercadolibre: z.string().url('URL inválida').nullable().optional(),
  direccion_retiro: z.string().nullable().optional(),
  instrucciones_retiro: z.string().nullable().optional(),
  seo_titulo: z.string().max(70, 'Máximo 70 caracteres').nullable().optional(),
  seo_descripcion: z.string().max(160, 'Máximo 160 caracteres').nullable().optional(),
  historia: z.string().nullable().optional(),
  mostrar_historia: z.boolean().optional(),
})

export type SettingsFormState = {
  error?: string
  fieldErrors?: Record<string, string[]>
  success?: boolean
}

function emptyToNull(val: FormDataEntryValue | null): string | null {
  if (!val || String(val).trim() === '') return null
  return String(val).trim()
}

export async function saveSettings(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const raw = {
    nombre_tienda: formData.get('nombre_tienda'),
    email_contacto: emptyToNull(formData.get('email_contacto')),
    moneda: formData.get('moneda') ?? 'CLP',
    numero_whatsapp: emptyToNull(formData.get('numero_whatsapp')),
    url_instagram: emptyToNull(formData.get('url_instagram')),
    url_mercadolibre: emptyToNull(formData.get('url_mercadolibre')),
    direccion_retiro: emptyToNull(formData.get('direccion_retiro')),
    instrucciones_retiro: emptyToNull(formData.get('instrucciones_retiro')),
    seo_titulo: emptyToNull(formData.get('seo_titulo')),
    seo_descripcion: emptyToNull(formData.get('seo_descripcion')),
    historia: emptyToNull(formData.get('historia')),
    mostrar_historia: formData.get('mostrar_historia') === 'true',
  }

  const result = settingsSchema.safeParse(raw)
  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('configuracion_tienda')
    .upsert({ id: 1, ...result.data }, { onConflict: 'id' })

  if (error) return { error: error.message }

  revalidatePath('/administracion/configuracion')
  return { success: true }
}
