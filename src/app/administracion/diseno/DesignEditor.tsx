'use client'

import { useState, useTransition } from 'react'
import { TEMAS, FUENTES, type TemaKey, type FuenteKey, type TemaVars } from '@/lib/temas'
import { LAYOUTS, type LayoutKey } from '@/lib/layouts'
import { guardarDiseno } from './actions'
import SeccionesEditor from './SeccionesEditor'

// Google Fonts @import para las fuentes de script
const FONT_IMPORTS = Object.entries(FUENTES)
  .filter(([, f]) => f.googleFont !== null)
  .map(([, f]) => `@import url('https://fonts.googleapis.com/css2?family=${f.googleFont}&display=swap');`)
  .join('\n')

type Tab = 'tema-fuente' | 'layout' | 'secciones' | 'preview'

interface SeccionImagenState {
  imagenId: string | null
  posicion: string
  imagenUrl: string | null
}

interface DesignEditorProps {
  currentTema: string
  currentFuente: string
  currentLayout: string
  hero: SeccionImagenState
  bannerJoya: SeccionImagenState
  historia: SeccionImagenState
}

export default function DesignEditor({ currentTema, currentFuente, currentLayout, hero, bannerJoya, historia }: DesignEditorProps) {
  const [activeTab, setActiveTab] = useState<Tab>('tema-fuente')
  const [tema, setTema] = useState<TemaKey>((currentTema as TemaKey) || 'dorado_clasico')
  const [fuente, setFuente] = useState<FuenteKey>((currentFuente as FuenteKey) || 'cormorant')
  const [layout, setLayout] = useState<LayoutKey>((currentLayout as LayoutKey) || 'clasico')
  const [isPending, startTransition] = useTransition()
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  function handleSave() {
    setMensaje(null)
    startTransition(async () => {
      const result = await guardarDiseno(tema, fuente, layout)
      if (result.success) setMensaje({ tipo: 'ok', texto: result.success })
      else if (result.error) setMensaje({ tipo: 'error', texto: result.error })
    })
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'tema-fuente', label: 'Tema y fuente' },
    { key: 'layout',      label: 'Layout' },
    { key: 'secciones',   label: 'Secciones home' },
    { key: 'preview',     label: 'Vista previa' },
  ]

  const saveButton = (
    <div className="flex items-center gap-4 pb-12">
      <button onClick={handleSave} disabled={isPending}
        className="bg-stone-900 text-white text-sm tracking-wide px-8 py-3 hover:bg-stone-700 transition-colors disabled:opacity-50">
        {isPending ? 'Guardando…' : 'Guardar diseño'}
      </button>
      {mensaje && (
        <p className={`text-sm ${mensaje.tipo === 'ok' ? 'text-stone-500' : 'text-red-600'}`}>
          {mensaje.texto}
        </p>
      )}
    </div>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONT_IMPORTS }} />

      {/* Pestañas */}
      <div className="flex border-b border-stone-200 mb-8">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-5 py-3 text-sm transition-colors -mb-px border-b-2 ${
              activeTab === t.key
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Pestaña: Tema y fuente ───────────────────────────────────────────── */}
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
                    <div style={{
                      border: selected ? `2px solid ${t.vars['--color-acento']}` : '2px solid transparent',
                      outline: selected ? `3px solid ${t.vars['--color-acento']}40` : '3px solid transparent',
                      borderRadius: 6, overflow: 'hidden', transition: 'all 0.15s',
                    }}>
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
                  <button key={key} onClick={() => setFuente(key)}
                    className={`text-left px-4 py-5 rounded border-2 transition-all duration-150 focus:outline-none ${
                      selected ? 'border-stone-800 bg-stone-50' : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}>
                    <p style={{ fontFamily: f.css, fontSize: 28, lineHeight: 1.3 }} className="text-stone-800">
                      Brilla con magia
                    </p>
                    <p className="mt-2 text-xs text-stone-400">{f.nombre}</p>
                  </button>
                )
              })}
            </div>
          </section>

          {saveButton}
        </>
      )}

      {/* ── Pestaña: Layout ──────────────────────────────────────────────────── */}
      {activeTab === 'layout' && (
        <>
          <section className="mb-12">
            <h2 className="text-xs uppercase tracking-[.15em] text-stone-400 mb-2">Estructura de la tienda</h2>
            <p className="text-sm text-stone-500 mb-6">
              Elige cómo se organiza el menú, el hero y la grilla de productos.
            </p>

            {/* Primera fila: 3 layouts */}
            <div className="grid grid-cols-3 gap-4 mb-4 max-w-3xl">
              {(Object.keys(LAYOUTS) as LayoutKey[]).slice(0, 3).map((key) => (
                <LayoutCard
                  key={key}
                  layoutKey={key}
                  temaVars={TEMAS[tema].vars}
                  selected={layout === key}
                  onSelect={() => setLayout(key)}
                />
              ))}
            </div>
            {/* Segunda fila: 2 layouts centrados */}
            <div className="flex gap-4 max-w-3xl">
              <div className="flex-1" />
              {(Object.keys(LAYOUTS) as LayoutKey[]).slice(3).map((key) => (
                <div key={key} className="flex-[2] max-w-[calc(33.333%-8px)]">
                  <LayoutCard
                    layoutKey={key}
                    temaVars={TEMAS[tema].vars}
                    selected={layout === key}
                    onSelect={() => setLayout(key)}
                  />
                </div>
              ))}
              <div className="flex-1" />
            </div>
          </section>

          {saveButton}
        </>
      )}

      {/* ── Pestaña: Secciones ───────────────────────────────────────────────── */}
      {activeTab === 'secciones' && (
        <SeccionesEditor hero={hero} bannerJoya={bannerJoya} historia={historia} />
      )}

      {/* ── Pestaña: Vista previa ────────────────────────────────────────────── */}
      {activeTab === 'preview' && (
        <section className="mb-10">
          <LivePreview temaKey={tema} fuenteKey={fuente} layoutKey={layout} />
        </section>
      )}
    </>
  )
}

// ─── Tarjeta de layout con SVG preview ───────────────────────────────────────

function LayoutCard({
  layoutKey,
  temaVars,
  selected,
  onSelect,
}: {
  layoutKey: LayoutKey
  temaVars: TemaVars
  selected: boolean
  onSelect: () => void
}) {
  const l = LAYOUTS[layoutKey]
  const acento = temaVars['--color-acento']

  return (
    <button
      onClick={onSelect}
      className="text-left w-full focus:outline-none group"
    >
      <div style={{
        border: selected ? `2px solid ${acento}` : '2px solid transparent',
        outline: selected ? `3px solid ${acento}40` : '3px solid transparent',
        borderRadius: 8,
        overflow: 'hidden',
        transition: 'all 0.15s',
        background: temaVars['--color-fondo'],
      }}>
        <LayoutSVGPreview layoutKey={layoutKey} vars={temaVars} />
      </div>
      <div className="mt-2 px-0.5">
        <div className="flex items-center gap-2">
          <p className={`text-sm transition-colors ${selected ? 'text-stone-900 font-medium' : 'text-stone-700 group-hover:text-stone-900'}`}
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 15 }}>
            {l.nombre}
          </p>
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: acento + '20', color: acento, fontWeight: 500 }}>
            {l.badge}
          </span>
        </div>
        <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">{l.descripcion}</p>
      </div>
    </button>
  )
}

// ─── SVG miniatura por layout ─────────────────────────────────────────────────

function LayoutSVGPreview({ layoutKey, vars }: { layoutKey: LayoutKey; vars: TemaVars }) {
  const { '--color-fondo': fondo, '--color-texto': texto, '--color-acento': acento,
    '--color-tarjeta': tarjeta, '--color-borde': borde } = vars
  const bg = fondo

  switch (layoutKey) {
    case 'clasico':
      return (
        <svg viewBox="0 0 160 100" style={{ width: '100%', height: 100, display: 'block', background: bg }}>
          <rect x="0" y="0" width="160" height="14" fill="#fff" />
          <rect x="0" y="0" width="160" height="14" fill={borde} opacity="0.3" />
          <rect x="8" y="5" width="22" height="4" fill={texto} opacity="0.5" rx="1" />
          <rect x="55" y="5" width="10" height="4" fill={texto} opacity="0.25" rx="1" />
          <rect x="70" y="5" width="10" height="4" fill={texto} opacity="0.25" rx="1" />
          <rect x="85" y="5" width="10" height="4" fill={texto} opacity="0.25" rx="1" />
          <rect x="0" y="16" width="160" height="46" fill={tarjeta} />
          <rect x="10" y="30" width="50" height="7" fill={texto} opacity="0.5" rx="1" />
          <rect x="10" y="41" width="28" height="4" fill={acento} opacity="0.7" rx="1" />
          {[0, 1, 2, 3].map(i => (
            <rect key={i} x={4 + i * 38.5} y="66" width="35" height="30" fill={tarjeta} rx="2" />
          ))}
        </svg>
      )

    case 'lateral':
      return (
        <svg viewBox="0 0 160 100" style={{ width: '100%', height: 100, display: 'block', background: bg }}>
          <rect x="0" y="0" width="30" height="100" fill="#fff" />
          <rect x="0" y="0" width="30" height="100" fill={borde} opacity="0.3" />
          <rect x="8" y="10" width="14" height="3" fill={texto} opacity="0.4" rx="1" />
          <rect x="8" y="22" width="14" height="2.5" fill={texto} opacity="0.3" rx="1" />
          <rect x="8" y="30" width="14" height="2.5" fill={texto} opacity="0.3" rx="1" />
          <rect x="8" y="38" width="14" height="2.5" fill={texto} opacity="0.3" rx="1" />
          <rect x="32" y="0" width="128" height="58" fill={tarjeta} />
          <rect x="42" y="18" width="50" height="7" fill={texto} opacity="0.5" rx="1" />
          <rect x="42" y="29" width="30" height="4" fill={acento} opacity="0.7" rx="1" />
          {[0, 1, 2, 3].map(i => (
            <rect key={i} x={33 + i * 31} y="62" width="27" height="34" fill={tarjeta} rx="2" />
          ))}
        </svg>
      )

    case 'split':
      return (
        <svg viewBox="0 0 160 100" style={{ width: '100%', height: 100, display: 'block', background: bg }}>
          <rect x="0" y="0" width="160" height="10" fill="transparent" />
          <rect x="6" y="3.5" width="18" height="3" fill={texto} opacity="0.3" rx="1" />
          <rect x="0" y="12" width="72" height="88" fill={fondo} />
          <rect x="75" y="0" width="85" height="100" fill={tarjeta} />
          <rect x="8" y="28" width="50" height="7" fill={texto} opacity="0.5" rx="1" />
          <rect x="8" y="39" width="40" height="5" fill={texto} opacity="0.4" rx="1" />
          <rect x="8" y="49" width="30" height="3.5" fill={texto} opacity="0.3" rx="1" />
          <rect x="8" y="58" width="22" height="6" fill="transparent" stroke={acento} strokeWidth="1" rx="1" />
          <rect x="75" y="0" width="85" height="100" fill={acento} opacity="0.15" />
        </svg>
      )

    case 'magazine':
      return (
        <svg viewBox="0 0 160 100" style={{ width: '100%', height: 100, display: 'block', background: bg }}>
          <rect x="0" y="0" width="160" height="14" fill="#fff" />
          <rect x="0" y="0" width="160" height="14" fill={borde} opacity="0.3" />
          <rect x="8" y="5" width="22" height="4" fill={texto} opacity="0.5" rx="1" />
          <rect x="0" y="16" width="160" height="30" fill={tarjeta} />
          <rect x="0" y="16" width="160" height="30" fill={acento} opacity="0.1" />
          <rect x="45" y="23" width="70" height="6" fill={texto} opacity="0.5" rx="1" />
          <rect x="60" y="33" width="40" height="4" fill={acento} opacity="0.6" rx="1" />
          {[0, 1, 2].map(i => (
            <rect key={i} x={4 + i * 52} y="50" width="48" height="46" fill={tarjeta} rx="2" />
          ))}
        </svg>
      )

    case 'inmersivo':
      return (
        <svg viewBox="0 0 160 100" style={{ width: '100%', height: 100, display: 'block' }}>
          <rect x="0" y="0" width="160" height="100" fill={tarjeta} />
          <rect x="0" y="0" width="160" height="100" fill={acento} opacity="0.15" />
          <rect x="55" y="28" width="50" height="5" fill="white" opacity="0.7" rx="1" />
          <rect x="40" y="37" width="80" height="11" fill="white" opacity="0.8" rx="1" />
          <rect x="50" y="52" width="60" height="7" fill="white" opacity="0.7" rx="1" />
          <rect x="60" y="65" width="40" height="8" fill="transparent" stroke="white" strokeWidth="1" rx="1" opacity="0.7" />
        </svg>
      )
  }
}

// ─── Mini preview para las tarjetas de paleta ────────────────────────────────

function MiniTemaPreview({ temaKey }: { temaKey: TemaKey }) {
  const t = TEMAS[temaKey]
  return (
    <div style={{ backgroundColor: t.vars['--color-fondo'], height: 96 }}>
      <div style={{ backgroundColor: '#fff', borderBottom: `1px solid ${t.vars['--color-borde']}`, height: 18, display: 'flex', alignItems: 'center', paddingLeft: 8, paddingRight: 8, gap: 4 }}>
        <div style={{ width: 22, height: 3, backgroundColor: t.vars['--color-texto'], opacity: 0.8, borderRadius: 1 }} />
        <div style={{ flex: 1 }} />
        {[0, 1, 2].map(i => <div key={i} style={{ width: 12, height: 3, backgroundColor: t.vars['--color-texto-suave'], opacity: 0.4, borderRadius: 1 }} />)}
      </div>
      <div style={{ padding: '8px 8px 6px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ height: 7, width: '65%', backgroundColor: t.vars['--color-texto'], opacity: 0.75, borderRadius: 1 }} />
        <div style={{ height: 4, width: '40%', backgroundColor: t.vars['--color-acento'], opacity: 0.7, borderRadius: 1 }} />
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          {[0, 1, 2].map(i => <div key={i} style={{ flex: 1, height: 28, backgroundColor: t.vars['--color-tarjeta'], borderRadius: 2 }} />)}
        </div>
      </div>
    </div>
  )
}

// ─── Vista previa en tiempo real ─────────────────────────────────────────────

function LivePreview({ temaKey, fuenteKey, layoutKey }: { temaKey: TemaKey; fuenteKey: FuenteKey; layoutKey: LayoutKey }) {
  const t = TEMAS[temaKey]
  const f = FUENTES[fuenteKey]
  const v = t.vars

  const containerStyle: React.CSSProperties = {
    backgroundColor: v['--color-fondo'],
    border: `1px solid ${v['--color-borde']}`,
    borderRadius: 8,
    overflow: 'hidden',
    maxWidth: 680,
  }

  const headerBar = (transparent = false) => (
    <div style={{
      backgroundColor: transparent ? 'transparent' : '#fff',
      borderBottom: `1px solid ${transparent ? 'transparent' : v['--color-borde']}`,
      padding: '10px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span style={{ fontFamily: f.css, fontSize: 17, color: transparent ? '#fff' : v['--color-texto'] }}>Encantika</span>
      <div style={{ display: 'flex', gap: 12 }}>
        {['Catálogo', 'Colecciones', 'Arma tu joya'].map(label => (
          <span key={label} style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: transparent ? 'rgba(255,255,255,0.8)' : v['--color-texto-suave'] }}>{label}</span>
        ))}
      </div>
    </div>
  )

  const productCards = (cols: 3 | 4 = 4) => (
    <div style={{ padding: '16px 16px 12px', display: 'flex', gap: 8 }}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} style={{ flex: 1 }}>
          <div style={{ backgroundColor: v['--color-tarjeta'], height: 60, borderRadius: 3, marginBottom: 6 }} />
          <p style={{ fontFamily: f.css, fontSize: 11, color: v['--color-texto'], margin: 0 }}>
            {['Collar Luna', 'Anillo Sol', 'Aros Estrella', 'Pulsera Mar'][i % 4]}
          </p>
        </div>
      ))}
    </div>
  )

  if (layoutKey === 'lateral') {
    return (
      <div style={{ ...containerStyle, display: 'flex', flexDirection: 'row' }}>
        {/* Sidebar */}
        <div style={{ width: 80, backgroundColor: '#fff', borderRight: `1px solid ${v['--color-borde']}`,
          padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
          <div style={{ height: 4, backgroundColor: v['--color-texto'], opacity: 0.4, borderRadius: 1, marginBottom: 8 }} />
          {['Catálogo', 'Colecciones', 'Arma tu joya'].map(l => (
            <p key={l} style={{ fontSize: 8, color: v['--color-texto-suave'], letterSpacing: '0.05em', textTransform: 'uppercase' }}>{l}</p>
          ))}
        </div>
        {/* Content */}
        <div style={{ flex: 1 }}>
          <div style={{ backgroundColor: v['--color-tarjeta'], padding: '24px 20px' }}>
            <h1 style={{ fontFamily: f.css, fontSize: 32, fontWeight: 400, color: v['--color-texto'], margin: 0, lineHeight: 1.1 }}>
              Brilla con magia
            </h1>
            <p style={{ fontSize: 10, color: v['--color-texto-suave'], marginTop: 6 }}>Joyería hecha con amor</p>
          </div>
          {productCards(4)}
        </div>
      </div>
    )
  }

  if (layoutKey === 'split') {
    return (
      <div style={{ ...containerStyle, position: 'relative' }}>
        {headerBar(true)}
        <div style={{ display: 'flex', height: 180, marginTop: -36 }}>
          <div style={{ flex: '0 0 45%', backgroundColor: v['--color-fondo'], padding: '36px 20px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ fontFamily: f.css, fontSize: 28, fontWeight: 400, color: v['--color-texto'], margin: 0, lineHeight: 1.1 }}>
              Brilla con magia
            </h1>
            <p style={{ fontSize: 10, color: v['--color-texto-suave'], marginTop: 6 }}>Joyería hecha con amor</p>
            <div style={{ marginTop: 10, border: `1px solid ${v['--color-texto']}`, padding: '5px 10px', fontSize: 8,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: v['--color-texto'], width: 'fit-content' }}>
              Ver colección
            </div>
          </div>
          <div style={{ flex: '0 0 55%', backgroundColor: v['--color-tarjeta'] }} />
        </div>
        {productCards()}
      </div>
    )
  }

  if (layoutKey === 'magazine') {
    return (
      <div style={containerStyle}>
        {headerBar()}
        <div style={{ backgroundColor: v['--color-tarjeta'], padding: '20px 28px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: f.css, fontSize: 32, fontWeight: 400, color: v['--color-texto'], margin: 0 }}>Brilla con magia</h1>
          <p style={{ fontSize: 10, color: v['--color-texto-suave'], marginTop: 4 }}>Joyería hecha con amor</p>
        </div>
        {productCards(3)}
      </div>
    )
  }

  if (layoutKey === 'inmersivo') {
    return (
      <div style={containerStyle}>
        <div style={{ backgroundColor: v['--color-tarjeta'], padding: '40px 28px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <p style={{ fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: v['--color-texto-suave'] }}>encantika</p>
          <h1 style={{ fontFamily: f.css, fontSize: 40, fontWeight: 400, color: v['--color-texto'], margin: 0, textAlign: 'center' }}>
            Brilla con magia
          </h1>
          <p style={{ fontSize: 10, color: v['--color-texto-suave'] }}>Joyería hecha con amor</p>
          <div style={{ border: `1px solid ${v['--color-texto']}`, padding: '5px 12px', fontSize: 8,
            letterSpacing: '0.1em', textTransform: 'uppercase', color: v['--color-texto'] }}>
            Ver colección
          </div>
        </div>
        {productCards()}
      </div>
    )
  }

  // clasico (default)
  return (
    <div style={containerStyle}>
      {headerBar()}
      <div style={{ backgroundColor: v['--color-tarjeta'], padding: '36px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: v['--color-texto-suave'] }}>Nueva colección</span>
        <h1 style={{ fontFamily: f.css, fontSize: 44, fontWeight: 400, color: v['--color-texto'], lineHeight: 1.1, margin: 0 }}>
          Brilla con magia
        </h1>
        <p style={{ fontSize: 13, color: v['--color-texto-suave'], marginTop: 4 }}>Joyería hecha con amor para momentos únicos</p>
        <div style={{ border: `1px solid ${v['--color-texto']}`, padding: '8px 20px', fontSize: 10,
          letterSpacing: '0.12em', textTransform: 'uppercase', color: v['--color-texto'], width: 'fit-content' }}>
          Ver colección
        </div>
      </div>
      {productCards()}
    </div>
  )
}
