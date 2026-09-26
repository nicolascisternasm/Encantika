import { getConfigArmaJoya } from '@/app/actions/arma-joya-configuracion'
import ConfigArmaJoyaForm from './ConfigArmaJoyaForm'

export default async function ArmaJoyaConfiguracionPage() {
  const config = await getConfigArmaJoya()

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Arma tu Joya</p>
        <h1 className="text-2xl font-light text-stone-800 tracking-wide">Configuración</h1>
        <p className="text-sm text-stone-500 mt-1">
          Ajusta cómo se muestran los componentes en el configurador de la tienda.
        </p>
      </div>

      <ConfigArmaJoyaForm inicial={config} />
    </div>
  )
}
