'use client'

import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import StatusBadge from './StatusBadge'
import { deleteProducto } from '@/features/products/actions'
import { formatCLP } from '@/lib/utils'

type ImagenMini = { id: string; ruta_almacenamiento: string; orden: number }

type ProductRow = {
  id: string
  nombre: string
  slug: string
  estado: string
  precio_base: number
  destacado: boolean
  creado_en: string
  categorias: { nombre: string } | null
  imagenes_producto: ImagenMini[] | null
  producto_colecciones: { colecciones: { id: string; nombre: string } | null }[] | null
}

export default function ProductTable({ productos }: { productos: ProductRow[] }) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const storageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}/storage/v1/object/public/imagenes-productos`

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return
    setDeleting(id)
    const result = await deleteProducto(id)
    setDeleting(null)
    if (result.error) toast.error(result.error)
    else toast.success(result.success ?? 'Producto eliminado')
  }

  if (productos.length === 0) {
    return (
      <div className="rounded-xl p-16 text-center" style={{ background: '#1f2937', border: '1px solid #374151' }}>
        <p className="text-sm" style={{ color: '#6b7280' }}>No hay productos todavía</p>
        <Link
          href="/administracion/productos/nuevo"
          className="mt-4 inline-block text-xs underline"
          style={{ color: '#6366f1' }}
        >
          Crear el primero
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#1f2937', border: '1px solid #374151' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid #374151' }}>
            <th className="w-14 px-3 py-3"></th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>Nombre</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>Categoría</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>Precio</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>Estado</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell" style={{ color: '#6b7280' }}>Colecciones</th>
            <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => {
            const mainImg =
              p.imagenes_producto?.find(i => i.orden === 0) ??
              p.imagenes_producto?.[0] ??
              null

            const colecciones = (p.producto_colecciones ?? [])
              .map(pc => pc.colecciones)
              .filter((c): c is { id: string; nombre: string } => c !== null)

            return (
              <tr
                key={p.id}
                className="transition-colors"
                style={{ borderBottom: '1px solid #374151' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#111827')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td className="px-3 py-3 w-14">
                  {mainImg ? (
                    <img
                      src={`${storageBase}/${mainImg.ruta_almacenamiento}`}
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
                <td className="px-4 py-3 text-sm" style={{ color: '#9ca3af' }}>{p.categorias?.nombre ?? '—'}</td>
                <td className="px-4 py-3 text-sm tabular-nums" style={{ color: '#d1d5db' }}>{formatCLP(p.precio_base)}</td>
                <td className="px-4 py-3">
                  <StatusBadge estado={p.estado} />
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {colecciones.length === 0 ? (
                    <span style={{ color: '#374151' }}>—</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {colecciones.slice(0, 2).map(c => (
                        <span
                          key={c.id}
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}
                        >
                          {c.nombre}
                        </span>
                      ))}
                      {colecciones.length > 2 && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: '#374151', color: '#9ca3af' }}
                        >
                          +{colecciones.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link
                    href={`/administracion/productos/${p.id}`}
                    className="text-xs transition-colors"
                    style={{ color: '#6366f1' }}
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
                    className="text-xs transition-colors disabled:opacity-50"
                    style={{ color: '#ef4444' }}
                  >
                    {deleting === p.id ? '...' : 'Eliminar'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
