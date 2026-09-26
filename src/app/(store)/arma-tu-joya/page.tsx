import type { Metadata } from 'next'
import { getTiposJoyaActivos, getAllComponentesYTipos } from '@/features/arma-joya/queries'
import ArmaJoyaConfigurador from '@/components/store/arma-joya/ArmaJoyaConfigurador'

export const metadata: Metadata = {
  title: 'Arma tu Joya — Encantika',
  description: 'Crea una joya única que te represente. Elige cada componente y descubre su significado.',
}

export default async function ArmaJoyaPage() {
  const [tipos, { tiposComponente, componentes }] = await Promise.all([
    getTiposJoyaActivos(),
    getAllComponentesYTipos(),
  ])
  return (
    <ArmaJoyaConfigurador
      tipos={tipos}
      tiposComponente={tiposComponente}
      componentes={componentes}
    />
  )
}
