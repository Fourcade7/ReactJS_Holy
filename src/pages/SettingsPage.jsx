import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader, Tabs } from '../components/Ui.jsx'
import DataSourceSettings from './settings/DataSourceSettings.jsx'
import ReminderSettings from './settings/ReminderSettings.jsx'
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
  {
    id: 'reminders',
    label: 'Eslatmalar',
    hint: 'Bosh sahifadagi «Bugungi eslatma» uchun oʻzingiz tanlagan oyat va hikmatlar.',
  },
]

export default function SettingsPage() {
  const [params] = useSearchParams()
  /* ?tab=reminders kabi havola bilan kerakli tab ochiladi */
  const [tab, setTab] = useState(() =>
    TABS.some((item) => item.id === params.get('tab')) ? params.get('tab') : 'text',
  )
  const active = TABS.find((item) => item.id === tab) ?? TABS[0]

  return (
    <>
      <PageHeader title="Sozlamalar" subtitle={active.hint} />

      <Tabs tabs={TABS} value={tab} onChange={setTab} className="mb-6" />

      <div className="animate-fade">
        {tab === 'text' ? <TextSettings /> : null}
        {tab === 'data' ? <DataSourceSettings /> : null}
        {tab === 'xatm' ? <XatmSettings /> : null}
        {tab === 'reminders' ? <ReminderSettings /> : null}
      </div>
    </>
  )
}
