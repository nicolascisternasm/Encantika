import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

const ESTADO_LABEL: Record<string, string> = {
  borrador: 'Borrador',
  pedido: 'Pedido recibido',
  fabricando: 'Fabricando',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const ESTADO_COLOR: Record<string, string> = {
  borrador: '#555',
  pedido: '#C9A035',
  fabricando: '#4A90D9',
  entregado: '#4CAF7D',
  cancelado: '#888',
}

type ConfigRow = {
  id: string
  tipo_joya_id: string | null
  nombre_receptor: string | null
  es_regalo: boolean
  intencion_texto: string | null
  significado_ia: string | null
  tarjeta_texto: string | null
  precio_total: number
  estado: string
  config_json: Record<string, unknown>
  creado_en: string
  tipos_joya: { nombre: string } | null
  configuracion_componentes: { componentes: { nombre: string; sku: string } | null }[]
}

export default async function ArmaJoyaAdminPage() {
  const supabase = await createClient()

  const { data: configs, error } = await supabase
    .from('configuraciones_joya')
    .select(`
      id, tipo_joya_id, nombre_receptor, es_regalo, intencion_texto,
      significado_ia, tarjeta_texto, precio_total, estado, config_json, creado_en,
      tipos_joya ( nombre ),
      configuracion_componentes (
        componentes ( nombre, sku )
      )
    `)
    .order('creado_en', { ascending: false })
    .limit(100)

  if (error) notFound()

  const rows = (configs ?? []) as unknown as ConfigRow[]

  const totales = {
    pedido: rows.filter((r) => r.estado === 'pedido').length,
    fabricando: rows.filter((r) => r.estado === 'fabricando').length,
    entregado: rows.filter((r) => r.estado === 'entregado').length,
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#f9fafb', margin: 0 }}>Arma tu Joya</h1>
        <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>Configuraciones recibidas de clientes</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pedidos nuevos', value: totales.pedido, color: '#C9A035' },
          { label: 'En fabricación', value: totales.fabricando, color: '#4A90D9' },
          { label: 'Entregados', value: totales.entregado, color: '#4CAF7D' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, padding: 16 }}>
            <p style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: 24, fontWeight: 600, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      {rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#6b7280', fontSize: 14 }}>
          Aún no hay configuraciones guardadas.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((config) => {
            const idCorto = config.id.slice(0, 8).toUpperCase()
            const fecha = new Date(config.creado_en).toLocaleDateString('es-CL', {
              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })
            const tipoNombre = config.tipos_joya?.nombre ?? '—'
            const nombresComps = config.configuracion_componentes
              .map((cc) => cc.componentes?.nombre)
              .filter(Boolean)
              .join(', ')

            return (
              <div
                key={config.id}
                style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, padding: 20, transition: 'border-color 0.15s' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Cabecera */}
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>#{idCorto}</span>
                      <span
                        style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: `${ESTADO_COLOR[config.estado]}22`,
                          color: ESTADO_COLOR[config.estado],
                          border: `1px solid ${ESTADO_COLOR[config.estado]}44`,
                        }}
                      >
                        {ESTADO_LABEL[config.estado] ?? config.estado}
                      </span>
                      {config.es_regalo && (
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: '#374151', color: '#9ca3af', border: '1px solid #4b5563' }}>
                          🎁 Regalo
                        </span>
                      )}
                    </div>

                    {/* Tipo y componentes */}
                    <p style={{ color: '#d1d5db', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                      {tipoNombre}
                      {config.nombre_receptor && (
                        <span style={{ color: '#9ca3af', fontWeight: 400 }}> · para {config.nombre_receptor}</span>
                      )}
                    </p>
                    {nombresComps && (
                      <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }} className="truncate">{nombresComps}</p>
                    )}

                    {/* Intención */}
                    {config.intencion_texto && (
                      <p style={{ color: '#9ca3af', fontSize: 12, fontStyle: 'italic', marginBottom: 8 }}>
                        &ldquo;{config.intencion_texto}&rdquo;
                      </p>
                    )}

                    {/* Significado IA (colapsado) */}
                    {config.significado_ia && (
                      <details className="group">
                        <summary style={{ fontSize: 11, color: '#4b5563', cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                          <svg className="w-3 h-3 group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Ver significado IA
                        </summary>
                        <p style={{ color: '#6b7280', fontSize: 12, lineHeight: 1.6, marginTop: 4, paddingLeft: 16, borderLeft: '1px solid #374151' }}>
                          {config.significado_ia}
                        </p>
                        {config.tarjeta_texto && (
                          <p style={{ color: '#6b7280', fontSize: 12, fontStyle: 'italic', lineHeight: 1.6, marginTop: 8, paddingLeft: 16, borderLeft: '1px solid #374151' }}>
                            &ldquo;{config.tarjeta_texto}&rdquo;
                          </p>
                        )}
                      </details>
                    )}
                  </div>

                  {/* Precio y fecha */}
                  <div className="text-right shrink-0">
                    <p style={{ color: '#d1d5db', fontWeight: 500, fontSize: 16 }}>
                      ${config.precio_total.toLocaleString('es-CL')}
                    </p>
                    <p style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>{fecha}</p>
                    <EstadoSelector configId={config.id} estadoActual={config.estado} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Selector de estado inline (client component)
function EstadoSelector({ configId, estadoActual }: { configId: string; estadoActual: string }) {
  // Implementado como form HTML nativo + Server Action para no necesitar 'use client' en toda la página
  return (
    <form action={`/api/admin/configuraciones/${configId}/estado`} method="POST" style={{ marginTop: 8 }} suppressHydrationWarning>
      <select
        name="estado"
        defaultValue={estadoActual}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        style={{ fontSize: 11, background: '#374151', border: '1px solid #4b5563', color: '#d1d5db', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}
      >
        {Object.entries(ESTADO_LABEL).map(([val, label]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>
    </form>
  )
}
