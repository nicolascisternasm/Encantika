'use client'

import { useReducer, useState } from 'react'
import type { TipoJoya, TipoComponente, Componente, ConfiguradorState } from '@/features/arma-joya/types'
import { generarSignificadoIA } from '@/app/actions/arma-joya-ia'
import { guardarConfiguracion } from '@/app/actions/arma-joya-guardar'
import PasoTipoJoya from './PasoTipoJoya'
import ConfiguradorPasos from './ConfiguradorPasos'
import PasoPersonalizacion from './PasoPersonalizacion'
import PasoSignificado from './PasoSignificado'
import PasoConfirmacion from './PasoConfirmacion'

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
  const [cargandoIA, setCargandoIA] = useState(false)
  const [configuracionId, setConfiguracionId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  function seleccionarTipo(tipo: TipoJoya) {
    dispatch({ type: 'SELECCIONAR_TIPO', payload: tipo })
  }

  async function handlePersonalizacion(datos: {
    nombreReceptor: string
    esRegalo: boolean
    intencionTexto: string
  }) {
    if (!estado.tipoJoya) return
    setCargandoIA(true)

    dispatch({ type: 'SET_RECEPTOR', nombre: datos.nombreReceptor, esRegalo: datos.esRegalo })
    dispatch({ type: 'SET_INTENCION', texto: datos.intencionTexto })

    try {
      const compsList = Object.values(estado.selecciones).filter(Boolean) as Componente[]
      const resultado = await generarSignificadoIA({
        tipoJoya: estado.tipoJoya.nombre,
        componentes: compsList,
        nombreReceptor: datos.nombreReceptor,
        esRegalo: datos.esRegalo,
        intencionTexto: datos.intencionTexto,
      })
      dispatch({ type: 'SET_SIGNIFICADO_IA', texto: resultado.significadoIA })
      dispatch({ type: 'SET_TARJETA', texto: resultado.tarjetaTexto })
      dispatch({ type: 'IR_PASO', paso: 3 })
    } catch {
      // Fallback: avanzar sin IA
      dispatch({ type: 'IR_PASO', paso: 3 })
    } finally {
      setCargandoIA(false)
    }
  }

  // ── Paso 0: selección de tipo de joya ─────────────────────────────────────

  if (estado.paso === 0) {
    return (
      <PasoTipoJoya
        tipos={tipos}
        onSeleccionar={seleccionarTipo}
      />
    )
  }

  // ── Paso 1: configurador de componentes ───────────────────────────────────

  if (estado.paso === 1 && estado.tipoJoya) {
    const tiposParaEsteJoya = tiposComponente.filter((t) =>
      t.tipos_joya_aplicables.includes(estado.tipoJoya!.slug)
    )
    const componentesParaEsteJoya = componentes.filter((c) =>
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

  // ── Paso 2: personalización + llamada IA ──────────────────────────────────

  if (estado.paso === 2 && estado.tipoJoya) {
    return (
      <PasoPersonalizacion
        tipoJoya={estado.tipoJoya}
        selecciones={estado.selecciones}
        onVolver={() => dispatch({ type: 'IR_PASO', paso: 1 })}
        onContinuar={handlePersonalizacion}
        cargando={cargandoIA}
      />
    )
  }

  // ── Paso 3: significado generado por IA ───────────────────────────────────

  if (estado.paso === 3 && estado.tipoJoya) {
    async function handleGuardar() {
      if (!estado.tipoJoya || guardando) return
      setGuardando(true)
      try {
        const { id } = await guardarConfiguracion({
          tipoJoya: estado.tipoJoya,
          selecciones: estado.selecciones,
          nombreReceptor: estado.nombreReceptor,
          esRegalo: estado.esRegalo,
          intencionTexto: estado.intencionTexto,
          significadoIA: estado.significadoIA,
          tarjetaTexto: estado.tarjetaTexto,
        })
        setConfiguracionId(id)
        dispatch({ type: 'IR_PASO', paso: 4 })
      } catch {
        // Avanzar igual si falla el guardado
        dispatch({ type: 'IR_PASO', paso: 4 })
      } finally {
        setGuardando(false)
      }
    }

    return (
      <PasoSignificado
        tipoJoya={estado.tipoJoya}
        selecciones={estado.selecciones}
        significadoIA={estado.significadoIA}
        tarjetaTexto={estado.tarjetaTexto}
        nombreReceptor={estado.nombreReceptor}
        esRegalo={estado.esRegalo}
        guardando={guardando}
        onVolver={() => dispatch({ type: 'IR_PASO', paso: 2 })}
        onContinuar={handleGuardar}
      />
    )
  }

  // ── Paso 4: confirmación ──────────────────────────────────────────────────

  if (estado.paso === 4 && estado.tipoJoya && configuracionId) {
    return (
      <PasoConfirmacion
        tipoJoya={estado.tipoJoya}
        selecciones={estado.selecciones}
        configuracionId={configuracionId}
        nombreReceptor={estado.nombreReceptor}
        esRegalo={estado.esRegalo}
        tarjetaTexto={estado.tarjetaTexto}
        onNuevaJoya={() => {
          setConfiguracionId(null)
          dispatch({ type: 'REINICIAR' })
        }}
      />
    )
  }

  // Fallback (no debería llegar acá)
  return null
}
