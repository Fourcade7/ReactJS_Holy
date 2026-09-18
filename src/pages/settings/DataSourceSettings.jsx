import { useEffect, useState } from 'react'
import {
  SOURCE_EVENT,
  dataApi,
  errorMessage,
  getSourceMode,
  resolvedSource,
  setSourceMode,
} from '../../api/client.js'
import { Alert, Badge, Button, Card, SectionTitle, cn } from '../../components/Ui.jsx'

const MODES = [
  {
    value: 'auto',
    label: 'Avtomatik',
    hint: 'Avval bazaga ulanadi, server ishlamasa JSON fayllarga oʻtadi. Tavsiya etiladi.',
  },
  {
    value: 'api',
    label: 'Faqat baza',
    hint: 'Doim NestJS + PostgreSQL orqali oʻqiydi. Server oʻchiq boʻlsa sayt ishlamaydi.',
  },
  {
    value: 'json',
    label: 'Faqat fayllar',
    hint: 'Doim public/data ichidagi JSON fayllardan oʻqiydi. Server umuman kerak emas.',
  },
]

export default function DataSourceSettings() {
  const [mode, setMode] = useState(() => getSourceMode())
  const [active, setActive] = useState(() => resolvedSource())
  const [apiOnline, setApiOnline] = useState(null)
  const [meta, setMeta] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    function onChange(event) {
      if (event.detail === 'api' || event.detail === 'json') setActive(event.detail)
    }
    window.addEventListener(SOURCE_EVENT, onChange)
    return () => window.removeEventListener(SOURCE_EVENT, onChange)
  }, [])

  useEffect(() => {
    dataApi
      .health()
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false))
    dataApi.meta().then(setMeta)
  }, [])

  function chooseMode(next) {
    setMode(next)
    setSourceMode(next)
    /* Ochilgan sahifalar eski manbadan olingan ma'lumot bilan qolmasligi uchun */
    window.location.reload()
  }

  async function runExport() {
    setExporting(true)
    setError('')
    setSuccess('')
    try {
      const result = await dataApi.export()
      setSuccess(
        `${result.files} ta fayl yozildi (${result.sizeMb} MB, ${result.seconds} soniya)`,
      )
      setMeta(result.meta)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="p-6">
        <SectionTitle>
          Hozirgi holat
          {active ? (
            <Badge tone="accent">{active === 'api' ? 'Baza' : 'JSON fayllar'}</Badge>
          ) : null}
        </SectionTitle>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-ink-soft text-sm">NestJS + PostgreSQL</span>
            <span className="flex items-center gap-2 text-[13px] font-semibold">
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  apiOnline === null
                    ? 'bg-line'
                    : apiOnline
                      ? 'bg-accent'
                      : 'bg-red-500',
                )}
              />
              {apiOnline === null
                ? 'tekshirilmoqda…'
                : apiOnline
                  ? 'ishlayapti'
                  : 'ishlamayapti'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-ink-soft text-sm">JSON fayllar</span>
            <span className="flex items-center gap-2 text-[13px] font-semibold">
              <span
                className={cn('h-2 w-2 rounded-full', meta ? 'bg-accent' : 'bg-red-500')}
              />
              {meta ? 'tayyor' : 'topilmadi'}
            </span>
          </div>
        </div>

        {meta ? (
          <div className="border-line text-ink-faint mt-5 border-t pt-4 text-[13px] leading-relaxed">
            Fayllar {new Date(meta.generatedAt).toLocaleString('uz')} da tayyorlangan:{' '}
            {meta.surahs} sura, {meta.ayahs} oyat, {meta.pages} sahifa, {meta.mushafPages}{' '}
            mushaf beti, {meta.words} qiyin soʻz.
          </div>
        ) : null}

        <div className="mt-5">
          <Button
            variant="primary"
            onClick={runExport}
            disabled={exporting || apiOnline === false}
          >
            {exporting ? 'Yozilmoqda…' : 'JSON fayllarni bazadan yangilash'}
          </Button>
          {apiOnline === false ? (
            <p className="text-ink-faint mt-2 text-xs">
              Buning uchun baza serveri ishlab turishi kerak.
            </p>
          ) : null}
        </div>

        <div className="mt-4 space-y-2">
          <Alert>{error}</Alert>
          <Alert tone="success">{success}</Alert>
        </div>
      </Card>

      <Card className="p-6">
        <SectionTitle>Manbani tanlash</SectionTitle>

        <div className="mt-4 space-y-2">
          {MODES.map((item) => (
            <button
              key={item.value}
              onClick={() => chooseMode(item.value)}
              className={cn(
                'w-full cursor-pointer rounded-xl border p-4 text-left transition-colors',
                mode === item.value
                  ? 'border-accent bg-accent/8'
                  : 'border-line hover:bg-surface-2',
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-4 w-4 flex-none items-center justify-center rounded-full border-2',
                    mode === item.value ? 'border-accent' : 'border-line',
                  )}
                >
                  {mode === item.value ? (
                    <span className="bg-accent h-2 w-2 rounded-full" />
                  ) : null}
                </span>
                <span className="text-ink text-sm font-semibold">{item.label}</span>
              </div>
              <p className="text-ink-faint mt-1.5 pl-6 text-[13px] leading-relaxed">
                {item.hint}
              </p>
            </button>
          ))}
        </div>

        <p className="text-ink-faint mt-5 text-[13px] leading-relaxed">
          Manba oʻzgartirilganda sahifa qayta yuklanadi. JSON fayllar{' '}
          <code className="bg-surface-2 rounded px-1.5 py-0.5 text-xs">
            public/data
          </code>{' '}
          papkasida turadi va Qurʼon matni oʻzgarmagani uchun ularni qayta yozish shart
          emas.
        </p>
      </Card>
    </div>
  )
}
