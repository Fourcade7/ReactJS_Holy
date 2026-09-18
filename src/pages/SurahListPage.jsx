import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { errorMessage, surahApi } from '../api/client.js'
import { Alert, Card, Diamond, EmptyState, Input, Skeleton } from '../components/Ui.jsx'
import { usePref } from '../lib/reading.js'

export default function SurahListPage() {
  const [surahs, setSurahs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [order, setOrder] = usePref('surah-order', 'asc')

  useEffect(() => {
    surahApi
      .list()
      .then(setSurahs)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? surahs.filter(
          (surah) =>
            String(surah.number).includes(q) ||
            surah.nameUz.toLowerCase().includes(q) ||
            (surah.meaningUz || '').toLowerCase().includes(q) ||
            surah.nameArabic.includes(query.trim()),
        )
      : surahs
    return [...filtered].sort((a, b) =>
      order === 'asc' ? a.number - b.number : b.number - a.number,
    )
  }, [surahs, query, order])

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
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
            placeholder="Sura qidirish…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <button
          onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
          className="text-ink-faint hover:text-ink flex cursor-pointer items-center gap-1.5 text-xs font-semibold tracking-wider uppercase transition-colors"
        >
          Tartib:
          <span className="text-ink">{order === 'asc' ? 'Oʻsish' : 'Kamayish'}</span>
          <svg
            viewBox="0 0 24 24"
            className={`h-3.5 w-3.5 transition-transform duration-200 ${order === 'asc' ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      </div>

      <Alert>{error}</Alert>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <Skeleton key={index} className="h-[86px]" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          title={query ? 'Hech narsa topilmadi' : "Hozircha sura yo'q"}
          hint={
            query
              ? 'Boshqa soʻz bilan qidirib koʻring.'
              : 'Sozlamalar → Suralar boʻlimidan birinchi surani qoʻshing.'
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((surah, index) => (
            <Link
              key={surah.id}
              to={`/surah/${surah.number}`}
              className="animate-rise"
              style={{ animationDelay: `${Math.min(index, 12) * 25}ms` }}
            >
              <Card className="group hover:border-accent/50 flex h-full items-center gap-3 p-4 transition-colors">
                <Diamond className="group-hover:bg-accent/15">{surah.number}</Diamond>

                <div className="min-w-0 flex-1">
                  <p className="text-ink truncate font-bold">{surah.nameUz}</p>
                  <p className="text-ink-faint truncate text-[13px]">
                    {surah.meaningUz ||
                      (surah.revelationPlace === 'makka'
                        ? 'Makkiy'
                        : surah.revelationPlace === 'madina'
                          ? 'Madaniy'
                          : '—')}
                  </p>
                </div>

                <div className="flex-none text-right">
                  <p className="arabic text-ink text-lg leading-tight">
                    {surah.nameArabic}
                  </p>
                  <p className="text-ink-faint mt-1 text-[13px]">
                    {surah.savedAyahs}
                    {surah.totalAyahs ? `/${surah.totalAyahs}` : ''} oyat
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
