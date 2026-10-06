'use client'

import { useState } from 'react'

interface ConfigTabsProps {
  settingsForm: React.ReactNode
  paginasForm: React.ReactNode
}

type Tab = 'general' | 'paginas'

export default function ConfigTabs({ settingsForm, paginasForm }: ConfigTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('general')

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          style={{
            padding: '8px 20px',
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s',
            background: activeTab === 'general' ? '#6366f1' : '#374151',
            color: activeTab === 'general' ? '#ffffff' : '#9ca3af',
            fontWeight: 500,
          }}
        >
          General
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('paginas')}
          style={{
            padding: '8px 20px',
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s',
            background: activeTab === 'paginas' ? '#6366f1' : '#374151',
            color: activeTab === 'paginas' ? '#ffffff' : '#9ca3af',
            fontWeight: 500,
          }}
        >
          Páginas
        </button>
      </div>

      <div className={activeTab !== 'general' ? 'hidden' : ''}>{settingsForm}</div>
      <div className={activeTab !== 'paginas' ? 'hidden' : ''}>{paginasForm}</div>
    </div>
  )
}
