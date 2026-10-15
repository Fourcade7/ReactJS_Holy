import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { errorMessage, surahApi } from '../api/client.js'
import MushafExcerpt from '../components/MushafExcerpt.jsx'
import TodayReminder from '../components/TodayReminder.jsx'
import {
  Alert,
  Card,
  Diamond,
  EmptyState,
  Input,
  Skeleton,
  Tabs,
  cn,
} from '../components/Ui.jsx'
import {
  LIST_BOX,
  ListSkeleton,
  rowClass,
  useListView,
  ViewToggle,
} from '../components/ViewToggle.jsx'
import { usePref } from '../lib/reading.js'
import { useReminders } from '../lib/reminders.js'
import { surahPageRange, surahXatmStatus, toggleXatmSurah, useXatm } from '../lib/xatm.js'

/**
 * Sura qidiruvi ustidagi tablar. Birinchisi — tasodifiy eslatma; qolganlari doimiy
 * oyatlar (eslatma emas): mushaf betidagi o'rni bilan, shu tabning o'zida ochiladi.
 */
const HOME_TABS = [
  { id: 'reminder', label: 'Bugungi eslatma' },
  {
    id: 'kursi',
    label: 'Oyatal Kursiy',
    excerpt: { surah: 2, ayahs: [255], pageNumber: 42, caption: 'Baqara surasi, 255-oyat · 42-sahifa' },
  },
  {
    id: 'omanar',
    label: 'Aamanar-Rasulu',
    excerpt: {
      surah: 2,
      ayahs: [285, 286],
      pageNumber: 49,
      caption: 'Baqara surasi, 285–286-oyatlar · 49-sahifa',
    },
  },
]

/* Surani o'qildi deb belgilash — shu suraning barcha betlari belgilanadi.
   Kartochkada burchakka qo'yiladi (standart), ro'yxatda qatorning o'z ustunida turadi */
function SurahReadToggle({ surah, status, className = 'absolute top-1.5 right-1.5 z-10' }) {
  const done = status.done

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggleXatmSurah(surah.number)
      }}
      className={`${className} flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border transition-colors ${
        done
          ? 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600'
          : status.read > 0
            ? 'border-emerald-500/60 text-emerald-500/60 hover:border-emerald-500 hover:text-emerald-500'
            : 'border-line text-transparent hover:border-emerald-500/70 hover:text-emerald-500/70'
      }`}
      title={
        done
          ? `Belgini olib tashlash (${status.from}–${status.to}-betlar)`
          : `Butun surani o'qildi deb belgilash (${status.from}–${status.to}-betlar)`
      }
      aria-label={
        done
          ? `${surah.nameUz} surasi belgisini olib tashlash`
          : `${surah.nameUz} surasini o'qildi deb belgilash`
      }
      aria-pressed={done}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </button>
  )
}

/* Suraning ma'nosi, bo'lmasa Makkiy/Madaniy */
function surahSubtitle(surah) {
  return (
    surah.meaningUz ||
    (surah.revelationPlace === 'makka'
      ? 'Makkiy'
      : surah.revelationPlace === 'madina'
        ? 'Madaniy'
        : '—')
  )
}

function statusTitle(status) {
  return status.done
    ? `To'liq o'qildi: ${status.total} ta bet (${status.from}–${status.to}-betlar)`
    : `${status.read}/${status.total} bet o'qildi · ${status.total - status.read} ta qoldi (${status.from}–${status.to}-betlar)`
}

/* Kitobdagi sura sarlavhasi xatti (KFGQPC surah-names): "003" → «آل عمران» */
function SurahGlyph({ surah, className }) {
  return (
    <span
      dir="ltr"
      className={cn('text-ink block', className)}
      style={{ fontFamily: '"surah-names"' }}
      title={surah.nameArabic}
      aria-label={surah.nameArabic}
    >
      {String(surah.number).padStart(3, '0')}
    </span>
  )
}

/* Sura mushafning qaysi betlarida: oralig'i («2–49») ustida, betlar soni («48 bet») ostida.
   Oyatlar soni yonida turadi — pastki qatori u bilan bir chiziqda */
function SurahPages({ surah, className }) {
  const range = surahPageRange(surah.number)
  if (!range) return null
  const [from, to] = range
  const total = to - from + 1

  return (
    <span
      className={cn('text-ink-faint block text-right text-[11px] leading-[14px] tabular-nums', className)}
      title={
        from === to
          ? `Mushafning ${from}-sahifasida`
          : `Mushafning ${from}–${to}-sahifalarida (${total} bet)`
      }
    >
      <span className="block">{from === to ? from : `${from}–${to}`}</span>
      <span className="block">{total} bet</span>
    </span>
  )
}

