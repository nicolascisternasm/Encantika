import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ToggleActivo from './ToggleActivo'

export default async function ComponentesPage() {
  const supabase = await createClient()

  const [{ data: tiposComponente }, { data: componentes, error }] = await Promise.all([
    supabase.from('tipo_componentes').select('id, nombre, slug').order('orden_configurador'),
    supabase
      .from('componentes')
      .select('id, sku, nombre, precio, stock, activo, color_primario, tipo_componente_id, tipo_componentes(nombre)')
      .order('tipo_componente_id')
      .order('orden'),
  ])

  if (error) notFound()

  // Agrupar por tipo
  type Comp = {
    id: string; sku: string; nombre: string; precio: number; stock: number
    activo: boolean; color_primario: string | null; tipo_componente_id: string
    tipo_componentes: { nombre: string } | null
  }
  const porTipo = new Map<string, Comp[]>()
  for (const c of (componentes ?? []) as Comp[]) {
    const tid = c.tipo_componente_id
    if (!porTipo.has(tid)) porTipo.set(tid, [])
    porTipo.get(tid)!.push(c)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-100">Componentes</h1>
          <p className="text-stone-400 text-sm mt-1">Catálogo de piezas para Arma tu Joya</p>
        </div>
        <Link
          href="/administracion/arma-joya/componentes/nuevo"
          className="px-4 py-2 text-sm bg-stone-100 text-stone-900 hover:bg-white transition-colors"
        >
          + Nuevo componente
        </Link>
      </div>

      {(tiposComponente ?? []).map((tipo) => {
        const comps = porTipo.get(tipo.id) ?? []
        if (comps.length === 0) return null
        return (
          <div key={tipo.id} className="mb-8">
            <h2 className="text-xs uppercase tracking-widest text-stone-500 mb-3 flex items-center gap-2">
              {tipo.nombre}
              <span className="text-stone-700">({comps.length})</span>
            </h2>
            <div className="flex flex-col gap-1">
              {comps.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-4 bg-stone-900 border border-stone-800 px-4 py-3 hover:border-stone-700 transition-colors"
                >
                  {/* Swatch de color */}
                  <div
                    className="w-5 h-5 rounded-full shrink-0 border border-stone-700"
                    style={{ background: c.color_primario ?? '#3a3530' }}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-stone-200 text-sm font-medium truncate">{c.nombre}</p>
                    <p className="text-stone-600 text-xs">{c.sku}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-stone-300 text-sm">
                      {c.precio > 0 ? `$${c.precio.toLocaleString('es-CL')}` : 'Sin costo'}
                    </p>
                    <p className="text-stone-600 text-xs">Stock: {c.stock}</p>
                  </div>

                  <ToggleActivo id={c.id} activo={c.activo} />

                  <Link
                    href={`/administracion/arma-joya/componentes/${c.id}`}
                    className="text-xs text-stone-500 hover:text-stone-300 transition-colors shrink-0"
                  >
                    Editar →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
