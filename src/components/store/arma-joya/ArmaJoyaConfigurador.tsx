'use client'

import { useReducer } from 'react'
import type { TipoJoya, TipoComponente, Componente, ConfiguradorState } from '@/features/arma-joya/types'
import PasoTipoJoya from './PasoTipoJoya'

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

export default function ArmaJoyaConfigurador({ tipos }: Props) {
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

  // Pasos 1+: configurador (Etapas 3+)
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0C0A08' }}>
      <p className="text-white/40 text-sm">
        Configurador para <strong className="text-gold">{estado.tipoJoya?.nombre}</strong> — próximamente en Etapa 3
      </p>
    </div>
  )
}
