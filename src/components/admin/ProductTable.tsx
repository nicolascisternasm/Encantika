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
      <div className="bg-white border border-stone-100 rounded-sm p-16 text-center">
        <p className="text-sm text-stone-400">No hay productos todavía</p>
        <Link
          href="/administracion/productos/nuevo"
          className="mt-4 inline-block text-xs underline text-stone-500 hover:text-stone-700"
        >
          Crear el primero
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white border border-stone-100 rounded-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-100">
            <th className="w-14 px-3 py-3"></th>
            <th className="text-left px-4 py-3 text-xs font-normal text-stone-500 uppercase tracking-wider">Nombre</th>
            <th className="text-left px-4 py-3 text-xs font-normal text-stone-500 uppercase tracking-wider">Categoría</th>
            <th className="text-left px-4 py-3 text-xs font-normal text-stone-500 uppercase tracking-wider">Precio</th>
            <th className="text-left px-4 py-3 text-xs font-normal text-stone-500 uppercase tracking-wider">Estado</th>
            <th className="text-right px-4 py-3 text-xs font-normal text-stone-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => {
            const mainImg =
              p.imagenes_producto?.find(i => i.orden === 0) ??
              p.imagenes_producto?.[0] ??
              null

            return (
              <tr key={p.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                <td className="px-3 py-3 w-14">
                  {mainImg ? (
                    <img
                      src={`${storageBase}/${mainImg.ruta_almacenamiento}`}
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
                <td className="px-4 py-3 text-stone-600 text-sm">{p.categorias?.nombre ?? '—'}</td>
                <td className="px-4 py-3 text-stone-700 text-sm">{formatCLP(p.precio_base)}</td>
                <td className="px-4 py-3">
                  <StatusBadge estado={p.estado} />
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link
                    href={`/administracion/productos/${p.id}`}
                    className="text-stone-500 hover:text-stone-800 text-xs"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
                    className="text-red-500 hover:text-red-700 text-xs disabled:opacity-50"
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
