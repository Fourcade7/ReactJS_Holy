import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { errorMessage, pageApi, surahApi } from '../api/client.js'
import { usePref } from '../lib/reading.js'
import { formatReadAt, lastXatmMark, toggleXatmPage, useXatm } from '../lib/xatm.js'
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Skeleton,
  cn,
} from '../components/Ui.jsx'
import {
  LIST_BOX,
  ListSkeleton,
  rowClass,
  useListView,
  ViewToggle,
} from '../components/ViewToggle.jsx'

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

/* Bir kunda belgilangan betlar bir xil rangda: kunlar xronologik tartibda navbatdagi rangni oladi
   (birinchi kun — avvalgidek yashil), 10 kundan keyin ranglar qaytadan boshlanadi */
const DAY_COLORS = [
  '#10b981', // yashil
  '#0ea5e9', // ko'k
  '#8b5cf6', // binafsha
  '#f59e0b', // sariq
  '#f43f5e', // qizil
  '#6366f1', // indigo
  '#f97316', // to'q sariq
  '#84cc16', // och yashil
  '#d946ef', // pushti-binafsha
  '#ec4899', // pushti
]

function dayKey(timestamp) {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

/* «O'qildi» belgisi — Link ichida bo'lgani uchun o'tishni to'xtatamiz.
   Kartochkada burchakka qo'yiladi (standart), ro'yxatda qatorning o'z ustunida turadi */
function ReadToggle({
  pageNumber,
  readAt,
  color,
  className = 'absolute top-1.5 left-1.5',
}) {
  const done = Boolean(readAt)

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggleXatmPage(pageNumber)
      }}
      className={`${className} flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border transition-colors ${
        done
          ? 'text-white hover:brightness-90'
          : 'border-line text-transparent hover:border-emerald-500/70 hover:text-emerald-500/70'
      }`}
      style={done ? { borderColor: color, backgroundColor: color } : undefined}
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

/** Jadval uslubidagi sahifalar ro'yxati: belgi · bet raqami · sura · o'qilgan vaqt · oyatlar soni · tarjima */
function PageList({ pages, surahsByPage, xatm, dayColors, listRef }) {
  return (
    <div ref={listRef} className={LIST_BOX}>
      {pages.map((page, index) => {
        const surahInfo = surahsByPage.get(page.number)
        const startsSurah = surahInfo?.starting.length > 0
        const readAt = xatm[page.number]
        const dayColor = readAt ? dayColors.get(dayKey(readAt)) : null

        return (
          <Link
            key={page.number}
            to={`/page/${page.number}`}
            className={cn(
              'grid grid-cols-[1.75rem_3rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2',
              'sm:grid-cols-[1.75rem_3rem_minmax(0,1fr)_7.5rem_4.5rem_1rem]',
              startsSurah && !readAt
                ? 'group hover:bg-accent/10 bg-accent/5 transition-colors'
                : rowClass(index),
            )}
            style={
              dayColor
                ? { backgroundColor: `${dayColor}14`, boxShadow: `inset 3px 0 0 ${dayColor}` }
                : undefined
            }
          >
            <ReadToggle
              pageNumber={page.number}
              readAt={readAt}
              color={dayColor}
              className="justify-self-center"
            />

            <span className="text-ink group-hover:text-accent text-[15px] font-bold tabular-nums transition-colors">
              {page.number}
            </span>

            <span className="flex min-w-0 items-center gap-1">
              {startsSurah ? (
                <span
                  className="text-accent flex-none text-[15px] leading-none"
                  title="Shu betda yangi sura boshlanadi"
                  aria-hidden
                >
                  ۞
                </span>
              ) : null}
              <SurahLabel info={surahInfo} />
            </span>

            <span className="hidden sm:block">
              {readAt ? (
                <span
                  className="text-[11px] font-medium tabular-nums"
                  style={{ color: dayColor }}
                  title="Oxirgi marta o'qildi deb belgilangan vaqt"
                >
                  {formatReadAt(readAt)}
                </span>
              ) : null}
            </span>

            <span className="text-ink-faint text-right text-xs tabular-nums">
              {page.ayahCount} oyat
            </span>

            <span className="hidden justify-center sm:flex">
              <span
                className={`h-1.5 w-1.5 rounded-full ${page.hasTranslation ? 'bg-accent' : 'bg-line'}`}
                title={page.hasTranslation ? 'Tarjima kiritilgan' : 'Tarjima yoʻq'}
              />
            </span>
          </Link>
        )
      })}
    </div>
  )
}

