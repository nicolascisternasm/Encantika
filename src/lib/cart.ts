export type CartItem = {
  id: string
  productoId: string
  varianteId: string | null
  nombre: string
  variantLabel: string
  precio: number
  imagenUrl: string | null
  cantidad: number
}

const CART_KEY = 'encantika_carrito'

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function addToCart(item: Omit<CartItem, 'id' | 'cantidad'> & { cantidad?: number }): CartItem[] {
  const itemId = `${item.productoId}:${item.varianteId ?? 'base'}`
  const cart = getCart()
  const existing = cart.find(i => i.id === itemId)
  if (existing) {
    existing.cantidad += item.cantidad ?? 1
    saveCart(cart)
    return cart
  }
  const newItem: CartItem = { ...item, id: itemId, cantidad: item.cantidad ?? 1 }
  const updated = [...cart, newItem]
  saveCart(updated)
  return updated
}

export function removeFromCart(itemId: string): CartItem[] {
  const updated = getCart().filter(i => i.id !== itemId)
  saveCart(updated)
  return updated
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY)
}

export function getCartCount(): number {
  return getCart().reduce((sum, i) => sum + i.cantidad, 0)
}
