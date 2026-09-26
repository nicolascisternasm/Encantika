'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { guardarComponente, eliminarComponente, type ComponenteFormData } from '@/app/actions/arma-joya-componentes'

type TipoComp = { id: string; nombre: string; slug: string }

type Props = {
  tiposComponente: TipoComp[]
  inicial?: Partial<ComponenteFormData> & { id?: string }
}

const ENERGIAS = ['celestial', 'terrestre', 'igneo', 'acuatico', 'neutro']
const TEXTURAS = ['cristalino', 'brumoso', 'fluido', 'estelar', 'suave']
const PARTICULAS = ['ninguno', 'chispa', 'polvo', 'burbuja']
const TRADICIONES = ['', 'astrologia', 'cristaloterapia', 'simbologia', 'mitologia', 'naturaleza', 'otro']

export default function ComponenteForm({ tiposComponente, inicial = {} }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const [uploadingImg, setUploadingImg] = useState(false)

  const [form, setForm] = useState<ComponenteFormData>({
    id: inicial.id,
    sku: inicial.sku ?? '',
    nombre: inicial.nombre ?? '',
    descripcion: inicial.descripcion ?? '',
    tipo_componente_id: inicial.tipo_componente_id ?? tiposComponente[0]?.id ?? '',
    material: inicial.material ?? '',
    color: inicial.color ?? '',
    precio: inicial.precio ?? 0,
    stock: inicial.stock ?? 0,
    url_imagen: inicial.url_imagen ?? '',
    color_primario: inicial.color_primario ?? '#C9A035',
    color_secundario: inicial.color_secundario ?? '',
    color_acento: inicial.color_acento ?? '',
    estilo_energia: inicial.estilo_energia ?? 'neutro',
    intensidad: inicial.intensidad ?? 5,
    textura: inicial.textura ?? 'suave',
    estilo_particulas: inicial.estilo_particulas ?? 'ninguno',
    desc_holistica: inicial.desc_holistica ?? '',
    tradicion: inicial.tradicion ?? '',
    orden: inicial.orden ?? 0,
    activo: inicial.activo ?? true,
  })

  function set<K extends keyof ComponenteFormData>(k: K, v: ComponenteFormData[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function handleGuardar() {
    setError('')
    if (!form.sku.trim() || !form.nombre.trim() || !form.tipo_componente_id) {
      setError('SKU, nombre y tipo son obligatorios.')
      return
    }
    startTransition(async () => {
      try {
        await guardarComponente(form)
        router.push('/administracion/arma-joya/componentes')
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al guardar')
      }
    })
  }

  function handleEliminar() {
    if (!form.id) return
    if (!confirm('¿Eliminar este componente? Esta acción no se puede deshacer.')) return
    startTransition(async () => {
      try {
        await eliminarComponente(form.id!)
        router.push('/administracion/arma-joya/componentes')
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al eliminar')
      }
    })
  }

  async function handleImagenUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImg(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `componentes/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage
        .from('imagenes-componentes')
        .upload(path, file, { contentType: file.type, upsert: true })
      if (error) throw error
      const { data: urlData } = supabase.storage.from('imagenes-componentes').getPublicUrl(data.path)
      set('url_imagen', urlData.publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir imagen')
    } finally {
      setUploadingImg(false)
    }
  }

  const isEditing = Boolean(form.id)

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-stone-100">
            {isEditing ? 'Editar componente' : 'Nuevo componente'}
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            <a href="/administracion/arma-joya/componentes" className="hover:text-stone-300 transition-colors">
              ← Volver al catálogo
            </a>
          </p>
        </div>
        {isEditing && (
          <button
            onClick={handleEliminar}
            disabled={pending}
            className="text-xs text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
          >
            Eliminar
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-950 border border-red-800 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* ── Identificación ── */}
        <Section title="Identificación">
          <div className="grid grid-cols-2 gap-4">
            <Field label="SKU *">
              <input
                value={form.sku}
                onChange={(e) => set('sku', e.target.value)}
                placeholder="CAD-ORO-FINA"
                className={inputCls}
              />
            </Field>
            <Field label="Tipo de componente *">
              <select
                value={form.tipo_componente_id}
                onChange={(e) => set('tipo_componente_id', e.target.value)}
                className={inputCls}
              >
                {tiposComponente.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Nombre *">
            <input
              value={form.nombre}
              onChange={(e) => set('nombre', e.target.value)}
              placeholder="Cadena dorada fina"
              className={inputCls}
            />
          </Field>
          <Field label="Descripción">
            <input
              value={form.descripcion}
              onChange={(e) => set('descripcion', e.target.value)}
              placeholder="Descripción breve del componente"
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Material">
              <input
                value={form.material}
                onChange={(e) => set('material', e.target.value)}
                placeholder="Acero inoxidable bañado en oro"
                className={inputCls}
              />
            </Field>
            <Field label="Color (texto)">
              <input
                value={form.color}
                onChange={(e) => set('color', e.target.value)}
                placeholder="dorado"
                className={inputCls}
              />
            </Field>
          </div>
        </Section>

        {/* ── Precio e inventario ── */}
        <Section title="Precio e inventario">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Precio (CLP)">
              <input
                type="number"
                min={0}
                value={form.precio}
                onChange={(e) => set('precio', Number(e.target.value))}
                className={inputCls}
              />
            </Field>
            <Field label="Stock">
              <input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => set('stock', Number(e.target.value))}
                className={inputCls}
              />
            </Field>
            <Field label="Orden">
              <input
                type="number"
                min={0}
                value={form.orden}
                onChange={(e) => set('orden', Number(e.target.value))}
                className={inputCls}
              />
            </Field>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="activo"
              checked={form.activo}
              onChange={(e) => set('activo', e.target.checked)}
              className="w-4 h-4 accent-stone-300"
            />
            <label htmlFor="activo" className="text-sm text-stone-400">Componente activo (visible en la tienda)</label>
          </div>
        </Section>

        {/* ── Imagen del componente ── */}
        <Section title="Imagen del componente">
          <p className="text-xs text-stone-500 mb-3">
            Sube una foto sin fondo (PNG transparente). Se mostrará en la tarjeta del configurador.
          </p>
          <div className="flex items-start gap-4">
            {/* Preview */}
            <div
              className="w-24 h-24 rounded border border-stone-700 flex items-center justify-center shrink-0 overflow-hidden"
              style={{ background: 'repeating-conic-gradient(#2a2520 0% 25%, #1a1512 0% 50%) 0 0 / 12px 12px' }}
            >
              {form.url_imagen ? (
                <Image src={form.url_imagen} alt="preview" width={96} height={96} className="w-full h-full object-contain" unoptimized />
              ) : (
                <svg className="w-8 h-8 text-stone-600" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <label className="block cursor-pointer">
                <span className="inline-block px-4 py-2 text-xs uppercase tracking-wider border border-stone-600 text-stone-300 hover:border-stone-400 hover:text-white transition-colors rounded">
                  {uploadingImg ? 'Subiendo…' : 'Elegir imagen'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploadingImg}
                  onChange={handleImagenUpload}
                />
              </label>
              {form.url_imagen && (
                <button
                  type="button"
                  onClick={() => set('url_imagen', '')}
                  className="mt-2 block text-xs text-red-500 hover:text-red-400 transition-colors"
                >
                  Quitar imagen
                </button>
              )}
            </div>
          </div>
        </Section>

        {/* ── Colores y fondo dinámico ── */}
        <Section title="Colores y fondo dinámico">
          <div className="grid grid-cols-3 gap-4">
            {(
              [['color_primario', 'Color primario'], ['color_secundario', 'Color secundario'], ['color_acento', 'Color acento']] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={form[key] || '#000000'}
                    onChange={(e) => set(key, e.target.value)}
                    className="w-8 h-8 cursor-pointer rounded border border-stone-700 bg-transparent"
                  />
                  <input
                    value={form[key] || ''}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder="#C9A035"
                    className={`${inputCls} flex-1 font-mono text-xs`}
                    maxLength={7}
                  />
                </div>
              </Field>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Estilo energía">
              <select value={form.estilo_energia} onChange={(e) => set('estilo_energia', e.target.value)} className={inputCls}>
                {ENERGIAS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </Field>
            <Field label={`Intensidad: ${form.intensidad}/10`}>
              <input
                type="range" min={1} max={10}
                value={form.intensidad}
                onChange={(e) => set('intensidad', Number(e.target.value))}
                className="w-full accent-stone-400 mt-2"
              />
            </Field>
            <Field label="Textura">
              <select value={form.textura} onChange={(e) => set('textura', e.target.value)} className={inputCls}>
                {TEXTURAS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Estilo partículas">
              <select value={form.estilo_particulas} onChange={(e) => set('estilo_particulas', e.target.value)} className={inputCls}>
                {PARTICULAS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        {/* ── Contenido holístico ── */}
        <Section title="Contenido holístico">
          <Field label="Descripción holística">
            <textarea
              value={form.desc_holistica}
              onChange={(e) => set('desc_holistica', e.target.value)}
              rows={4}
              placeholder="Tradicionalmente asociado con…"
              className={`${inputCls} resize-none`}
            />
          </Field>
          <Field label="Tradición">
            <select value={form.tradicion} onChange={(e) => set('tradicion', e.target.value)} className={inputCls}>
              {TRADICIONES.map((t) => <option key={t} value={t}>{t || '— Ninguna —'}</option>)}
            </select>
          </Field>
        </Section>

        {/* ── Acciones ── */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleGuardar}
            disabled={pending}
            className="flex-1 py-3 text-sm font-medium bg-stone-100 text-stone-900 hover:bg-white transition-colors disabled:opacity-50"
          >
            {pending ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear componente'}
          </button>
          <a
            href="/administracion/arma-joya/componentes"
            className="px-6 py-3 text-sm text-stone-500 border border-stone-800 hover:text-stone-300 transition-colors"
          >
            Cancelar
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Helpers UI ──────────────────────────────────────────────────────────────

const inputCls =
  'w-full bg-stone-900 border border-stone-700 text-stone-200 text-sm px-3 py-2 focus:outline-none focus:border-stone-500 transition-colors'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-widest text-stone-500 mb-4 pb-2 border-b border-stone-800">
        {title}
      </h3>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-stone-500 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
