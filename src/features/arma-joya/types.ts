export type TipoJoya = {
  id: string
  slug: string
  nombre: string
  icono_svg: string | null
  descripcion: string | null
}

export type TipoComponente = {
  id: string
  slug: string
  nombre: string
  orden_configurador: number
  es_obligatorio: boolean
  tipos_joya_aplicables: string[]
}

export type Componente = {
  id: string
  sku: string
  nombre: string
  descripcion: string | null
  tipo_componente_id: string
  tipo_componente_slug: string
  material: string | null
  color: string | null
  precio: number
  stock: number
  url_imagen: string | null
  url_imagen_capa: string | null
  color_primario: string | null
  color_secundario: string | null
  color_acento: string | null
  estilo_energia: string | null
  intensidad: number | null
  textura: string | null
  estilo_particulas: string | null
  desc_holistica: string | null
  tradicion: string | null
  orden: number
}

export type ConfiguradorSelecciones = Partial<Record<string, Componente>>

export type ConfiguradorState = {
  paso: number
  tipoJoya: TipoJoya | null
  selecciones: ConfiguradorSelecciones
  nombreReceptor: string
  esRegalo: boolean
  intencionTexto: string
  significadoIA: string
  tarjetaTexto: string
}
