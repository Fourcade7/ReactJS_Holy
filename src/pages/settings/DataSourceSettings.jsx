import { useEffect, useState } from 'react'
import { dataApi, errorMessage } from '../../api/client.js'
import {
  Alert,
  Badge,
  Button,
  Card,
  Progress,
  SectionTitle,
  cn,
} from '../../components/Ui.jsx'
import { saveBlob, zipBlob, zipEntry } from '../../lib/zip.js'

const ARCHIVE_NAME = 'quron-data.zip'
const PARALLEL = 12

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/**
 * public/data ichidagi barcha JSON fayllarni bitta .zip ga yig'adi.
 * Ro'yxat manifest.json dan olinadi — arxiv doim haqiqiy fayllar bilan bir xil bo'ladi.
 */
async function buildDataArchive(onProgress) {
  const manifest = await dataApi.manifest()
  const paths = [...new Set(['manifest.json', ...manifest.files.map((file) => file.path)])]
  const entries = new Array(paths.length)
  let next = 0
  let done = 0

  async function worker() {
    while (next < paths.length) {
      const index = next++
      entries[index] = await zipEntry(`data/${paths[index]}`, await dataApi.bytes(paths[index]))
      onProgress(++done, paths.length)
    }
  }

  await Promise.all(Array.from({ length: PARALLEL }, worker))
  return zipBlob(entries)
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

function DownloadArchive({ totalBytes }) {
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')
  const percent = progress?.total ? Math.round((progress.done / progress.total) * 100) : 0

  async function download() {
    setError('')
    setProgress({ done: 0, total: 0 })
    try {
      const blob = await buildDataArchive((done, total) => setProgress({ done, total }))
      saveBlob(blob, ARCHIVE_NAME)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setProgress(null)
    }
  }

  return (
    <div className="mt-5">
      <div className="border-line bg-surface-2 rounded-md border px-4 py-3">
        <div className="flex items-center gap-3">
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
          <span className="min-w-0 flex-1">
            <span className="text-ink block text-sm font-semibold">
              Barcha JSON maʼlumotni yuklab olish
            </span>
            <span className="text-ink-faint block text-xs tabular-nums">
              {progress
                ? `Arxiv tayyorlanmoqda… ${progress.done.toLocaleString('uz')} / ${progress.total.toLocaleString('uz')}`
                : `${ARCHIVE_NAME}${totalBytes ? ` · ${formatSize(totalBytes)} JSON` : ''}`}
            </span>
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={download}
            disabled={Boolean(progress)}
            className="tabular-nums"
          >
            {progress ? `${percent}%` : 'Yuklab olish'}
          </Button>
        </div>
        {progress ? (
          <Progress value={progress.done} total={progress.total} className="mt-3" />
        ) : null}
      </div>
      {error ? (
        <div className="mt-3">
          <Alert>{error}</Alert>
        </div>
      ) : null}
    </div>
  )
}

export default function DataSourceSettings() {
  const [meta, setMeta] = useState(null)

  useEffect(() => {
    dataApi.meta().then(setMeta)
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

        {meta ? <DownloadArchive totalBytes={meta.totalBytes} /> : null}

        <p className="text-ink-faint mt-5 text-[13px] leading-relaxed">
          Barcha maʼlumot{' '}
          <code className="bg-surface-2 rounded-md px-1.5 py-0.5 text-xs">public/data</code>{' '}
          papkasidagi JSON fayllardan oʻqiladi, server kerak emas. Qurʼon matni oʻzgarmagani
          uchun fayllarni qayta yozish shart emas.
        </p>
      </Card>
    </div>
  )
}
