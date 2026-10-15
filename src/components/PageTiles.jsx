import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { formatReadAt, toggleXatmPage } from '../lib/xatm.js'
import { Card, Skeleton, cn } from './Ui.jsx'
import { LIST_BOX, ListSkeleton, rowClass } from './ViewToggle.jsx'

const GRID = 'grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10'

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

/** Har bir belgilash kuni → rang (eng eski kun birinchi rangni oladi) */
export function useDayColors(xatm) {
  return useMemo(() => {
    const days = [...new Set(Object.values(xatm).sort((a, b) => a - b).map(dayKey))]
    return new Map(days.map((day, index) => [day, DAY_COLORS[index % DAY_COLORS.length]]))
  }, [xatm])
}

/** Har bir betda qaysi sura boshlanadi yoki davom etadi — surah.startPage'dan */
export function useSurahsByPage(surahs) {
  return useMemo(() => {
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
function PageList({ pages, surahsByPage, xatm, dayColors, listRef, pageHref }) {
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
            to={pageHref(page.number)}
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

/** Kataklar ko'rinishidagi sahifalar */
function PageGrid({ pages, surahsByPage, xatm, dayColors, listRef, pageHref }) {
  return (
    <div ref={listRef} className={GRID}>
      {pages.map((page, index) => {
        const surahInfo = surahsByPage.get(page.number)
        const startsSurah = surahInfo?.starting.length > 0
        const readAt = xatm[page.number]
        const dayColor = readAt ? dayColors.get(dayKey(readAt)) : null

        return (
          <Link
            key={page.number}
            to={pageHref(page.number)}
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
  )
}

/**
 * Sahifalar katak yoki ro'yxat ko'rinishida — Sahifalar bo'limi va sura betlari uchun umumiy.
 * Har bir bet pageHref(N) ga olib boradi (standart: /page/N).
 */
export default function PageTiles({ view, pageHref = (number) => `/page/${number}`, ...props }) {
  return view === 'list' ? (
    <PageList pageHref={pageHref} {...props} />
  ) : (
    <PageGrid pageHref={pageHref} {...props} />
  )
}

/** Sahifalar yuklanayotganda ko'rsatiladigan kataklar yoki qatorlar */
export function PageTilesSkeleton({ view, count = 14 }) {
  return view === 'list' ? (
    <ListSkeleton rows={Math.min(count, 12)} rowHeight="h-[44px]" />
  ) : (
    <div className={GRID}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-[74px]" />
      ))}
    </div>
  )
}
