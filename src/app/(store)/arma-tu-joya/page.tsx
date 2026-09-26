import type { Metadata } from 'next'
import { getTiposJoyaActivos } from '@/features/arma-joya/queries'
import ArmaJoyaConfigurador from '@/components/store/arma-joya/ArmaJoyaConfigurador'

export const metadata: Metadata = {
  title: 'Arma tu Joya — Encantika',
  description: 'Crea una joya única que te represente. Elige cada componente y descubre su significado.',
}

export default async function ArmaJoyaPage() {
  const tipos = await getTiposJoyaActivos()
  return <ArmaJoyaConfigurador tipos={tipos} />
}
