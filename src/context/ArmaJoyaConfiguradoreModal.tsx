'use client'

import ArmaJoyaConfigurador from '@/components/store/arma-joya/ArmaJoyaConfigurador'
import type { TipoJoya, TipoComponente, Componente } from '@/features/arma-joya/types'

type Props = {
  tipos: TipoJoya[]
  tiposComponente: TipoComponente[]
  componentes: Componente[]
  onCerrar: () => void
}

// Wrapper fino que pasa onCerrar al configurador (para usarlo en PasoConfirmacion → cerrar modal)
export default function ArmaJoyaConfiguradoreModal({ tipos, tiposComponente, componentes, onCerrar }: Props) {
  return (
    <ArmaJoyaConfigurador
      tipos={tipos}
      tiposComponente={tiposComponente}
      componentes={componentes}
      onCerrar={onCerrar}
    />
  )
}
