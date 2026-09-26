'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { fetchArmaJoyaData } from '@/app/actions/arma-joya-data'
import type { TipoJoya, TipoComponente, Componente } from '@/features/arma-joya/types'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type ModalData = {
  tipos: TipoJoya[]
  tiposComponente: TipoComponente[]
  componentes: Componente[]
}

type ModalCtx = {
  isOpen: boolean
  abrir: () => void
  cerrar: () => void
}

// ── Context ───────────────────────────────────────────────────────────────────

const ArmaJoyaModalContext = createContext<ModalCtx>({
  isOpen: false,
  abrir: () => {},
  cerrar: () => {},
})

export function useArmaJoyaModal() {
  return useContext(ArmaJoyaModalContext)
}

// ── Provider + Modal overlay ──────────────────────────────────────────────────

export function ArmaJoyaModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<ModalData | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const fetchedRef = useRef(false)

  useEffect(() => { setMounted(true) }, [])

  // Lock scroll cuando el modal está abierto
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = ''
      return
    }
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') cerrar()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  const abrir = useCallback(async () => {
    // Si ya tenemos datos, abre directo
    if (fetchedRef.current && data) {
      setIsOpen(true)
      return
    }
    setLoading(true)
    setIsOpen(true)
    try {
      const result = await fetchArmaJoyaData()
      setData(result)
      fetchedRef.current = true
    } finally {
      setLoading(false)
    }
  }, [data])

  const cerrar = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <ArmaJoyaModalContext.Provider value={{ isOpen, abrir, cerrar }}>
      {children}
      {mounted && isOpen && createPortal(
        <ModalOverlay loading={loading} data={data} onCerrar={cerrar} />,
        document.body
      )}
    </ArmaJoyaModalContext.Provider>
  )
}

// ── Overlay ───────────────────────────────────────────────────────────────────

function ModalOverlay({
  loading,
  data,
  onCerrar,
}: {
  loading: boolean
  data: ModalData | null
  onCerrar: () => void
}) {
  // Import dinámico para no cargar el configurador hasta que se necesite
  const [Configurador, setConfigurador] = useState<React.ComponentType<{
    tipos: TipoJoya[]
    tiposComponente: TipoComponente[]
    componentes: Componente[]
    onCerrar: () => void
  }> | null>(null)

  useEffect(() => {
    import('./ArmaJoyaConfiguradoreModal').then((mod) => {
      setConfigurador(() => mod.default)
    })
  }, [])

  return (
    <div
      className="fixed inset-0 z-[100]"
      style={{ background: '#0C0A08' }}
    >
      {/* Botón cerrar — siempre visible */}
      <button
        onClick={onCerrar}
        className="absolute top-4 right-4 z-[110] flex items-center gap-2 text-[11px] uppercase tracking-[.12em] transition-opacity opacity-40 hover:opacity-80"
        style={{ color: '#F5F0EB' }}
        aria-label="Cerrar"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Cerrar
      </button>

      {/* Loading */}
      {(loading || !Configurador) && (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(201,160,53,0.3)', borderTopColor: 'rgba(201,160,53,0.9)' }} />
          <p className="text-[12px] uppercase tracking-[.2em]" style={{ color: 'rgba(245,240,235,0.3)' }}>
            Cargando…
          </p>
        </div>
      )}

      {/* Configurador */}
      {!loading && data && Configurador && (
        <div className="h-full overflow-y-auto">
          <Configurador
            tipos={data.tipos}
            tiposComponente={data.tiposComponente}
            componentes={data.componentes}
            onCerrar={onCerrar}
          />
        </div>
      )}
    </div>
  )
}
