import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { errorMessage, wordsApi } from '../api/client.js'
import { ReaderPager } from '../components/Quran.jsx'
import {
  Alert,
  Badge,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Skeleton,
  cn,
} from '../components/Ui.jsx'

const PAGE_SIZE = 24

function DifficultyDots({ score }) {
  const level = score >= 90 ? 3 : score >= 80 ? 2 : 1
  const label = level === 3 ? 'juda qiyin' : level === 2 ? 'qiyin' : 'oʻrtacha'

  return (
    <span className="flex items-center gap-1" title={`Qiyinlik: ${label}`}>
      {[1, 2, 3].map((dot) => (
        <span
          key={dot}
          className={cn('h-1.5 w-1.5 rounded-full', dot <= level ? 'bg-accent' : 'bg-line')}
        />
      ))}
    </span>
  )
}

export default function WordsPage() {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [pageIndex, setPageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const listRef = useRef(null)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  /* qidiruvni biroz kechiktiramiz — har harfda so'rov ketmasin */
  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 350)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    setPageIndex(0)
  }, [search])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    wordsApi
      .list({
        limit: PAGE_SIZE,
        offset: pageIndex * PAGE_SIZE,
        q: search || undefined,
      })
      .then((data) => {
        if (cancelled) return
        setItems(data.items)
        setTotal(data.total)
      })
      .catch((err) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
  }, [search, pageIndex])

  function movePage(delta) {
    setPageIndex((prev) => Math.min(Math.max(prev + delta, 0), totalPages - 1))
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <PageHeader
        title="Qiyin soʻzlar"
        subtitle={`Qur'ondagi oʻqilishi eng ogʻir ${total} ta soʻz — harfi koʻp, madd va hamzali kalimalar`}
      >
        <div className="relative w-full max-w-[280px]">
          <svg
            viewBox="0 0 24 24"
            className="text-ink-faint pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <Input
            className="rounded-full pl-10"
            placeholder="Soʻz qidirish…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </PageHeader>

      <p className="text-ink-faint mb-6 max-w-2xl text-[13px] leading-relaxed">
        Har bir soʻzning yonida lotincha oʻqilishi berilgan. Soʻzni bossangiz, u birinchi
        marta uchragan oyatga oʻtasiz va oʻzbekcha tarjimasini koʻrasiz.
      </p>

      <Alert>{error}</Alert>

      <div ref={listRef} className="scroll-mt-24" />

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <Skeleton key={index} className="h-[124px]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title={search ? 'Hech narsa topilmadi' : 'Roʻyxat boʻsh'}
          hint={search ? 'Boshqa soʻz bilan qidirib koʻring.' : null}
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((word, index) => (
              <Link
                key={word.id}
                to={`/surah/${word.firstSurah}#ayah-${word.firstAyah}`}
                className="animate-rise"
                style={{ animationDelay: `${Math.min(index, 12) * 20}ms` }}
              >
                <Card className="group hover:border-accent/50 flex h-full flex-col p-5 transition-colors">
                  <p className="arabic text-ink text-3xl leading-[1.9]">{word.text}</p>

                  {word.transliteration ? (
                    <p className="text-accent mt-3 text-[15px] font-semibold">
                      {word.transliteration}
                    </p>
                  ) : null}

                  <div className="border-line mt-auto flex items-center justify-between gap-2 border-t pt-3 text-[11px]">
                    <span className="text-ink-faint group-hover:text-accent transition-colors">
                      {word.firstSurah}:{word.firstAyah}-oyat →
                    </span>
                    <span className="flex items-center gap-2">
                      {word.count > 1 ? (
                        <Badge>{word.count} marta</Badge>
                      ) : (
                        <Badge>1 marta</Badge>
                      )}
                      <DifficultyDots score={word.difficulty} />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <ReaderPager
            label={`${pageIndex + 1} / ${totalPages}`}
            prev={pageIndex > 0 ? { label: 'Oldingi', onClick: () => movePage(-1) } : null}
            next={
              pageIndex < totalPages - 1
                ? { label: 'Keyingi', onClick: () => movePage(1) }
                : null
            }
          />

          <p className="text-ink-faint mt-3 text-center text-[13px]">
            {pageIndex * PAGE_SIZE + 1}–{pageIndex * PAGE_SIZE + items.length} / {total} soʻz
          </p>
        </>
      )}
    </>
  )
}
