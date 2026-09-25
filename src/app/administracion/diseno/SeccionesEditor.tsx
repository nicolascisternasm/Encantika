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
      <div className="space-y-6 max-w-2xl">
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

      <div className="flex items-center gap-4 mt-8 pb-12">
        <button
          onClick={handleGuardar}
          disabled={isPending}
          className="bg-stone-900 text-white text-sm tracking-wide px-8 py-3 hover:bg-stone-700 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Guardando…' : 'Guardar secciones'}
        </button>
        {mensaje && (
          <p className={`text-sm ${mensaje.tipo === 'ok' ? 'text-stone-500' : 'text-red-600'}`}>
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
    <div className="border border-stone-200 rounded-lg p-5 bg-white">
      <h3 className="text-sm font-medium text-stone-700 mb-4">{titulo}</h3>

      <div className="flex gap-6 items-start">
        {/* Miniatura + botón cambiar */}
        <div className="shrink-0">
          <div
            className="relative rounded overflow-hidden bg-stone-100 mb-2"
            style={{ width: 150, height: 100 }}
          >
            {seccion.imagenUrl ? (
              <Image
                src={seccion.imagenUrl}
                alt="Imagen actual"
                fill
                className="object-cover"
                style={{ objectPosition: seccion.posicion }}
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-stone-300 text-xs text-center px-2">Sin imagen</span>
              </div>
            )}
          </div>
          <button
            onClick={onCambiarImagen}
            className="text-xs text-stone-500 border border-stone-200 px-3 py-1.5 rounded hover:border-stone-400 hover:text-stone-700 transition-colors w-full"
          >
            Cambiar imagen
          </button>
        </div>

        {/* Selector de posición focal 3×3 */}
        <div>
          <p className="text-xs text-stone-400 mb-2">Posición del foco</p>
          <div className="grid grid-cols-3 gap-1 w-fit">
            {GRID.map(({ pos, flecha }) => (
              <button
                key={pos}
                onClick={() => onCambiarPosicion(pos)}
                title={pos}
                className={`w-9 h-9 rounded text-sm transition-colors ${
                  seccion.posicion === pos
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                }`}
              >
                {flecha}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-stone-400 mt-1.5">{seccion.posicion}</p>
        </div>
      </div>
    </div>
  )
}
