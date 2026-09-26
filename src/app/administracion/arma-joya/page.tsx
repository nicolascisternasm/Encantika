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
        <h1 className="text-2xl font-semibold text-stone-100">Arma tu Joya</h1>
        <p className="text-stone-400 text-sm mt-1">Configuraciones recibidas de clientes</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pedidos nuevos', value: totales.pedido, color: '#C9A035' },
          { label: 'En fabricación', value: totales.fabricando, color: '#4A90D9' },
          { label: 'Entregados', value: totales.entregado, color: '#4CAF7D' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-stone-900 border border-stone-800 rounded-lg p-4">
            <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-semibold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      {rows.length === 0 ? (
        <div className="text-center py-20 text-stone-500 text-sm">
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
                className="bg-stone-900 border border-stone-800 rounded-lg p-5 hover:border-stone-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Cabecera */}
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-mono text-xs text-stone-500">#{idCorto}</span>
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-full"
                        style={{
                          background: `${ESTADO_COLOR[config.estado]}22`,
                          color: ESTADO_COLOR[config.estado],
                          border: `1px solid ${ESTADO_COLOR[config.estado]}44`,
                        }}
                      >
                        {ESTADO_LABEL[config.estado] ?? config.estado}
                      </span>
                      {config.es_regalo && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700">
                          🎁 Regalo
                        </span>
                      )}
                    </div>

                    {/* Tipo y componentes */}
                    <p className="text-stone-200 text-sm font-medium mb-1">
                      {tipoNombre}
                      {config.nombre_receptor && (
                        <span className="text-stone-400 font-normal"> · para {config.nombre_receptor}</span>
                      )}
                    </p>
                    {nombresComps && (
                      <p className="text-stone-500 text-xs mb-2 truncate">{nombresComps}</p>
                    )}

                    {/* Intención */}
                    {config.intencion_texto && (
                      <p className="text-stone-400 text-xs italic mb-2">
                        "{config.intencion_texto}"
                      </p>
                    )}

                    {/* Significado IA (colapsado) */}
                    {config.significado_ia && (
                      <details className="group">
                        <summary className="text-[11px] text-stone-600 cursor-pointer hover:text-stone-400 transition-colors list-none flex items-center gap-1 mb-1">
                          <svg className="w-3 h-3 group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Ver significado IA
                        </summary>
                        <p className="text-stone-500 text-xs leading-relaxed mt-1 pl-4 border-l border-stone-800">
                          {config.significado_ia}
                        </p>
                        {config.tarjeta_texto && (
                          <p className="text-stone-500 text-xs italic leading-relaxed mt-2 pl-4 border-l border-stone-700">
                            "{config.tarjeta_texto}"
                          </p>
                        )}
                      </details>
                    )}
                  </div>

                  {/* Precio y fecha */}
                  <div className="text-right shrink-0">
                    <p className="text-stone-200 font-medium text-base">
                      ${config.precio_total.toLocaleString('es-CL')}
                    </p>
                    <p className="text-stone-600 text-xs mt-1">{fecha}</p>
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
    <form action={`/api/admin/configuraciones/${configId}/estado`} method="POST" className="mt-2" suppressHydrationWarning>
      <select
        name="estado"
        defaultValue={estadoActual}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="text-[11px] bg-stone-800 border border-stone-700 text-stone-300 rounded px-2 py-1 cursor-pointer"
      >
        {Object.entries(ESTADO_LABEL).map(([val, label]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>
    </form>
  )
}
