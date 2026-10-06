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
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#f9fafb', margin: 0 }}>Componentes</h1>
          <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>Catálogo de piezas para Arma tu Joya</p>
        </div>
        <Link
          href="/administracion/arma-joya/componentes/nuevo"
          style={{ padding: '8px 16px', fontSize: 14, background: '#6366f1', color: '#fff', borderRadius: 8, textDecoration: 'none', transition: 'opacity 0.15s' }}
        >
          + Nuevo componente
        </Link>
      </div>

      {(tiposComponente ?? []).map((tipo) => {
        const comps = porTipo.get(tipo.id) ?? []
        if (comps.length === 0) return null
        return (
          <div key={tipo.id} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              {tipo.nombre}
              <span style={{ color: '#4b5563' }}>({comps.length})</span>
            </h2>
            <div className="flex flex-col gap-1">
              {comps.map((c) => (
                <div
                  key={c.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#1f2937', border: '1px solid #374151', padding: '12px 16px', transition: 'border-color 0.15s' }}
                >
                  {/* Swatch de color */}
                  <div
                    style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, border: '1px solid #374151', background: c.color_primario ?? '#3a3530' }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#d1d5db', fontSize: 14, fontWeight: 500 }} className="truncate">{c.nombre}</p>
                    <p style={{ color: '#6b7280', fontSize: 12 }}>{c.sku}</p>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ color: '#9ca3af', fontSize: 14 }}>
                      {c.precio > 0 ? `$${c.precio.toLocaleString('es-CL')}` : 'Sin costo'}
                    </p>
                    <p style={{ color: '#6b7280', fontSize: 12 }}>Stock: {c.stock}</p>
                  </div>

                  <ToggleActivo id={c.id} activo={c.activo} />

                  <Link
                    href={`/administracion/arma-joya/componentes/${c.id}`}
                    style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none', flexShrink: 0, transition: 'color 0.15s' }}
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
