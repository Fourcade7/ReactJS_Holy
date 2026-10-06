import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TOTAL_PAGES, formatReadAt, lastXatmMark, useXatm, xatmStartedAt } from '../lib/xatm.js'

const DAY = 86_400_000

function startOfDay(timestamp) {
  const date = new Date(timestamp)
  date.setHours(0, 0, 0, 0)
  return date
}

/* Oyning oxirgi kunidan oshib ketmasdan oy qo'shish: 31.01 + 1 oy → 28/29.02 */
function addMonths(date, months) {
  const year = date.getFullYear()
  const month = date.getMonth() + months
  const lastDay = new Date(year, month + 1, 0).getDate()
  return new Date(year, month, Math.min(date.getDate(), lastDay))
}

/**
 * Xatm boshlanganidan beri o'tgan muddat: jami kunlar va kalendar bo'yicha
 * oy / hafta / kun ko'rinishida (masalan, 15 kun → "2 hafta 1 kun").
 */
function elapsedSince(startedAt, now) {
  const from = startOfDay(startedAt)
  const to = startOfDay(now)
  const totalDays = Math.max(0, Math.round((to - from) / DAY))
  let months = (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth()
  while (months > 0 && addMonths(from, months) > to) months -= 1
  months = Math.max(0, months)
  const rest = Math.max(0, Math.round((to - addMonths(from, months)) / DAY))
  const parts = [
    months ? `${months} oy` : null,
    Math.floor(rest / 7) ? `${Math.floor(rest / 7)} hafta` : null,
    rest % 7 ? `${rest % 7} kun` : null,
  ].filter(Boolean)
  return { totalDays, breakdown: parts.join(' ') }
}

/* Kun almashganini sezish uchun daqiqasiga bir marta yangilanadi */
function useNow() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(timer)
  }, [])
  return now
}

/* Doira shaklidagi progress — markazida foiz */
function XatmRing({ ratio, percent }) {
  const size = 44
  const stroke = 4.5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <span className="relative flex h-11 w-11 flex-none items-center justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          style={{ stroke: 'var(--color-line)' }}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          className="stroke-emerald-500 transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <span className="text-ink relative text-[10px] font-bold tabular-nums">{percent}%</span>
    </span>
  )
}

/**
 * Navbardagi xatm holati — Sozlamalar → Xatm kartasi uslubida, har qanday sahifadan
 * progressni kuzatish uchun. Navbar balandligi o'zgarmaydi (blok 48px).
 * Tartib: son → chiziq → doira; juda keng ekranda sanalar ham chiqadi,
 * aks holda to'liq ma'lumot sichqoncha ustiga kelganda ko'rinadi.
 */