/** Jadval uslubidagi suralar ro'yxati: raqam · nom va ma'nosi · betlar · arabcha nomi va oyatlar soni · belgi */
function SurahList({ surahs, xatm }) {
  return (
    <div className={LIST_BOX}>
      {surahs.map((surah, index) => {
        const status = surahXatmStatus(xatm, surah.number)

        return (
          <Link
            key={surah.id}
            to={`/surah/${surah.number}/pages`}
            className={cn(
              rowClass(index),
              'grid grid-cols-[2.5rem_minmax(0,1fr)_auto_1.5rem] items-center gap-3 px-4 py-2.5',
              status?.done && 'bg-emerald-500/[0.07]!',
            )}
          >
            <span className="text-ink-faint text-sm font-semibold tabular-nums">{surah.number}</span>

            <span className="min-w-0">
              <span className="text-ink group-hover:text-accent block truncate text-[15px] font-semibold transition-colors">
                {surah.nameUz}
              </span>
              <span className="text-ink-faint block truncate text-xs">{surahSubtitle(surah)}</span>
              {status?.read > 0 ? (
                <span
                  className="block truncate text-[11px] font-semibold whitespace-nowrap text-emerald-500 tabular-nums"
                  title={statusTitle(status)}
                >
                  {status.done ? "✓ O'qildi" : `${status.read}/${status.total} bet o'qildi`}
                </span>
              ) : null}
            </span>

            <span className="flex items-end gap-3">
              <SurahPages surah={surah} className="mb-px" />
              <span className="text-right">
                <SurahGlyph surah={surah} className="text-[26px] leading-[21px]" />
                <span className="text-ink-faint mt-1 block text-xs">
                  {surah.totalAyahs || surah.savedAyahs} oyat
                </span>
              </span>
            </span>

            {status ? (
              <SurahReadToggle surah={surah} status={status} className="justify-self-center" />
            ) : (
              <span />
            )}
          </Link>
        )
      })}
    </div>
  )
}

export default function SurahListPage() {
  const [surahs, setSurahs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [order, setOrder] = usePref('surah-order', 'asc')
  const [view, changeView] = useListView()
  const xatm = useXatm()
  const reminders = useReminders()
  const [tab, setTab] = useState(HOME_TABS[0].id)

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
      <Tabs tabs={HOME_TABS} value={tab} onChange={setTab} className="mb-3" />
      {tab === 'reminder' ? <TodayReminder reminders={reminders} className="mb-6" /> : null}
      {HOME_TABS.map((item) =>
        item.excerpt && tab === item.id ? (
          <MushafExcerpt key={item.id} {...item.excerpt} className="mb-6" />
        ) : null,
      )}

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
            className="pl-10"
            placeholder="Sura qidirish…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
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
        </div>
      </div>

      <Alert>{error}</Alert>

      {loading ? (
        view === 'list' ? (
          <ListSkeleton />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 min-[75rem]:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <Skeleton key={index} className="h-[86px]" />
            ))}
          </div>
        )
      ) : visible.length === 0 ? (
        <EmptyState
          title={query ? 'Hech narsa topilmadi' : "Hozircha sura yo'q"}
          hint={
            query
              ? 'Boshqa soʻz bilan qidirib koʻring.'
              : 'public/data/surahs.json fayli topilmadi yoki boʻsh.'
          }
        />
      ) : view === 'list' ? (
        <SurahList surahs={visible} xatm={xatm} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 min-[75rem]:grid-cols-3">
          {visible.map((surah, index) => {
            const status = surahXatmStatus(xatm, surah.number)

            return (
              <Link
                key={surah.id}
                to={`/surah/${surah.number}/pages`}
                className="animate-rise"
                style={{ animationDelay: `${Math.min(index, 12) * 25}ms` }}
              >
                <Card
                  className={`group hover:border-accent/50 relative flex h-full items-center gap-3 p-4 transition-colors ${
                    status?.done ? 'border-emerald-500/70! bg-emerald-500/[0.07]!' : ''
                  }`}
                >
                  {status ? <SurahReadToggle surah={surah} status={status} /> : null}
                  <Diamond className="group-hover:bg-accent/15">{surah.number}</Diamond>

                  <div className="min-w-0 flex-1">
                    <p className="text-ink truncate font-bold">{surah.nameUz}</p>
                    <p className="text-ink-faint truncate text-[13px]">{surahSubtitle(surah)}</p>
                    {status?.read > 0 ? (
                      <p
                        className="mt-0.5 truncate text-[11px] font-semibold whitespace-nowrap text-emerald-500 tabular-nums"
                        title={statusTitle(status)}
                      >
                        {status.done ? "✓ O'qildi" : `${status.read}/${status.total} bet o'qildi`}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-none items-end gap-3 pr-4">
                    <SurahPages surah={surah} className="mb-0.5" />
                    <div className="text-right">
                      <SurahGlyph surah={surah} className="text-[28px] leading-[22.5px]" />
                      <p className="text-ink-faint mt-1 text-[13px]">
                        {surah.totalAyahs || surah.savedAyahs} oyat
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
