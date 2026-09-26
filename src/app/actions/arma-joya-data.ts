'use server'

import { getTiposJoyaActivos, getAllComponentesYTipos } from '@/features/arma-joya/queries'

export async function fetchArmaJoyaData() {
  const [tipos, { tiposComponente, componentes }] = await Promise.all([
    getTiposJoyaActivos(),
    getAllComponentesYTipos(),
  ])
  return { tipos, tiposComponente, componentes }
}
