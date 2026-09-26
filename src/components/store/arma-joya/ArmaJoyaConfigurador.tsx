'use client'

import { useReducer, useState } from 'react'
import type { TipoJoya, TipoComponente, Componente, ConfiguradorState } from '@/features/arma-joya/types'
import type { ConfigArmaJoya } from '@/app/actions/arma-joya-configuracion'
import { describirDisenoIA } from '@/app/actions/arma-joya-ia'
import { guardarConfiguracion } from '@/app/actions/arma-joya-guardar'
import PasoTipoJoya from './PasoTipoJoya'
import ConfiguradorBuilder from './ConfiguradorBuilder'
import PasoResultado from './PasoResultado'

// ── Estado ────────────────────────────────────────────────────────────────────

const estadoInicial: ConfiguradorState = {
  paso: 0,
  tipoJoya: null,
  selecciones: {},
  nombreReceptor: '',
  esRegalo: false,
  intencionTexto: '',
  significadoIA: '',
  tarjetaTexto: '',
}

type Accion =
  | { type: 'SELECCIONAR_TIPO'; payload: TipoJoya }
  | { type: 'SELECCIONAR_COMPONENTE'; tipoSlug: string; componente: Componente }
  | { type: 'DESELECCIONAR_COMPONENTE'; tipoSlug: string }
  | { type: 'IR_PASO'; paso: number }
  | { type: 'SET_DESCRIPCION_IA'; texto: string }
  | { type: 'REINICIAR' }

function reducer(state: ConfiguradorState, accion: Accion): ConfiguradorState {
  switch (accion.type) {
    case 'SELECCIONAR_TIPO':
      return { ...estadoInicial, paso: 1, tipoJoya: accion.payload }
    case 'SELECCIONAR_COMPONENTE':
      return { ...state, selecciones: { ...state.selecciones, [accion.tipoSlug]: accion.componente } }
    case 'DESELECCIONAR_COMPONENTE': {
      const { [accion.tipoSlug]: _, ...resto } = state.selecciones
      return { ...state, selecciones: resto }
    }
    case 'IR_PASO':
      return { ...state, paso: accion.paso }
    case 'SET_DESCRIPCION_IA':
      return { ...state, significadoIA: accion.texto }
    case 'REINICIAR':
      return estadoInicial
    default:
      return state
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────

type Props = {
  tipos: TipoJoya[]
  tiposComponente?: TipoComponente[]
  componentes?: Componente[]
  config?: ConfigArmaJoya
  onCerrar?: () => void
}

const CONFIG_DEFAULT: ConfigArmaJoya = { mostrar_precio: true, mostrar_descripcion: false }

// ── Configurador ──────────────────────────────────────────────────────────────

export default function ArmaJoyaConfigurador({
  tipos,
  tiposComponente = [],
  componentes = [],
  config = CONFIG_DEFAULT,
  onCerrar,
}: Props) {
  const [estado, dispatch] = useReducer(reducer, estadoInicial)
  const [cargandoIA, setCargandoIA] = useState(false)
  const [configuracionId, setConfiguracionId] = useState<string | null>(null)

  // ── Paso 0: elegir tipo de joya ───────────────────────────────────────────

  if (estado.paso === 0) {
    return (
      <PasoTipoJoya
        tipos={tipos}
        onSeleccionar={(tipo) => dispatch({ type: 'SELECCIONAR_TIPO', payload: tipo })}
      />
    )
  }

  // ── Paso 1: builder (selección libre de componentes) ──────────────────────

  if (estado.paso === 1 && estado.tipoJoya) {
    const tiposParaEsteJoya = tiposComponente.filter((t) =>
      t.tipos_joya_aplicables.includes(estado.tipoJoya!.slug)
    )
    const componentesParaEsteJoya = componentes.filter((c) =>
      tiposParaEsteJoya.some((t) => t.id === c.tipo_componente_id)
    )

    async function handleAprobar() {
      if (!estado.tipoJoya) return
      setCargandoIA(true)
      dispatch({ type: 'IR_PASO', paso: 2 })

      try {
        const compsList = Object.values(estado.selecciones).filter(Boolean) as Componente[]

        // Guardar en BD y llamar IA en paralelo
        const [{ id }, descripcion] = await Promise.all([
          guardarConfiguracion({
            tipoJoya: estado.tipoJoya!,
            selecciones: estado.selecciones,
            nombreReceptor: '',
            esRegalo: false,
            intencionTexto: '',
            significadoIA: '',
            tarjetaTexto: '',
          }).catch(() => ({ id: crypto.randomUUID() })),
          describirDisenoIA({ tipoJoya: estado.tipoJoya!.nombre, componentes: compsList })
            .catch(() => ''),
        ])

        setConfiguracionId(id)
        dispatch({ type: 'SET_DESCRIPCION_IA', texto: descripcion })
      } finally {
        setCargandoIA(false)
      }
    }

    return (
      <ConfiguradorBuilder
        tipoJoya={estado.tipoJoya}
        tiposComponente={tiposParaEsteJoya}
        componentes={componentesParaEsteJoya}
        selecciones={estado.selecciones}
        config={config}
        onSeleccionar={(tipoSlug, comp) =>
          dispatch({ type: 'SELECCIONAR_COMPONENTE', tipoSlug, componente: comp })
        }
        onDeseleccionar={(tipoSlug) =>
          dispatch({ type: 'DESELECCIONAR_COMPONENTE', tipoSlug })
        }
        onVolver={() => dispatch({ type: 'REINICIAR' })}
        onAprobar={handleAprobar}
      />
    )
  }

  // ── Paso 2: resultado (IA + foto + precio + carrito) ──────────────────────

  if (estado.paso === 2 && estado.tipoJoya) {
    return (
      <PasoResultado
        tipoJoya={estado.tipoJoya}
        selecciones={estado.selecciones}
        descripcionIA={estado.significadoIA}
        cargandoIA={cargandoIA}
        configuracionId={configuracionId}
        onNuevaJoya={() => {
          setConfiguracionId(null)
          dispatch({ type: 'REINICIAR' })
        }}
        onCerrar={onCerrar}
      />
    )
  }

  return null
}
