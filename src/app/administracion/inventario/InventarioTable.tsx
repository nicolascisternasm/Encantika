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
  if (stock > 3) return <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700">En stock ({stock})</span>
  if (stock > 0) return <span className="text-xs px-2 py-0.5 bg-yellow-50 text-yellow-700">Stock bajo ({stock})</span>
  return <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600">Sin stock</span>
}

function TipoBadge({ tipo }: { tipo: string }) {
  if (tipo === 'fabricado') {
    return <span className="text-xs px-2 py-0.5 bg-stone-100 text-stone-600">Fabricado</span>
  }
  return <span className="text-xs px-2 py-0.5 bg-white border border-stone-200 text-stone-500">Terminado</span>
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

  const btnBase = 'px-3 py-1 text-xs transition-colors'
  const btnActive = 'bg-stone-800 text-white'
  const btnInactive = 'border border-stone-200 text-stone-600 hover:bg-stone-50'

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
              className={`${btnBase} ${filtroTipo === v ? btnActive : btnInactive}`}
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
              className={`${btnBase} ${filtroStock === v ? btnActive : btnInactive}`}
            >
              {v === 'todos' ? 'Todo el stock' : v === 'en_stock' ? 'Con stock' : 'Sin stock'}
            </button>
          ))}
        </div>
        <span className="text-xs text-stone-400 ml-auto">
          {filtered.length} de {productos.length} productos
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-100">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-stone-400">
            No hay productos que coincidan con los filtros
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="w-14 px-3 py-3"></th>
                <th className="text-left px-4 py-3 text-xs font-normal text-stone-500 uppercase tracking-wider">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-normal text-stone-500 uppercase tracking-wider">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-normal text-stone-500 uppercase tracking-wider">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-normal text-stone-500 uppercase tracking-wider">Precio</th>
                <th className="text-left px-4 py-3 text-xs font-normal text-stone-500 uppercase tracking-wider">Categoría</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                  <td className="px-3 py-3 w-14">
                    {p.imagen ? (
                      <img
                        src={`${storageUrl}/${p.imagen}`}
                        alt=""
                        className="w-12 h-12 object-cover border border-stone-100"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-stone-50 border border-stone-100" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/administracion/productos/${p.id}`}
                      className="font-medium text-stone-800 hover:underline"
                    >
                      {p.nombre}
                    </Link>
                    <p className="text-xs text-stone-400 mt-0.5 font-mono">{p.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <TipoBadge tipo={p.tipo_producto} />
                  </td>
                  <td className="px-4 py-3">
                    <StockBadge stock={p.stock} />
                  </td>
                  <td className="px-4 py-3 text-stone-700 text-sm tabular-nums">{formatCLP(p.precio_base)}</td>
                  <td className="px-4 py-3 text-stone-500 text-sm">{p.categoria ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
