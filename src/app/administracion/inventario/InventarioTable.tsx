'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatCLP } from '@/lib/utils'

type ProductRow = {
  id: string
  nombre: string
  slug: string
  estado: string
  precio_base: number
  tipo_producto: string
  stock: number
  imagen: string | null
  categoria: string | null
}

interface InventarioTableProps {
  productos: ProductRow[]
  storageUrl: string
}

function StockBadge({ stock }: { stock: number }) {
  if (stock > 3) return (
    <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
      En stock ({stock})
    </span>
  )
  if (stock > 0) return (
    <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
      Stock bajo ({stock})
    </span>
  )
  return (
    <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
      Sin stock
    </span>
  )
}

function TipoBadge({ tipo }: { tipo: string }) {
  if (tipo === 'fabricado') {
    return (
      <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
        Fabricado
      </span>
    )
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: '#374151', color: '#9ca3af', border: '1px solid #4b5563' }}>
      Terminado
    </span>
  )
}

type FiltroTipo = 'todos' | 'terminado' | 'fabricado'
type FiltroStock = 'todos' | 'en_stock' | 'sin_stock'

export default function InventarioTable({ productos, storageUrl }: InventarioTableProps) {
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos')
  const [filtroStock, setFiltroStock] = useState<FiltroStock>('todos')

  const filtered = productos
    .filter(p => filtroTipo === 'todos' || p.tipo_producto === filtroTipo)
    .filter(p =>
      filtroStock === 'todos' ? true :
      filtroStock === 'en_stock' ? p.stock > 0 :
      p.stock === 0
    )

  function btnStyle(active: boolean) {
    return {
      background: active ? '#6366f1' : 'transparent',
      color: active ? 'white' : '#6b7280',
      border: active ? '1px solid #6366f1' : '1px solid #374151',
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-1">
          {(['todos', 'terminado', 'fabricado'] as FiltroTipo[]).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setFiltroTipo(v)}
              className="px-3 py-1 text-xs rounded-md transition-colors"
              style={btnStyle(filtroTipo === v)}
            >
              {v === 'todos' ? 'Todos' : v === 'terminado' ? 'Terminado' : 'Fabricado'}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(['todos', 'en_stock', 'sin_stock'] as FiltroStock[]).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setFiltroStock(v)}
              className="px-3 py-1 text-xs rounded-md transition-colors"
              style={btnStyle(filtroStock === v)}
            >
              {v === 'todos' ? 'Todo el stock' : v === 'en_stock' ? 'Con stock' : 'Sin stock'}
            </button>
          ))}
        </div>
        <span className="text-xs ml-auto" style={{ color: '#4b5563' }}>
          {filtered.length} de {productos.length} productos
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#1f2937', border: '1px solid #374151' }}>
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm" style={{ color: '#6b7280' }}>
            No hay productos que coincidan con los filtros
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #374151' }}>
                <th className="w-14 px-3 py-3"></th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>Precio</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>Categoría</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr
                  key={p.id}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid #374151' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#111827')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-3 py-3 w-14">
                    {p.imagen ? (
                      <img
                        src={`${storageUrl}/${p.imagen}`}
                        alt=""
                        className="w-12 h-12 object-cover rounded-md"
                        style={{ border: '1px solid #374151' }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-md" style={{ background: '#111827', border: '1px solid #374151' }} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/administracion/productos/${p.id}`}
                      className="font-medium hover:underline"
                      style={{ color: '#f9fafb' }}
                    >
                      {p.nombre}
                    </Link>
                    <p className="text-xs mt-0.5 font-mono" style={{ color: '#4b5563' }}>{p.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <TipoBadge tipo={p.tipo_producto} />
                  </td>
                  <td className="px-4 py-3">
                    <StockBadge stock={p.stock} />
                  </td>
                  <td className="px-4 py-3 text-sm tabular-nums" style={{ color: '#d1d5db' }}>{formatCLP(p.precio_base)}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#9ca3af' }}>{p.categoria ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
