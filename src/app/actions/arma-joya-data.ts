'use server'

import { getTiposJoyaActivos, getAllComponentesYTipos } from '@/features/arma-joya/queries'
import { getConfigArmaJoya } from './arma-joya-configuracion'

export async function fetchArmaJoyaData() {
  const [tipos, { tiposComponente, componentes }, config] = await Promise.all([
    getTiposJoyaActivos(),
    getAllComponentesYTipos(),
    getConfigArmaJoya(),
  ])
  return { tipos, tiposComponente, componentes, config }
}
