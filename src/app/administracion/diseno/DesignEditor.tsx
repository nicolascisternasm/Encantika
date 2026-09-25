'use client'

import { useState, useTransition } from 'react'
import { TEMAS, FUENTES, type TemaKey, type FuenteKey } from '@/lib/temas'
import { guardarDiseno } from './actions'
import SeccionesEditor from './SeccionesEditor'

// Google Fonts @import para las fuentes de script (no cormorant, ya cargada en la tienda)
const FONT_IMPORTS = Object.entries(FUENTES)
  .filter(([, f]) => f.googleFont !== null)
  .map(([, f]) => `@import url('https://fonts.googleapis.com/css2?family=${f.googleFont}&display=swap');`)
  .join('\n')

type Tab = 'tema-fuente' | 'secciones' | 'preview'

interface SeccionImagenState {
  imagenId: string | null
  posicion: string
  imagenUrl: string | null
}

interface DesignEditorProps {
  currentTema: string
  currentFuente: string
  hero: SeccionImagenState
  bannerJoya: SeccionImagenState
  historia: SeccionImagenState
}

export default function DesignEditor({ currentTema, currentFuente, hero, bannerJoya, historia }: DesignEditorProps) {
  const [activeTab, setActiveTab] = useState<Tab>('tema-fuente')
  const [tema, setTema] = useState<TemaKey>((currentTema as TemaKey) || 'dorado_clasico')
  const [fuente, setFuente] = useState<FuenteKey>((currentFuente as FuenteKey) || 'cormorant')
  const [isPending, startTransition] = useTransition()
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  function handleSave() {
    setMensaje(null)
    startTransition(async () => {
      const result = await guardarDiseno(tema, fuente)
      if (result.success) setMensaje({ tipo: 'ok', texto: result.success })
      else if (result.error) setMensaje({ tipo: 'error', texto: result.error })
    })
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'tema-fuente', label: 'Tema y fuente' },
    { key: 'secciones',   label: 'Secciones home' },
    { key: 'preview',     label: 'Vista previa' },
  ]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONT_IMPORTS }} />

      {/* Pestañas */}
      <div className="flex border-b border-stone-200 mb-8">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-3 text-sm transition-colors -mb-px border-b-2 ${
              activeTab === t.key
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido por pestaña */}
      {activeTab === 'tema-fuente' && (
        <>
          <section className="mb-12">
            <h2 className="text-xs uppercase tracking-[.15em] text-stone-400 mb-6">Paleta de colores</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {(Object.keys(TEMAS) as TemaKey[]).map((key) => {
                const t = TEMAS[key]
                const selected = tema === key
                return (
                  <button key={key} onClick={() => setTema(key)} className="text-left focus:outline-none group">
                    <div
                      style={{
                        border: selected ? `2px solid ${t.vars['--color-acento']}` : '2px solid transparent',
                        outline: selected ? `3px solid ${t.vars['--color-acento']}40` : '3px solid transparent',
                        borderRadius: 6,
                        overflow: 'hidden',
                        transition: 'all 0.15s',
                      }}
                    >
                      <MiniTemaPreview temaKey={key} />
                    </div>
                    <p className={`mt-2 text-xs text-center transition-colors ${selected ? 'text-stone-900 font-medium' : 'text-stone-500 group-hover:text-stone-700'}`}>
                      {t.nombre}
                    </p>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xs uppercase tracking-[.15em] text-stone-400 mb-6">Fuente de títulos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.keys(FUENTES) as FuenteKey[]).map((key) => {
                const f = FUENTES[key]
                const selected = fuente === key
                return (
                  <button
                    key={key}
                    onClick={() => setFuente(key)}
                    className={`text-left px-4 py-5 rounded border-2 transition-all duration-150 focus:outline-none ${
                      selected ? 'border-stone-800 bg-stone-50' : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <p style={{ fontFamily: f.css, fontSize: 28, lineHeight: 1.3 }} className="text-stone-800">
                      Brilla con magia
                    </p>
                    <p className="mt-2 text-xs text-stone-400">{f.nombre}</p>
                  </button>
                )
              })}
            </div>
          </section>

          <div className="flex items-center gap-4 pb-12">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="bg-stone-900 text-white text-sm tracking-wide px-8 py-3 hover:bg-stone-700 transition-colors disabled:opacity-50"
            >
              {isPending ? 'Guardando…' : 'Guardar diseño'}
            </button>
            {mensaje && (
              <p className={`text-sm ${mensaje.tipo === 'ok' ? 'text-stone-500' : 'text-red-600'}`}>
                {mensaje.texto}
              </p>
            )}
          </div>
        </>
      )}

      {activeTab === 'secciones' && (
        <SeccionesEditor hero={hero} bannerJoya={bannerJoya} historia={historia} />
      )}

      {activeTab === 'preview' && (
        <section className="mb-10">
          <LivePreview temaKey={tema} fuenteKey={fuente} />
        </section>
      )}
    </>
  )
}

// ─── Mini preview para las tarjetas de paleta ────────────────────────────────

function MiniTemaPreview({ temaKey }: { temaKey: TemaKey }) {
  const t = TEMAS[temaKey]
  return (
    <div style={{ backgroundColor: t.vars['--color-fondo'], height: 96 }}>
      <div style={{ backgroundColor: '#fff', borderBottom: `1px solid ${t.vars['--color-borde']}`, height: 18, display: 'flex', alignItems: 'center', paddingLeft: 8, paddingRight: 8, gap: 4 }}>
        <div style={{ width: 22, height: 3, backgroundColor: t.vars['--color-texto'], opacity: 0.8, borderRadius: 1 }} />
        <div style={{ flex: 1 }} />
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 12, height: 3, backgroundColor: t.vars['--color-texto-suave'], opacity: 0.4, borderRadius: 1 }} />
        ))}
      </div>
      <div style={{ padding: '8px 8px 6px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ height: 7, width: '65%', backgroundColor: t.vars['--color-texto'], opacity: 0.75, borderRadius: 1 }} />
        <div style={{ height: 4, width: '40%', backgroundColor: t.vars['--color-acento'], opacity: 0.7, borderRadius: 1 }} />
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ flex: 1, height: 28, backgroundColor: t.vars['--color-tarjeta'], borderRadius: 2 }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Vista previa en tiempo real ─────────────────────────────────────────────

function LivePreview({ temaKey, fuenteKey }: { temaKey: TemaKey; fuenteKey: FuenteKey }) {
  const t = TEMAS[temaKey]
  const f = FUENTES[fuenteKey]

  return (
    <div style={{ backgroundColor: t.vars['--color-fondo'], border: `1px solid ${t.vars['--color-borde']}`, borderRadius: 8, overflow: 'hidden', maxWidth: 680 }}>
      <div style={{ backgroundColor: '#fff', borderBottom: `1px solid ${t.vars['--color-borde']}`, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: f.css, fontSize: 20, color: t.vars['--color-texto'] }}>Encantika</span>
        <div style={{ display: 'flex', gap: 16 }}>
          {['Catálogo', 'Colecciones', 'Arma tu joya'].map((label) => (
            <span key={label} style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.vars['--color-texto-suave'] }}>{label}</span>
          ))}
        </div>
      </div>
      <div style={{ backgroundColor: t.vars['--color-tarjeta'], padding: '36px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.vars['--color-texto-suave'] }}>Nueva colección</span>
        <h1 style={{ fontFamily: f.css, fontSize: 44, fontWeight: 400, color: t.vars['--color-texto'], lineHeight: 1.1, letterSpacing: '0.04em', margin: 0 }}>
          Brilla con magia
        </h1>
        <p style={{ fontSize: 13, color: t.vars['--color-texto-suave'], marginTop: 4 }}>Joyería hecha con amor para momentos únicos</p>
        <div style={{ marginTop: 8, display: 'inline-block', border: `1px solid ${t.vars['--color-texto']}`, padding: '8px 20px', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: t.vars['--color-texto'], width: 'fit-content' }}>
          Ver colección
        </div>
      </div>
      <div style={{ padding: '20px 20px 16px', display: 'flex', gap: 10 }}>
        {['Collar Luna', 'Anillo Sol', 'Aros Estrella', 'Pulsera Mar'].map((nombre) => (
          <div key={nombre} style={{ flex: 1 }}>
            <div style={{ backgroundColor: t.vars['--color-tarjeta'], height: 80, borderRadius: 3, marginBottom: 8 }} />
            <p style={{ fontFamily: f.css, fontSize: 14, color: t.vars['--color-texto'], margin: 0 }}>{nombre}</p>
            <p style={{ fontSize: 11, color: t.vars['--color-acento'], marginTop: 3 }}>$29.990</p>
          </div>
        ))}
      </div>
    </div>
  )
}
