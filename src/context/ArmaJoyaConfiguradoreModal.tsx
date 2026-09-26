'use client'

import ArmaJoyaConfigurador from '@/components/store/arma-joya/ArmaJoyaConfigurador'
import type { TipoJoya, TipoComponente, Componente } from '@/features/arma-joya/types'
import type { ConfigArmaJoya } from '@/app/actions/arma-joya-configuracion'

type Props = {
  tipos: TipoJoya[]
  tiposComponente: TipoComponente[]
  componentes: Componente[]
  config: ConfigArmaJoya
  onCerrar: () => void
}

export default function ArmaJoyaConfiguradoreModal({ tipos, tiposComponente, componentes, config, onCerrar }: Props) {
  return (
    <ArmaJoyaConfigurador
      tipos={tipos}
      tiposComponente={tiposComponente}
      componentes={componentes}
      config={config}
      onCerrar={onCerrar}
    />
  )
}
