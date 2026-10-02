import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { errorMessage, pageApi, surahApi } from '../api/client.js'
import { formatReadAt, toggleXatmPage, useXatm } from '../lib/xatm.js'
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Skeleton,
} from '../components/Ui.jsx'

/* Betda boshlanadigan sura(lar) ajralib turadi, qolgan betlarda davom etayotgan sura xira */
function SurahLabel({ info }) {
  if (!info?.current) return null

  if (info.starting.length > 0) {
    const [first, ...rest] = info.starting
    return (
      <span
        className="bg-accent/10 text-accent max-w-full truncate rounded-md px-2 py-0.5 text-[11px] font-semibold"
        title={info.starting.map((surah) => `${surah.number}. ${surah.nameUz}`).join(', ')}
      >
        {first.number}. {first.nameUz}
        {rest.length > 0 ? ` +${rest.length}` : ''}
      </span>
    )
  }

  return (
    <span className="text-ink-soft max-w-full truncate px-2 py-0.5 text-[11px]">
      {info.current.nameUz}
    </span>
  )
}

/* Kartochka ichidagi «o'qildi» belgisi — Link ichida bo'lgani uchun o'tishni to'xtatamiz */
function ReadToggle({ pageNumber, readAt }) {
  const done = Boolean(readAt)

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggleXatmPage(pageNumber)
      }}
      className={`absolute top-1.5 left-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border transition-colors ${
        done
          ? 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600'
          : 'border-line text-transparent hover:border-emerald-500/70 hover:text-emerald-500/70'
      }`}
      title={done ? "Belgini olib tashlash" : "O'qildi deb belgilash"}
      aria-label={done ? `${pageNumber}-sahifa belgisini olib tashlash` : `${pageNumber}-sahifani o'qildi deb belgilash`}
      aria-pressed={done}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </button>
  )
}

export default function PageListPage() {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [jump, setJump] = useState('')
  const navigate = useNavigate()
  const xatm = useXatm()

  useEffect(() => {
    pageApi
      .list()
      .then(setPages)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const [surahs, setSurahs] = useState([])
  useEffect(() => {
    surahApi
      .list()
      .then((list) => setSurahs(Array.isArray(list) ? list : []))
      .catch(() => setSurahs([]))
  }, [])

  /* Har bir betda qaysi sura boshlanadi yoki davom etadi — surah.startPage'dan */
  const surahsByPage = useMemo(() => {
    const sorted = surahs
      .filter((surah) => surah.startPage)
      .sort((a, b) => a.number - b.number)
    const result = new Map()
    let current = null
    let cursor = 0
    for (let page = 1; page <= 604; page += 1) {
      const starting = []
      while (cursor < sorted.length && sorted[cursor].startPage <= page) {
        if (sorted[cursor].startPage === page) starting.push(sorted[cursor])
        current = sorted[cursor]
        cursor += 1
      }
      result.set(page, { starting, current })
    }
    return result
  }, [surahs])

  function onJump(event) {
    event.preventDefault()
    const target = Number(jump)
    if (target >= 1 && target <= 604) navigate(`/page/${target}`)
  }

  return (
    <>
      <PageHeader
        title="Sahifalar"
        subtitle={
          loading
            ? 'Yuklanmoqda…'
            : `${pages.length} ta sahifada maʼlumot bor · mushaf boʻyicha 1–604`
        }
      >
        <form className="flex items-center gap-2" onSubmit={onJump}>
          <Input
            type="number"
            min="1"
            max="604"
            placeholder="Sahifa №"
            value={jump}
            onChange={(event) => setJump(event.target.value)}
            className="w-32 text-center"
          />
          <Button variant="primary" type="submit">
            O'tish
          </Button>
        </form>
      </PageHeader>

      <Alert>{error}</Alert>

      {loading ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10">
          {Array.from({ length: 14 }).map((_, index) => (
            <Skeleton key={index} className="h-[74px]" />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <EmptyState
          icon="۩"
          title="Hozircha sahifa maʼlumoti yoʻq"
          hint="public/data/pages.json fayli topilmadi yoki boʻsh."
        />
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10">
          {pages.map((page, index) => {
            const surahInfo = surahsByPage.get(page.number)
            const startsSurah = surahInfo?.starting.length > 0
            const readAt = xatm[page.number]

            return (
              <Link
                key={page.number}
                to={`/page/${page.number}`}
                className="animate-rise"
                style={{ animationDelay: `${Math.min(index, 20) * 20}ms` }}
              >
                <Card
                  className={`group hover:border-accent/50 relative flex h-full flex-col items-center justify-center gap-1 p-3.5 text-center transition-colors ${
                    readAt
                      ? 'border-emerald-500/70! bg-emerald-500/[0.07]!'
                      : startsSurah
                        ? 'border-accent/45! bg-accent/5!'
                        : ''
                  }`}
                >
                  <ReadToggle pageNumber={page.number} readAt={readAt} />
                  {startsSurah ? (
                    <span
                      className="text-accent absolute top-1.5 right-2.5 text-[15px] leading-none"
                      title="Shu betda yangi sura boshlanadi"
                      aria-hidden
                    >
                      ۞
                    </span>
                  ) : null}
                  <span className="text-ink group-hover:text-accent text-xl font-bold transition-colors">
                    {page.number}
                  </span>
                  <span className="text-ink-faint text-[11px]">{page.ayahCount} oyat</span>
                  <SurahLabel info={surahInfo} />
                  {readAt ? (
                    <span
                      className="text-[10px] font-medium text-emerald-500 tabular-nums"
                      title="Oxirgi marta o'qildi deb belgilangan vaqt"
                    >
                      {formatReadAt(readAt)}
                    </span>
                  ) : null}
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${page.hasTranslation ? 'bg-accent' : 'bg-line'}`}
                    title={page.hasTranslation ? 'Tarjima kiritilgan' : 'Tarjima yoʻq'}
                  />
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
