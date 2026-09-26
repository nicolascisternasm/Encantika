'use client'

import { useState, useTransition } from 'react'
import { toggleComponenteActivo } from '@/app/actions/arma-joya-componentes'

export default function ToggleActivo({ id, activo }: { id: string; activo: boolean }) {
  const [valor, setValor] = useState(activo)
  const [pending, startTransition] = useTransition()

  function toggle() {
    const next = !valor
    setValor(next)
    startTransition(() => {
      toggleComponenteActivo(id, next).catch(() => setValor(valor))
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      title={valor ? 'Desactivar' : 'Activar'}
      className="w-9 h-5 rounded-full relative transition-colors shrink-0 disabled:opacity-50"
      style={{ background: valor ? '#4CAF7D' : '#3a3530' }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
        style={{ left: valor ? '18px' : '2px' }}
      />
    </button>
  )
}
