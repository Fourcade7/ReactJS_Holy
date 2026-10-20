import { useCallback, useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import BackLink from '../components/BackLink.jsx'
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
function ReturnLink() {
  /* Sozlamalarda turganda qaytish nuqtasi o'zgarmaydi — bir marta o'qiladi */
  const [back] = useState(readReturnPoint)
  const restore = useCallback(() => restoreScroll(back), [back])

  return <BackLink to={back.path} label={back.label} onClick={restore} />
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
      <ReturnLink />
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
