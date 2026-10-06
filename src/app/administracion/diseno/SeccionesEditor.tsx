'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import SelectorImagenModal from './SelectorImagenModal'
import { guardarSecciones } from './actions'
import type { ImagenSitio } from '../imagenes/ImagenesManager'

type SeccionKey = 'hero' | 'bannerJoya' | 'historia'

interface SeccionState {
  imagenId: string | null
  posicion: string
  imagenUrl: string | null
}

interface SeccionesEditorProps {
  hero: SeccionState
  bannerJoya: SeccionState
  historia: SeccionState
}

const GRID = [
  { pos: 'top left',      flecha: '↖' },
  { pos: 'top center',    flecha: '↑' },
  { pos: 'top right',     flecha: '↗' },
  { pos: 'center left',   flecha: '←' },
  { pos: 'center center', flecha: '·' },
  { pos: 'center right',  flecha: '→' },
  { pos: 'bottom left',   flecha: '↙' },
  { pos: 'bottom center', flecha: '↓' },
  { pos: 'bottom right',  flecha: '↘' },
]

export default function SeccionesEditor({ hero: ih, bannerJoya: ib, historia: ii }: SeccionesEditorProps) {
  const [hero, setHero] = useState(ih)
  const [bannerJoya, setBannerJoya] = useState(ib)
  const [historia, setHistoria] = useState(ii)
  const [modalAbierto, setModalAbierto] = useState<SeccionKey | null>(null)
  const [isPending, startTransition] = useTransition()
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  function get(k: SeccionKey) {
    if (k === 'hero') return hero
    if (k === 'bannerJoya') return bannerJoya
    return historia
  }

  function set(k: SeccionKey, v: SeccionState) {
    if (k === 'hero') setHero(v)
    else if (k === 'bannerJoya') setBannerJoya(v)
    else setHistoria(v)
  }

  function onImagenSeleccionada(key: SeccionKey, img: ImagenSitio) {
    set(key, { ...get(key), imagenId: img.id, imagenUrl: img.url })
    setModalAbierto(null)
  }

  function handleGuardar() {
    setMensaje(null)
    startTransition(async () => {
      const result = await guardarSecciones({
        heroImagenId: hero.imagenId,
        heroPosicion: hero.posicion,
        bannerJoyaImagenId: bannerJoya.imagenId,
        bannerJoyaPosicion: bannerJoya.posicion,
        historiaImagenId: historia.imagenId,
        historiaPosicion: historia.posicion,
      })
      if (result.success) setMensaje({ tipo: 'ok', texto: result.success })
      else if (result.error) setMensaje({ tipo: 'error', texto: result.error })
    })
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 672 }}>
        <SeccionCard
          titulo="Hero principal"
          seccion={hero}
          onCambiarImagen={() => setModalAbierto('hero')}
          onCambiarPosicion={(pos) => set('hero', { ...hero, posicion: pos })}
        />
        <SeccionCard
          titulo='Banner "Arma tu joya"'
          seccion={bannerJoya}
          onCambiarImagen={() => setModalAbierto('bannerJoya')}
          onCambiarPosicion={(pos) => set('bannerJoya', { ...bannerJoya, posicion: pos })}
        />
        <SeccionCard
          titulo="Sobre nosotros"
          seccion={historia}
          onCambiarImagen={() => setModalAbierto('historia')}
          onCambiarPosicion={(pos) => set('historia', { ...historia, posicion: pos })}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 32, paddingBottom: 48 }}>
        <button
          onClick={handleGuardar}
          disabled={isPending}
          style={{
            background: '#6366f1',
            color: '#fff',
            fontSize: 14,
            letterSpacing: '0.04em',
            padding: '12px 32px',
            borderRadius: 8,
            border: 'none',
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.5 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {isPending ? 'Guardando…' : 'Guardar secciones'}
        </button>
        {mensaje && (
          <p style={{ fontSize: 14, color: mensaje.tipo === 'ok' ? '#10b981' : '#ef4444' }}>
            {mensaje.texto}
          </p>
        )}
      </div>

      {modalAbierto && (
        <SelectorImagenModal
          seccionKey={modalAbierto === 'bannerJoya' ? 'banner_joya' : modalAbierto}
          onSelect={(img) => onImagenSeleccionada(modalAbierto, img)}
          onClose={() => setModalAbierto(null)}
        />
      )}
    </>
  )
}

function SeccionCard({
  titulo,
  seccion,
  onCambiarImagen,
  onCambiarPosicion,
}: {
  titulo: string
  seccion: SeccionState
  onCambiarImagen: () => void
  onCambiarPosicion: (pos: string) => void
}) {
  return (
    <div style={{ border: '1px solid #374151', borderRadius: 8, padding: 20, background: '#1f2937' }}>
      <h3 style={{ fontSize: 14, fontWeight: 500, color: '#d1d5db', marginBottom: 16 }}>{titulo}</h3>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Miniatura + botón cambiar */}
        <div style={{ flexShrink: 0 }}>
          <div
            style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', background: '#374151', marginBottom: 8, width: 150, height: 100 }}
          >
            {seccion.imagenUrl ? (
              <Image
                src={seccion.imagenUrl}
                alt="Imagen actual"
                fill
                className="object-cover"
                style={{ objectPosition: seccion.posicion }}
              />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#6b7280', fontSize: 12, textAlign: 'center', padding: '0 8px' }}>Sin imagen</span>
              </div>
            )}
          </div>
          <button
            onClick={onCambiarImagen}
            style={{
              fontSize: 12,
              color: '#9ca3af',
              border: '1px solid #374151',
              padding: '6px 12px',
              borderRadius: 6,
              background: 'transparent',
              cursor: 'pointer',
              width: '100%',
              transition: 'border-color 0.15s, color 0.15s',
            }}
          >
            Cambiar imagen
          </button>
        </div>

        {/* Selector de posición focal 3×3 */}
        <div>
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Posición del foco</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, width: 'fit-content' }}>
            {GRID.map(({ pos, flecha }) => (
              <button
                key={pos}
                onClick={() => onCambiarPosicion(pos)}
                title={pos}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  fontSize: 14,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                  background: seccion.posicion === pos ? '#6366f1' : '#374151',
                  color: seccion.posicion === pos ? '#fff' : '#9ca3af',
                }}
              >
                {flecha}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 10, color: '#6b7280', marginTop: 6 }}>{seccion.posicion}</p>
        </div>
      </div>
    </div>
  )
}
