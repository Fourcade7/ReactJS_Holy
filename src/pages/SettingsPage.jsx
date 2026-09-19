import { useState } from 'react'
import { PageHeader, cn } from '../components/Ui.jsx'
import DataSourceSettings from './settings/DataSourceSettings.jsx'
import TextSettings from './settings/TextSettings.jsx'
import XatmSettings from './settings/XatmSettings.jsx'

const TABS = [
  {
    id: 'text',
    label: "Matn oʻlchami",
    hint: 'Sura, juz va sahifalarni oʻqishdagi matn oʻlchamlari.',
  },
  {
    id: 'data',
    label: "Maʼlumot manbai",
    hint: 'Sayt public/data ichidagi statik JSON fayllardan oʻqiydi.',
  },
  {
    id: 'xatm',
    label: 'Xatm',
    hint: 'Oʻqilgan sahifalar belgilari — shu brauzerda saqlanadi.',
  },
]

export default function SettingsPage() {
  const [tab, setTab] = useState('text')
  const active = TABS.find((item) => item.id === tab) ?? TABS[0]

  return (
    <>
      <PageHeader title="Sozlamalar" subtitle={active.hint} />

      <div className="bg-surface-2 border-line mb-6 inline-flex rounded-full border p-1">
        {TABS.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              'cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-all duration-150',
              tab === item.id ? 'bg-ink text-bg' : 'text-ink-soft hover:text-ink',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="animate-fade">
        {tab === 'text' ? <TextSettings /> : null}
        {tab === 'data' ? <DataSourceSettings /> : null}
        {tab === 'xatm' ? <XatmSettings /> : null}
      </div>
    </>
  )
}