export default function PageListPage() {
  const [view, changeView] = useListView()
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [jump, setJump] = useState('')
  const navigate = useNavigate()
  const xatm = useXatm()
  /* Har bir belgilash kuni → rang (eng eski kun birinchi rangni oladi) */
  const dayColors = useMemo(() => {
    const days = [...new Set(Object.values(xatm).sort((a, b) => a - b).map(dayKey))]
    return new Map(days.map((day, index) => [day, DAY_COLORS[index % DAY_COLORS.length]]))
  }, [xatm])
  const [order, setOrder] = usePref('page-order', 'asc')

  useEffect(() => {
    pageApi
      .list()
      .then(setPages)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  /* Bo'limga kirganda oxirgi belgilangan bet ekran o'rtasiga keladi — faqat bir marta,
     shunda bet ichida belgi qo'yib/olganda sahifa sakramaydi.
     Kartochka faqat ro'yxat ichidan qidiriladi: navbardagi «Davom etish» ham shu betga
     olib borishi mumkin (/page/N) */
  const gridRef = useRef(null)
  const scrolledToLastRef = useRef(false)
  useEffect(() => {
    if (loading || pages.length === 0 || scrolledToLastRef.current) return
    scrolledToLastRef.current = true
    const last = lastXatmMark(xatm)
    if (!last) return
    requestAnimationFrame(() => {
      gridRef.current
        ?.querySelector(`a[href="/page/${last[0]}"]`)
        ?.scrollIntoView({ block: 'center', behavior: 'instant' })
    })
  }, [loading, pages, xatm])

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

  const visiblePages = useMemo(
    () =>
      [...pages].sort((a, b) => (order === 'asc' ? a.number - b.number : b.number - a.number)),
    [pages, order],
  )

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
        <div className="flex flex-wrap items-center gap-5">
          {/* Suralar bo'limidagi kabi tartib almashtirgich */}
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

          <ViewToggle view={view} onChange={changeView} />

          <form className="flex items-center gap-2" onSubmit={onJump}>
            <Input
              type="number"
              min="1"
              max="604"
              placeholder="Sahifa №"
              value={jump}
              onChange={(event) => setJump(event.target.value)}
              className="w-40! text-center"
            />
            <Button variant="primary" type="submit">
              O'tish
            </Button>
          </form>
        </div>
      </PageHeader>

      <Alert>{error}</Alert>

      {loading ? (
        view === 'list' ? (
          <ListSkeleton rows={12} rowHeight="h-[44px]" />
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10">
            {Array.from({ length: 14 }).map((_, index) => (
              <Skeleton key={index} className="h-[74px]" />
            ))}
          </div>
        )
      ) : pages.length === 0 ? (
        <EmptyState
          icon="۩"
          title="Hozircha sahifa maʼlumoti yoʻq"
          hint="public/data/pages.json fayli topilmadi yoki boʻsh."
        />
      ) : view === 'list' ? (
        <PageList
          pages={visiblePages}
          surahsByPage={surahsByPage}
          xatm={xatm}
          dayColors={dayColors}
          listRef={gridRef}
        />
      ) : (
        <div
          ref={gridRef}
          className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10"
        >
          {visiblePages.map((page, index) => {
            const surahInfo = surahsByPage.get(page.number)
            const startsSurah = surahInfo?.starting.length > 0
            const readAt = xatm[page.number]
            const dayColor = readAt ? dayColors.get(dayKey(readAt)) : null

            return (
              <Link
                key={page.number}
                to={`/page/${page.number}`}
                className="animate-rise"
                style={{ animationDelay: `${Math.min(index, 20) * 20}ms` }}
              >
                <Card
                  className={`group hover:border-accent/50 relative flex h-full flex-col items-center justify-center gap-1 p-3.5 text-center transition-colors ${
                    readAt ? '' : startsSurah ? 'border-accent/45! bg-accent/5!' : ''
                  }`}
                  style={
                    dayColor
                      ? { borderColor: `${dayColor}b3`, backgroundColor: `${dayColor}12` }
                      : undefined
                  }
                >
                  <ReadToggle pageNumber={page.number} readAt={readAt} color={dayColor} />
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
                      className="text-[10px] font-medium tabular-nums"
                      style={{ color: dayColor }}
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
