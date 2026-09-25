'use client'

export type VariantePDPSelector = {
  id: string
  activo: boolean
  permite_a_pedido: boolean
  stock: number
  valores: Record<string, string> // atributo_id → valor_atributo_id
}

export type AtributoPDP = {
  id: string
  nombre: string
  codigo: string
  orden: number
  valores: { id: string; valor: string; color_hex: string | null }[]
}

interface Props {
  atributos: AtributoPDP[]
  variantes: VariantePDPSelector[]
  selectedValues: Record<string, string>
  onSelect: (valorId: string, atributoId: string) => void
}

type ValorStatus = 'disponible' | 'a_pedido' | 'agotado'

function getValorStatus(
  atributoId: string,
  valorId: string,
  selectedValues: Record<string, string>,
  variantes: VariantePDPSelector[],
): ValorStatus {
  // Selecciones en otros atributos (no el actual)
  const otros: Record<string, string> = {}
  for (const [k, v] of Object.entries(selectedValues)) {
    if (k !== atributoId) otros[k] = v
  }

  const matching = variantes.filter(v => {
    if (v.valores[atributoId] !== valorId) return false
    return Object.entries(otros).every(([aId, vId]) => v.valores[aId] === vId)
  })

  if (matching.length === 0) return 'agotado'
  if (matching.some(v => v.activo && v.stock > 0)) return 'disponible'
  if (matching.some(v => v.permite_a_pedido)) return 'a_pedido'
  return 'agotado'
}

export default function VariantSelector({ atributos, variantes, selectedValues, onSelect }: Props) {
  if (atributos.length === 0) return null

  return (
    <div className="space-y-5">
      {atributos.map(attr => (
        <div key={attr.id}>
          <p className="text-[11px] uppercase tracking-[.12em] text-stone-500 mb-2.5">{attr.nombre}</p>
          <div className="flex flex-wrap gap-2">
            {attr.valores.map(val => {
              const status = getValorStatus(attr.id, val.id, selectedValues, variantes)
              const selected = selectedValues[attr.id] === val.id
              const isAgotado = status === 'agotado'

              return (
                <button
                  key={val.id}
                  onClick={() => !isAgotado && onSelect(val.id, attr.id)}
                  disabled={isAgotado}
                  className={[
                    'relative flex items-center gap-1.5 px-3 py-1.5 text-sm border transition-all duration-150',
                    selected
                      ? 'border-onyx text-onyx bg-white'
                      : isAgotado
                      ? 'border-stone-200 text-stone-300 cursor-not-allowed line-through'
                      : status === 'a_pedido'
                      ? 'border-stone-300 text-stone-500 hover:border-stone-500 cursor-pointer'
                      : 'border-sand text-stone-600 hover:border-stone-500 cursor-pointer',
                  ].join(' ')}
                >
                  {val.color_hex && (
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0 border border-stone-200/80"
                      style={{ backgroundColor: val.color_hex }}
                      aria-hidden="true"
                    />
                  )}
                  <span>{val.valor}</span>
                  {status === 'a_pedido' && !selected && (
                    <span className="ml-1 text-[9px] uppercase tracking-wide text-stone-400">A pedido</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
