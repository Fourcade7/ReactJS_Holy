import { useEffect, useState } from 'react'
import { dataApi } from '../../api/client.js'
import { Badge, Card, SectionTitle, cn } from '../../components/Ui.jsx'

const ZIP_PATH = '/data.zip'

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/**
 * Arxiv bor-yo'qligini va hajmini HEAD so'rovi bilan bilib olamiz.
 * Fayl yo'q bo'lsa dev server index.html qaytaradi — shuning uchun turini tekshiramiz.
 */
async function fetchZipSize() {
  try {
    const response = await fetch(ZIP_PATH, { method: 'HEAD' })
    const type = response.headers.get('content-type') ?? ''
    if (!response.ok || type.includes('text/html')) return null
    return Number(response.headers.get('content-length')) || null
  } catch {
    return null
  }
}

function Stat({ label, value, strong = false }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-faint">{label}</dt>
      <dd className={cn('font-semibold', strong ? 'text-accent' : 'text-ink')}>
        {typeof value === 'number' ? value.toLocaleString('uz') : value}
      </dd>
    </div>
  )
}

export default function DataSourceSettings() {
  const [meta, setMeta] = useState(null)
  const [zipSize, setZipSize] = useState(null)

  useEffect(() => {
    dataApi.meta().then(setMeta)
    fetchZipSize().then(setZipSize)
  }, [])

  return (
    <div className="max-w-2xl">
      <Card className="p-6">
        <SectionTitle>
          Hozirgi holat
          <Badge tone="accent">JSON fayllar</Badge>
        </SectionTitle>

        <div className="mt-4 space-y-3">
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
          <dl className="border-line mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5 border-t pt-4 text-[13px]">
            <Stat label="Suralar" value={meta.surahs} />
            <Stat label="Oyatlar" value={meta.ayahs} />
            <Stat label="Sahifalar" value={meta.pages} />
            <Stat label="Mushaf betlari" value={meta.mushafPages} />
            <Stat label="Qiyin soʻzlar" value={meta.words} />
            <Stat label="Fayllar soni" value={meta.files} />
            {meta.totalBytes ? (
              <div className="col-span-2">
                <Stat label="JSON umumiy hajmi" value={formatSize(meta.totalBytes)} strong />
              </div>
            ) : null}
          </dl>
        ) : null}

        {zipSize ? (
          <a
            href={ZIP_PATH}
            download="data.zip"
            className="border-line bg-surface-2 text-ink hover:border-accent/50 mt-5 flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              className="text-accent h-5 w-5 flex-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
            </svg>
            <span className="flex-1">
              <span className="block text-sm font-semibold">data.zip yuklab olish</span>
              <span className="text-ink-faint block text-xs">
                public papkasidagi tayyor arxiv
              </span>
            </span>
            <span className="text-ink-soft text-[13px] font-semibold">
              {formatSize(zipSize)}
            </span>
          </a>
        ) : null}

        <p className="text-ink-faint mt-5 text-[13px] leading-relaxed">
          Barcha maʼlumot{' '}
          <code className="bg-surface-2 rounded px-1.5 py-0.5 text-xs">public/data</code>{' '}
          papkasidagi JSON fayllardan oʻqiladi, server kerak emas. Qurʼon matni oʻzgarmagani
          uchun fayllarni qayta yozish shart emas.
        </p>
      </Card>
    </div>
  )
}