export default function XatmProgress() {
  const xatm = useXatm()
  const readCount = Object.keys(xatm).length
  const ratio = Math.min(1, readCount / TOTAL_PAGES)
  const percent = Math.round(ratio * 1000) / 10
  const startedAt = xatmStartedAt(xatm)
  const last = lastXatmMark(xatm)
  const now = useNow()
  const elapsed = startedAt ? elapsedSince(startedAt, now) : null

  return (
    <Link
      to="/settings?tab=xatm"
      aria-label={`Xatm: ${readCount} / ${TOTAL_PAGES} sahifa oʻqildi, ${percent}%`}
      className="group hover:bg-surface-2/60 relative hidden h-12 flex-none items-center gap-3 rounded-md px-2 transition-colors lg:flex"
    >
      <span className="flex items-baseline gap-1.5 leading-none whitespace-nowrap">
        <span className="text-2xl font-extrabold text-emerald-500 tabular-nums">{readCount}</span>
        <span className="text-ink-faint text-xs">/ {TOTAL_PAGES}</span>
      </span>

      {/* Chiziq uzunligi oyna kengligiga qarab (kunlar bloki uchun ham joy qoldiriladi):
          1264px oynada 124px, ~1500px dan keng ekranda 352px; 1190px dan tor oynada
          navbarga sig'maydi — u yerda son, doira va kunlar yetarli */}
      <span
        className="relative mt-3 hidden flex-none min-[1190px]:block"
        style={{ width: 'clamp(48px, calc(100vw - 1140px), 352px)' }}
      >
        {/* Foiz — yashil chiziq tugagan joyning tepasida, chetdan chiqib ketmaydi */}
        <span
          className="absolute bottom-full mb-1 -translate-x-1/2 text-[10px] leading-none font-bold whitespace-nowrap text-emerald-500 tabular-nums transition-[left] duration-500"
          style={{ left: `clamp(14px, ${ratio * 100}%, calc(100% - 14px))` }}
        >
          {percent}%
        </span>
        <span className="bg-line block h-2.5 overflow-hidden rounded-full">
          <span
            className="block h-full rounded-full bg-emerald-500 transition-[width] duration-500"
            style={{ width: `${ratio * 100}%` }}
          />
        </span>
      </span>

      <XatmRing ratio={ratio} percent={percent} />

      {/* Xatm boshlanganidan beri o'tgan kunlar, ostida oy / hafta / kun ko'rinishida */}
      {elapsed ? (
        <span className="hidden flex-col gap-0.5 leading-tight whitespace-nowrap tabular-nums min-[1100px]:flex">
          <span className="text-ink text-[13px] font-bold">
            {elapsed.totalDays ? `${elapsed.totalDays} kun` : 'Bugun'}
          </span>
          <span className="text-ink-faint text-[10px] font-medium">
            {elapsed.totalDays ? elapsed.breakdown : 'boshlandi'}
          </span>
        </span>
      ) : null}

      {startedAt ? (
        <>
          <span className="bg-line hidden h-8 w-px min-[1760px]:block" />
          <span className="text-ink-faint hidden flex-col gap-1 text-[11px] leading-tight whitespace-nowrap tabular-nums min-[1760px]:flex">
            <span>
              Boshlangan vaqti:{' '}
              <span className="text-ink font-semibold">{formatReadAt(startedAt)}</span>
            </span>
            {last ? (
              <span>
                Oxirgi belgilangan:{' '}
                <span className="text-ink font-semibold">{last[0]}-sahifa</span> ·{' '}
                {formatReadAt(last[1])}
              </span>
            ) : null}
          </span>
        </>
      ) : null}

      {/* To'liq ma'lumot — sanalar ko'rinmaydigan ekranlarda, sichqoncha ustiga kelganda */}
      <span className="bg-surface border-line text-ink-soft pointer-events-none absolute top-full right-0 z-50 mt-1 hidden w-max rounded-md border px-3.5 py-3 text-left text-xs font-medium shadow-2xl group-hover:block min-[1760px]:group-hover:hidden">
        <span className="text-ink block text-[13px] font-bold">Xatm holati</span>
        <span className="mt-1.5 block tabular-nums">
          <span className="font-bold text-emerald-500">{readCount}</span> / {TOTAL_PAGES} sahifa
          oʻqildi · <span className="text-ink font-semibold">{percent}%</span>
        </span>
        {startedAt ? (
          <span className="mt-1 block tabular-nums">
            Boshlangan vaqti:{' '}
            <span className="text-ink font-semibold">{formatReadAt(startedAt)}</span>
            {elapsed?.totalDays ? ` · ${elapsed.totalDays} kun (${elapsed.breakdown})` : ''}
          </span>
        ) : null}
        {last ? (
          <span className="mt-1 block tabular-nums">
            Oxirgi belgilangan: <span className="text-ink font-semibold">{last[0]}-sahifa</span> ·{' '}
            {formatReadAt(last[1])}
          </span>
        ) : (
          <span className="mt-1 block">Hali birorta sahifa belgilanmagan</span>
        )}
      </span>
    </Link>
  )
}
