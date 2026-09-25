'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { addToCart } from '@/lib/cart'

interface Props {
  productoId: string
  nombre: string
  precio: number
  varianteId: string | null
  variantLabel: string
  imagenUrl: string | null
  requiresSelection: boolean
  noStock: boolean
}

export default function AddToCartButton({
  productoId, nombre, precio, varianteId, variantLabel,
  imagenUrl, requiresSelection, noStock,
}: Props) {
  const router = useRouter()

  function doAdd() {
    addToCart({ productoId, varianteId, nombre, variantLabel, precio, imagenUrl })
    toast.success('Agregado al carrito ✓')
  }

  function handleAdd() {
    if (requiresSelection || noStock) return
    doAdd()
  }

  function handleBuy() {
    if (requiresSelection || noStock) return
    doAdd()
    router.push('/carrito')
  }

  const disabled = requiresSelection || noStock
  const addLabel = requiresSelection
    ? 'Selecciona una opción'
    : noStock
    ? 'Sin stock'
    : 'Agregar al carrito'

  return (
    <div className="space-y-3">
      <button
        onClick={handleAdd}
        disabled={disabled}
        className="w-full py-4 text-xs tracking-[.15em] uppercase font-medium transition-colors duration-200 bg-onyx text-ivory hover:bg-[var(--color-acento,#C9A035)] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {addLabel}
      </button>
      <button
        onClick={handleBuy}
        disabled={disabled}
        className="w-full py-4 text-xs tracking-[.15em] uppercase font-medium transition-colors duration-200 border border-onyx text-onyx hover:bg-onyx hover:text-ivory disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Comprar ahora
      </button>
    </div>
  )
}
