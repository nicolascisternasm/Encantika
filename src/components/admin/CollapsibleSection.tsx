'use client'

import { useState } from 'react'

interface CollapsibleSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export default function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{ border: '1px solid #374151', borderRadius: 8, background: '#1f2937', overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(55,65,81,0.4)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
      >
        <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {title}
        </span>
        <svg
          style={{
            width: 16,
            height: 16,
            color: '#6b7280',
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div style={{ padding: '0 24px 24px' }}>{children}</div>}
    </div>
  )
}
