import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout | Encantika',
}

export default function CheckoutPage() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-[48px] sm:text-[64px] font-normal leading-tight text-stone-800 mb-6">
        Checkout
      </h1>
      <p className="text-[15px] text-stone-500 max-w-sm leading-relaxed mb-10">
        Próximamente podrás completar tu compra directamente desde aquí.
      </p>
      <Link
        href="/carrito"
        className="text-xs uppercase tracking-[.15em] text-stone-500 hover:text-stone-800 transition-colors border-b border-stone-300 hover:border-stone-700 pb-0.5"
      >
        Volver al carrito
      </Link>
    </main>
  )
}
