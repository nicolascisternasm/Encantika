'use client'

import { useArmaJoyaModal } from '@/context/ArmaJoyaModal'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  as?: 'button' | 'a'
}

export default function ArmaJoyaLink({ children, className, style, as: Tag = 'button' }: Props) {
  const { abrir } = useArmaJoyaModal()

  if (Tag === 'a') {
    return (
      <a
        href="/arma-tu-joya"
        onClick={(e) => { e.preventDefault(); abrir() }}
        className={className}
        style={style}
      >
        {children}
      </a>
    )
  }

  return (
    <button onClick={abrir} className={className} style={style}>
      {children}
    </button>
  )
}
