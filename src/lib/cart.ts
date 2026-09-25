export type CartItem = {
  id: string
  productoId: string
  nombre: string
  precio: number
  imagenUrl: string | null
  cantidad: number
  caracteristicas: { nombre: string; valor: string }[]
}

const CART_KEY = 'encantika_carrito'

export function getCart(): CartItem[] {
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

function saveCart(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  } catch {
    // localStorage puede estar bloqueado (modo privado, límite de cuota)
  }
}

export function addToCart(item: Omit<CartItem, 'id' | 'cantidad'> & { cantidad?: number }): CartItem[] {
  try {
    const itemId = item.productoId
    const cart = getCart()
    const existing = cart.find(i => i.id === itemId)
    if (existing) {
      existing.cantidad += item.cantidad ?? 1
      saveCart(cart)
      return cart
    }
    const newItem: CartItem = {
      id: itemId,
      productoId: item.productoId,
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

export function removeFromCart(itemId: string): CartItem[] {
  const updated = getCart().filter(i => i.id !== itemId)
  saveCart(updated)
  return updated
}

export function clearCart(): void {
  try {
    localStorage.removeItem(CART_KEY)
  } catch {
    // silencioso
  }
}

export function getCartCount(): number {
  return getCart().reduce((sum, i) => sum + i.cantidad, 0)
}
