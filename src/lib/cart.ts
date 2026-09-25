export type CartItem = {
  id: string
  productoId: string
  slug?: string
  nombre: string
  precio: number
  imagenUrl: string | null
  cantidad: number
  caracteristicas: { nombre: string; valor: string }[]
}

const CART_KEY = 'encantika_carrito'

function dispatch() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('carritoActualizado'))
  }
}

export function obtenerCarrito(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function getCart(): CartItem[] {
  return obtenerCarrito()
}

function saveCart(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
    dispatch()
  } catch {
    // localStorage puede estar bloqueado (modo privado, límite de cuota)
  }
}

export function addToCart(
  item: Omit<CartItem, 'id' | 'cantidad'> & { cantidad?: number },
): CartItem[] {
  try {
    const itemId = item.productoId
    const cart = obtenerCarrito()
    const existing = cart.find(i => i.id === itemId)
    if (existing) {
      existing.cantidad += item.cantidad ?? 1
      saveCart(cart)
      return cart
    }
    const newItem: CartItem = {
      id: itemId,
      productoId: item.productoId,
      slug: item.slug,
      nombre: item.nombre,
      precio: item.precio,
      imagenUrl: item.imagenUrl ?? null,
      cantidad: item.cantidad ?? 1,
      caracteristicas: item.caracteristicas ?? [],
    }
    const updated = [...cart, newItem]
    saveCart(updated)
    return updated
  } catch {
    return []
  }
}

export function actualizarCantidad(productoId: string, cantidad: number): void {
  const cart = obtenerCarrito()
  const item = cart.find(i => i.productoId === productoId)
  if (!item) return
  item.cantidad = Math.max(1, Math.min(10, cantidad))
  saveCart(cart)
}

export function eliminarDelCarrito(productoId: string): void {
  const updated = obtenerCarrito().filter(i => i.productoId !== productoId)
  saveCart(updated)
}

export function obtenerCantidadTotal(): number {
  return obtenerCarrito().reduce((sum, i) => sum + i.cantidad, 0)
}

export function vaciarCarrito(): void {
  try {
    localStorage.removeItem(CART_KEY)
    dispatch()
  } catch {
    // silencioso
  }
}

// Aliases de compatibilidad
export function removeFromCart(itemId: string): CartItem[] {
  eliminarDelCarrito(itemId)
  return obtenerCarrito()
}

export function clearCart(): void {
  vaciarCarrito()
}

export function getCartCount(): number {
  return obtenerCantidadTotal()
}
