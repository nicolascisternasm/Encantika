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
      <div className="flex border-b border-sand mb-8">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-5 py-3 text-xs uppercase tracking-widest transition-colors -mb-px border-b-2 ${
            activeTab === 'general'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-400 hover:text-stone-700'
          }`}
        >
          General
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('paginas')}
          className={`px-5 py-3 text-xs uppercase tracking-widest transition-colors -mb-px border-b-2 ${
            activeTab === 'paginas'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-400 hover:text-stone-700'
          }`}
        >
          Páginas
        </button>
      </div>

      <div className={activeTab !== 'general' ? 'hidden' : ''}>{settingsForm}</div>
      <div className={activeTab !== 'paginas' ? 'hidden' : ''}>{paginasForm}</div>
    </div>
  )
}
