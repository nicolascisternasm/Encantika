'use client'

import { useReducer } from 'react'
import type { TipoJoya, TipoComponente, Componente, ConfiguradorState } from '@/features/arma-joya/types'
import PasoTipoJoya from './PasoTipoJoya'
import ConfiguradorPasos from './ConfiguradorPasos'

// ── Estado global del configurador ────────────────────────────────────────────

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
  | { type: 'SET_RECEPTOR'; nombre: string; esRegalo: boolean }
  | { type: 'SET_INTENCION'; texto: string }
  | { type: 'SET_SIGNIFICADO_IA'; texto: string }
  | { type: 'SET_TARJETA'; texto: string }
  | { type: 'REINICIAR' }

function reducer(state: ConfiguradorState, accion: Accion): ConfiguradorState {
  switch (accion.type) {
    case 'SELECCIONAR_TIPO':
      return { ...estadoInicial, paso: 1, tipoJoya: accion.payload }
    case 'SELECCIONAR_COMPONENTE':
      return {
        ...state,
        selecciones: { ...state.selecciones, [accion.tipoSlug]: accion.componente },
      }
    case 'DESELECCIONAR_COMPONENTE': {
      const { [accion.tipoSlug]: _, ...resto } = state.selecciones
      return { ...state, selecciones: resto }
    }
    case 'IR_PASO':
      return { ...state, paso: accion.paso }
    case 'SET_RECEPTOR':
      return { ...state, nombreReceptor: accion.nombre, esRegalo: accion.esRegalo }
    case 'SET_INTENCION':
      return { ...state, intencionTexto: accion.texto }
    case 'SET_SIGNIFICADO_IA':
      return { ...state, significadoIA: accion.texto }
    case 'SET_TARJETA':
      return { ...state, tarjetaTexto: accion.texto }
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
}

// ── Configurador ──────────────────────────────────────────────────────────────

export default function ArmaJoyaConfigurador({ tipos, tiposComponente = [], componentes = [] }: Props) {
  const [estado, dispatch] = useReducer(reducer, estadoInicial)

  function seleccionarTipo(tipo: TipoJoya) {
    dispatch({ type: 'SELECCIONAR_TIPO', payload: tipo })
  }

  // Paso 0: selección de tipo de joya
  if (estado.paso === 0) {
    return (
      <PasoTipoJoya
        tipos={tipos}
        onSeleccionar={seleccionarTipo}
      />
    )
  }

  // Paso 1: configurador de componentes
  if (estado.paso === 1 && estado.tipoJoya) {
    const tiposParaEsteJoya = (tiposComponente ?? []).filter((t) =>
      t.tipos_joya_aplicables.includes(estado.tipoJoya!.slug)
    )
    const componentesParaEsteJoya = (componentes ?? []).filter((c) =>
      tiposParaEsteJoya.some((t) => t.id === c.tipo_componente_id)
    )
    return (
      <ConfiguradorPasos
        tipoJoya={estado.tipoJoya}
        tiposComponente={tiposParaEsteJoya}
        componentes={componentesParaEsteJoya}
        selecciones={estado.selecciones}
        onSeleccionar={(tipoSlug, comp) =>
          dispatch({ type: 'SELECCIONAR_COMPONENTE', tipoSlug, componente: comp })
        }
        onDeseleccionar={(tipoSlug) =>
          dispatch({ type: 'DESELECCIONAR_COMPONENTE', tipoSlug })
        }
        onVolver={() => dispatch({ type: 'REINICIAR' })}
        onFinalizar={() => dispatch({ type: 'IR_PASO', paso: 2 })}
      />
    )
  }

  // Pasos 2+: personalización y resumen (Etapas 5+)
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0C0A08' }}>
      <div className="text-center space-y-4">
        <p className="text-white/40 text-sm">
          Personalización para <strong className="text-gold">{estado.tipoJoya?.nombre}</strong>
        </p>
        <button
          onClick={() => dispatch({ type: 'IR_PASO', paso: 1 })}
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          ← Volver al configurador
        </button>
      </div>
    </div>
  )
}
