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

// ── Guardar páginas institucionales ──────────────────────────────────────────

export type PaginasFormState = { success?: boolean; error?: string }

export async function savePaginas(
  formData: FormData,
): Promise<PaginasFormState> {
  function en(key: string) {
    const v = formData.get(key)?.toString().trim() ?? ''
    return v === '' ? null : v
  }

  const data = {
    nosotros_titulo: en('nosotros_titulo'),
    nosotros_subtitulo: en('nosotros_subtitulo'),
    nosotros_historia: en('nosotros_historia'),
    nosotros_vision: en('nosotros_vision'),
    nosotros_seccion1_titulo: en('nosotros_seccion1_titulo'),
    nosotros_seccion1_texto: en('nosotros_seccion1_texto'),
    nosotros_seccion1_imagen_id: en('nosotros_seccion1_imagen_id'),
    nosotros_seccion2_titulo: en('nosotros_seccion2_titulo'),
    nosotros_seccion2_texto: en('nosotros_seccion2_texto'),
    nosotros_seccion2_imagen_id: en('nosotros_seccion2_imagen_id'),
    nosotros_seccion3_titulo: en('nosotros_seccion3_titulo'),
    nosotros_seccion3_texto: en('nosotros_seccion3_texto'),
    nosotros_seccion3_imagen_id: en('nosotros_seccion3_imagen_id'),
    footer_horario: en('footer_horario'),
    footer_direccion: en('footer_direccion'),
    footer_telefono: en('footer_telefono'),
    contacto_titulo: en('contacto_titulo'),
    contacto_subtitulo: en('contacto_subtitulo'),
    contacto_email: en('contacto_email'),
    contacto_maps_url: en('contacto_maps_url'),
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('configuracion_tienda')
    .update(data as any)
    .eq('id', 1)

  if (error) return { error: error.message }

  revalidatePath('/(store)/nosotros', 'page')
  revalidatePath('/(store)/contacto', 'page')
  revalidatePath('/administracion/configuracion')
  return { success: true }
}
