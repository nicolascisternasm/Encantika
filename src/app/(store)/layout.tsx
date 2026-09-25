import { Cormorant_Garamond } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
})

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <div className={cormorant.variable}>{children}</div>
}
