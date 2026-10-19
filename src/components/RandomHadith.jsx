import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { errorMessage } from '../api/client.js'
import { collectionApi, hadithApi, sectionApi } from '../api/hadith.js'
import { Badge, Button, Card, Skeleton, cn } from './Ui.jsx'

/* Faqat oldingi rivoyatga ishora qiluvchi qisqa matnlar («shunga oʻxshash rivoyat qildi»,
   «shu hadisni rivoyat qildi») — yolg'iz o'zi hech narsa anglatmaydi, tasodifiy chiqmaydi */
const REFERENCE_ONLY =
  /oʻxshash|mislini|maʼno|xuddi (oʻzini|shunday)|aynan shunday|yuqoridagi|(oldingi|avvalgi) hadis|uzilib qolgan|zikr qilmadi|shu hadisni|shu \(hadis\)ni|hadisini rivoyat|hadisi kabi|toʻliqroq|manbada|^rivoyat qil/i

function isStandalone(hadith) {
  const text = hadith.textUz?.trim() ?? ''
  return text.length >= 25 && !(text.length < 120 && REFERENCE_ONLY.test(text))
}

const pick = (items) => items[Math.floor(Math.random() * items.length)]

/* Bo'lim hadislar soniga qarab tanlanadi — kitob ichidagi har bir hadis bir xil ehtimol bilan chiqadi */
function pickWeighted(items, weight) {
  let rest = Math.random() * items.reduce((sum, item) => sum + weight(item), 0)
  return items.find((item) => (rest -= weight(item)) < 0) ?? items[items.length - 1]
}

/* Avval kitob (har biri teng ehtimol bilan — kichik to'plamlar ham chiqib tursin), so'ng bo'lim va hadis */
async function loadRandomHadith() {
  const collections = (await collectionApi.list()).filter((item) => item.translatedHadiths > 0)
  for (let attempt = 0; attempt < 5; attempt++) {
    const collection = pick(collections)
    const sections = (await sectionApi.list(collection.id)).filter(
      (item) => item.translatedHadiths > 0,
    )
    if (!sections.length) continue
    const section = pickWeighted(sections, (item) => item.translatedHadiths)
    const hadiths = (await hadithApi.section(collection.id, section.number)).filter(isStandalone)
    if (hadiths.length) return { collection, section, hadith: pick(hadiths) }
  }
  throw new Error('Hadis topilmadi')
}

function RefreshIcon({ spinning }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('h-4 w-4', spinning && 'animate-spin')}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  )
}

/** Barcha hadis kitoblaridan tasodifiy bitta hadis — faqat o'zbekcha tarjimasi; tugma bilan almashtiriladi */
export default function RandomHadith({ className }) {
  const [state, setState] = useState({ item: null, error: '', loading: true })
  const [seed, setSeed] = useState(0)

  useEffect(() => {
    let cancelled = false
    loadRandomHadith()
      .then((item) => {
        if (!cancelled) setState({ item, error: '', loading: false })
      })
      .catch((error) => {
        if (!cancelled) setState((prev) => ({ ...prev, error: errorMessage(error), loading: false }))
      })
    return () => {
      cancelled = true
    }
  }, [seed])

  const refresh = () => {
    setState((prev) => ({ ...prev, loading: true }))
    setSeed((value) => value + 1)
  }

  const { item, error, loading } = state
  const hadith = item?.hadith

  return (
    <Card className={cn('animate-fade px-4 py-3.5 sm:px-5', className)}>
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <Badge>Hadis</Badge>
          {item ? (
            <Link
              to={`/book/${item.collection.id}/s/${item.section.number}/${hadith.number}`}
              className="text-ink-faint hover:text-accent text-xs transition-colors"
            >
              {item.collection.nameUz} ·{' '}
              {hadith.numberTo != null ? `${hadith.number}–${hadith.numberTo}` : hadith.number}-hadis
            </Link>
          ) : null}
          {hadith?.translation === 'ai' ? (
            <Badge title="Tarjima sunʼiy intellekt yordamida qilingan va hali mutaxassis tomonidan tekshirilmagan">
              Sunʼiy intellekt tarjimasi
            </Badge>
          ) : null}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="-my-1.5 -mr-2 flex-none"
          onClick={refresh}
          disabled={loading}
          title="Boshqa hadis"
          aria-label="Boshqa tasodifiy hadis"
        >
          <RefreshIcon spinning={loading} />
        </Button>
      </div>

      {hadith ? (
        <div
          key={`${item.collection.id}/${hadith.number}`}
          className={cn('animate-fade mt-2 transition-opacity', loading && 'opacity-50')}
        >
          {hadith.narratorUz ? (
            <p className="text-ink-faint txt-uz-sub mb-2 font-medium">{hadith.narratorUz}</p>
          ) : null}
          <p className="txt-uz text-ink-soft">{hadith.textUz}</p>
          {hadith.sourceUz ? (
            <p className="text-ink-faint txt-uz-sub mt-3">{hadith.sourceUz}</p>
          ) : null}
        </div>
      ) : error ? (
        <p className="mt-2 text-sm font-medium text-red-500">{error}</p>
      ) : (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      )}
    </Card>
  )
}
