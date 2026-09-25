'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { addToCart } from '@/lib/cart'

interface Props {
  productoId: string
  nombre: string
  precio: number
  imagenUrl: string | null
  caracteristicas: { nombre: string; valor: string }[]
  noStock: boolean
}

export default function AddToCartButton({
  productoId, nombre, precio, imagenUrl, caracteristicas, noStock,
}: Props) {
  const router = useRouter()

  function doAdd() {
    try {
      addToCart({ productoId, nombre, precio, imagenUrl, caracteristicas })
      toast.success('Agregado al carrito ✓')
    } catch (err) {
      console.error('[carrito] error al agregar:', err)
      toast.error('No se pudo agregar al carrito')
    }
  }

  function handleAdd() {
    if (noStock) return
    doAdd()
  }

  function handleBuy() {
    if (noStock) return
    doAdd()
    router.push('/carrito')
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleAdd}
        disabled={noStock}
        className="w-full py-4 text-xs tracking-[.15em] uppercase font-medium transition-colors duration-200 bg-onyx text-ivory hover:bg-[var(--color-acento,#C9A035)] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {noStock ? 'Sin stock' : 'Agregar al carrito'}
      </button>
      <button
        onClick={handleBuy}
        disabled={noStock}
        className="w-full py-4 text-xs tracking-[.15em] uppercase font-medium transition-colors duration-200 border border-onyx text-onyx hover:bg-onyx hover:text-ivory disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Comprar ahora
      </button>
    </div>
  )
}
