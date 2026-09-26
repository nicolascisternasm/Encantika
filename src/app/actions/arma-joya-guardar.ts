'use server'

import { createClient } from '@/lib/supabase/server'
import type { Componente, ConfiguradorSelecciones, TipoJoya } from '@/features/arma-joya/types'

type InputGuardar = {
  tipoJoya: TipoJoya
  selecciones: ConfiguradorSelecciones
  nombreReceptor: string
  esRegalo: boolean
  intencionTexto: string
  significadoIA: string
  tarjetaTexto: string
}

export async function guardarConfiguracion(input: InputGuardar): Promise<{ id: string }> {
  const supabase = await createClient()

  const componentes = Object.values(input.selecciones).filter(Boolean) as Componente[]
  const precioTotal = componentes.reduce((s, c) => s + c.precio, 0)

  // Snapshot JSON completo de la configuración
  const configJson = {
    tipoJoya: { id: input.tipoJoya.id, slug: input.tipoJoya.slug, nombre: input.tipoJoya.nombre },
    componentes: componentes.map((c) => ({
      id: c.id,
      sku: c.sku,
      nombre: c.nombre,
      precio: c.precio,
      tipo_componente_slug: c.tipo_componente_slug,
      color_primario: c.color_primario,
    })),
    nombreReceptor: input.nombreReceptor,
    esRegalo: input.esRegalo,
    intencionTexto: input.intencionTexto,
  }

  // 1. Insertar configuracion_joya
  const { data: config, error: errConfig } = await supabase
    .from('configuraciones_joya')
    .insert({
      tipo_joya_id: input.tipoJoya.id,
      nombre_receptor: input.nombreReceptor || null,
      es_regalo: input.esRegalo,
      intencion_texto: input.intencionTexto || null,
      significado_ia: input.significadoIA || null,
      tarjeta_texto: input.tarjetaTexto || null,
      precio_total: precioTotal,
      estado: 'pedido',
      config_json: configJson,
    })
    .select('id')
    .single()

  if (errConfig || !config) {
    throw new Error(errConfig?.message ?? 'Error al guardar la configuración')
  }

  // 2. Insertar configuracion_componentes
  if (componentes.length > 0) {
    const { error: errComps } = await supabase
      .from('configuracion_componentes')
      .insert(
        componentes.map((c) => ({
          configuracion_id: config.id,
          componente_id: c.id,
          cantidad: 1,
        }))
      )

    if (errComps) {
      throw new Error(errComps.message)
    }
  }

  return { id: config.id }
}
