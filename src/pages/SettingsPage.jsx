import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { PageHeader, Tabs } from '../components/Ui.jsx'
import { readReturnPoint, restoreScroll } from '../lib/returnPoint.js'
import DataSourceSettings from './settings/DataSourceSettings.jsx'
import ReadingTimeSettings from './settings/ReadingTimeSettings.jsx'
import ReminderSettings from './settings/ReminderSettings.jsx'
import TextSettings from './settings/TextSettings.jsx'
import ThemeSettings from './settings/ThemeSettings.jsx'
import XatmSettings from './settings/XatmSettings.jsx'

const TABS = [
  {
    id: 'text',
    label: "Matn oʻlchami",
    hint: 'Sura, juz va sahifalarni oʻqishdagi matn oʻlchamlari.',
  },
  {
    id: 'theme',
    label: 'Mavzu',
    hint: 'Butun sayt koʻrinishi: ranglar, orqa fon, kartochkalar va burchaklar.',
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
    id: 'reading',
    label: 'Oʻqish vaqti',
    hint: 'Sura, sahifa va juz oʻqish sahifalarida oʻtkazilgan vaqt — kunlar boʻyicha.',
  },
  {
    id: 'reminders',
    label: 'Eslatmalar',
    hint: 'Bosh sahifadagi «Bugungi eslatma» uchun oʻzingiz tanlagan oyat va hikmatlar.',
  },
]

/* Sozlamalarga kelishdan oldingi sahifaga qaytish — o'sha joyiga aylantirib */
function BackLink() {
  /* Sozlamalarda turganda qaytish nuqtasi o'zgarmaydi — bir marta o'qiladi */
  const [back] = useState(readReturnPoint)

  return (
    <Link
      to={back.path}
      onClick={() => restoreScroll(back)}
      className="text-ink-faint hover:text-accent mb-4 inline-flex max-w-full items-center gap-1.5 text-[13px] font-semibold transition-colors"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 flex-none"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span className="truncate">{back.label}</span>
    </Link>
  )
}

export default function SettingsPage() {
  const [params] = useSearchParams()
  /* ?tab=reminders kabi havola bilan kerakli tab ochiladi */
  const [tab, setTab] = useState(() =>
    TABS.some((item) => item.id === params.get('tab')) ? params.get('tab') : 'text',
  )
  const active = TABS.find((item) => item.id === tab) ?? TABS[0]
  /* Sozlamalar ochiq turganda navbardagi havola bosilsa ham kerakli tab ochilsin */
  const { key: locationKey } = useLocation()
  useEffect(() => {
    const requested = params.get('tab')
    if (TABS.some((item) => item.id === requested)) setTab(requested)
  }, [locationKey, params])

  return (
    <>
      <BackLink />
      <PageHeader title="Sozlamalar" subtitle={active.hint} />

      <Tabs tabs={TABS} value={tab} onChange={setTab} className="mb-6" />

      <div className="animate-fade">
        {tab === 'text' ? <TextSettings /> : null}
        {tab === 'theme' ? <ThemeSettings /> : null}
        {tab === 'data' ? <DataSourceSettings /> : null}
        {tab === 'xatm' ? <XatmSettings /> : null}
        {tab === 'reading' ? <ReadingTimeSettings /> : null}
        {tab === 'reminders' ? <ReminderSettings /> : null}
      </div>
    </>
  )
}
