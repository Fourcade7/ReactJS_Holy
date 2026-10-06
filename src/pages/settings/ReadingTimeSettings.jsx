import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Card, SectionTitle, cn } from '../../components/Ui.jsx'
import {
  dayKey,
  formatDuration,
  resetReadingTime,
  useReadingTime,
} from '../../lib/readingTime.js'
import { useXatm } from '../../lib/xatm.js'

const MINUTE = 60_000
const DAY = 86_400_000
const MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
]
const MONTHS_SHORT = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
/* Hafta dushanbadan boshlanadi */
const WEEKDAYS = ['dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba', 'yakshanba']
const WEEKDAY_LABELS = ['Du', '', 'Ch', '', 'Ju', '', '']

/* Kalendar katagi: bitta yashil rangning pog'onalari — kam → ko'p (chegaralar qat'iy) */
const LEVELS = [
  { min: 0, className: 'bg-line', label: 'Oʻqilmagan' },
  { min: 1, className: 'bg-emerald-500/25', label: '15 daqiqagacha' },
  { min: 15, className: 'bg-emerald-500/50', label: '15–30 daqiqa' },
  { min: 30, className: 'bg-emerald-500/75', label: '30–60 daqiqa' },
  { min: 60, className: 'bg-emerald-500', label: '1 soatdan koʻp' },
]
const CELL = 12
const GAP = 2
const STEP = CELL + GAP
const LABEL_COLUMN = 28

const pad = (n) => String(n).padStart(2, '0')

function startOfDay(time) {
  const date = new Date(time)
  date.setHours(0, 0, 0, 0)
  return date
}

function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function parseKey(key) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const weekdayIndex = (date) => (date.getDay() + 6) % 7

/** 5-oktabr 2026, yakshanba */
function longDate(date) {
  return `${date.getDate()}-${MONTHS[date.getMonth()]} ${date.getFullYear()}, ${WEEKDAYS[weekdayIndex(date)]}`
}

/** 05.10.2026 */
function shortDate(date) {
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
}

function levelOf(ms) {
  const minutes = Math.floor(ms / MINUTE)
  return LEVELS.reduce((level, item, index) => (minutes >= item.min ? index : level), 0)
}

/* 1 daqiqaga yetmagan vaqt ham ko'rinsin */
function durationLabel(ms) {
  return ms > 0 && ms < MINUTE ? '1 daqiqadan kam' : formatDuration(ms)
}

function sumSince(entries, fromKey) {
  return entries.reduce((sum, [key, ms]) => (key >= fromKey ? sum + ms : sum), 0)
}

/** Umumiy ko'rsatkichlar: hafta, oy, jami, o'rtacha, eng ko'p kun, ketma-ket kunlar */
function readingStats(totals, today) {
  const entries = Object.entries(totals).filter(([, ms]) => ms > 0)
  const total = entries.reduce((sum, [, ms]) => sum + ms, 0)
  const keys = entries.map(([key]) => key).sort()
  const firstKey = keys[0]
  const daysSinceFirst = firstKey ? Math.round((today - parseKey(firstKey)) / DAY) + 1 : 0
  const best = entries.reduce((top, entry) => (!top || entry[1] > top[1] ? entry : top), null)

  /* Ketma-ket kunlar — kamida 1 daqiqa o'qilgan kunlar; bugun hali o'qilmagan bo'lsa, kechadan sanaladi */
  const readDays = new Set(entries.filter(([, ms]) => ms >= MINUTE).map(([key]) => key))
  let cursor = readDays.has(dayKey(today)) ? today : addDays(today, -1)
  let current = 0
  while (readDays.has(dayKey(cursor))) {
    current += 1
    cursor = addDays(cursor, -1)
  }
  let longest = 0
  let run = 0
  let previous = null
  for (const key of [...readDays].sort()) {
    run = previous && dayKey(addDays(parseKey(key), -1)) === previous ? run + 1 : 1
    longest = Math.max(longest, run)
    previous = key
  }

  return {
    today: totals[dayKey(today)] ?? 0,
    week: sumSince(entries, dayKey(addDays(today, -weekdayIndex(today)))),
    month: sumSince(entries, dayKey(new Date(today.getFullYear(), today.getMonth(), 1))),
    total,
    average: daysSinceFirst ? total / daysSinceFirst : 0,
    best,
    readDays: readDays.size,
    current,
    longest,
  }
}

function StatTile({ label, value, hint }) {
  return (
    <div className="bg-surface-2 rounded-md px-3.5 py-3" title={hint}>
      <p className="text-ink-faint text-xs">{label}</p>
      <p className="text-ink mt-1 text-base font-bold tabular-nums">{value}</p>
    </div>
  )
}

function TodayCard({ stats, today }) {
  return (
    <Card className="p-6">
      <SectionTitle>Bugun</SectionTitle>
      <p className="text-ink mt-3 text-4xl font-extrabold tracking-tight tabular-nums">
        {formatDuration(stats.today)}
      </p>
      <p className="text-ink-faint mt-1 text-sm">{longDate(today)}</p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Shu hafta" value={formatDuration(stats.week)} hint="Dushanbadan bugungacha" />
        <StatTile label="Shu oy" value={formatDuration(stats.month)} />
        <StatTile label="Jami" value={formatDuration(stats.total)} />
        <StatTile
          label="Kunlik oʻrtacha"
          value={formatDuration(stats.average)}
          hint="Birinchi yozilgan kundan bugungacha, oʻqilmagan kunlar ham hisobga olingan"
        />
      </div>

      <p className="text-ink-faint mt-4 flex flex-wrap gap-x-2.5 gap-y-1 text-sm">
        <span>
          Ketma-ket: <span className="text-ink font-semibold">{stats.current} kun</span>
        </span>
        <span className="text-line">|</span>
        <span>
          Eng uzun: <span className="text-ink font-semibold">{stats.longest} kun</span>
        </span>
        {stats.best ? (
          <>
            <span className="text-line">|</span>
            <span>
              Eng koʻp oʻqilgan kun:{' '}
              <span className="text-ink font-semibold">{formatDuration(stats.best[1])}</span> ·{' '}
              {shortDate(parseKey(stats.best[0]))}
            </span>
          </>
        ) : null}
      </p>
    </Card>
  )
}

/* Kalendar va diagramma uchun umumiy tooltip: avval qiymat, keyin sana */
function Tooltip({ x, y, align = 'center', children }) {
  const shift = align === 'start' ? '0%' : align === 'end' ? '-100%' : '-50%'
  return (
    <div
      className="bg-ink text-bg pointer-events-none absolute z-20 rounded-md px-2.5 py-1.5 text-xs whitespace-nowrap shadow-lg"
      style={{ left: x, top: y, transform: `translate(${shift}, calc(-100% - 6px))` }}
    >
      {children}
    </div>
  )
}

/** GitHub uslubidagi kalendar: ustun — hafta, qator — hafta kuni, rang — o'sha kungi vaqt */
function ReadingCalendar({ totals, marksByDay, today }) {
  const years = useMemo(() => {
    const set = new Set(Object.keys(totals).map((key) => Number(key.slice(0, 4))))
    set.add(today.getFullYear())
    return [...set].sort((a, b) => b - a)
  }, [totals, today])
  const [range, setRange] = useState('last')
  const [hover, setHover] = useState(null)
  const wrapRef = useRef(null)
  const scrollRef = useRef(null)

  /* «So'nggi yil» — joriy haftagacha 53 hafta; yil tanlansa — 1-yanvardan 31-dekabrgacha */
  const weeks = useMemo(() => {
    const first = range === 'last' ? addDays(today, -weekdayIndex(today) - 52 * 7) : new Date(range, 0, 1)
    const last = range === 'last' ? today : new Date(range, 11, 31)
    const gridStart = addDays(first, -weekdayIndex(first))
    const columns = []
    for (let day = gridStart; day <= last || weekdayIndex(day) !== 0; day = addDays(day, 1)) {
      if (weekdayIndex(day) === 0) columns.push([])
      const key = dayKey(day)
      const visible = day >= first && day <= last && day <= today
      const ms = totals[key] ?? 0
      columns.at(-1).push({ date: day, key, ms, visible, level: levelOf(ms) })
    }
    return columns
  }, [range, today, totals])

  const monthLabels = useMemo(() => {
    const labels = []
    weeks.forEach((week, column) => {
      const firstOfMonth = week.find((cell) => cell.visible && cell.date.getDate() === 1)
      if (firstOfMonth) labels.push({ column, month: firstOfMonth.date.getMonth() })
    })
    const firstVisible = weeks.findIndex((week) => week.some((cell) => cell.visible))
    if (firstVisible >= 0 && (labels.length === 0 || labels[0].column - firstVisible >= 3)) {
      const cell = weeks[firstVisible].find((item) => item.visible)
      labels.unshift({ column: firstVisible, month: cell.date.getMonth() })
    }
    return labels
  }, [weeks])

  const rangeTotal = weeks.flat().reduce((sum, cell) => (cell.visible ? sum + cell.ms : sum), 0)
  const rangeDays = weeks.flat().filter((cell) => cell.visible && cell.ms >= MINUTE).length

  /* Tor oynada oxirgi haftalar ko'rinib tursin */
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
  }, [weeks])

  function onEnter(event, cell) {
    const wrap = wrapRef.current?.getBoundingClientRect()
    const rect = event.currentTarget.getBoundingClientRect()
    if (!wrap) return
    const x = rect.left - wrap.left + CELL / 2
    setHover({
      cell,
      x,
      y: rect.top - wrap.top,
      align: x < 90 ? 'start' : x > wrap.width - 90 ? 'end' : 'center',
    })
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle>Kalendar</SectionTitle>
        <div className="bg-surface-2 border-line inline-flex rounded-md border p-0.5">
          {['last', ...years].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRange(item)}
              className={cn(
                'cursor-pointer rounded-md px-2.5 py-0.5 text-xs font-semibold tabular-nums transition-colors',
                range === item ? 'bg-ink text-bg' : 'text-ink-soft hover:text-ink',
              )}
            >
              {item === 'last' ? 'Soʻnggi yil' : item}
            </button>
          ))}
        </div>
      </div>

      <div ref={wrapRef} className="relative mt-5">
        <div ref={scrollRef} className="overflow-x-auto pb-1">
          <div className="inline-block" onMouseLeave={() => setHover(null)}>
            <div className="text-ink-faint relative h-4 text-[10px]" style={{ marginLeft: LABEL_COLUMN + GAP }}>
              {monthLabels.map((label) => (
                <span key={label.column} className="absolute top-0" style={{ left: label.column * STEP }}>
                  {MONTHS_SHORT[label.month]}
                </span>
              ))}
            </div>
            <div className="flex" style={{ gap: GAP }}>
              <div className="text-ink-faint grid text-[10px]" style={{ width: LABEL_COLUMN, gap: GAP, gridTemplateRows: `repeat(7, ${CELL}px)` }}>
                {WEEKDAY_LABELS.map((label, index) => (
                  <span key={index} className="leading-none" style={{ lineHeight: `${CELL}px` }}>
                    {label}
                  </span>
                ))}
              </div>
              {weeks.map((week, column) => (
                <div key={column} className="grid" style={{ gap: GAP, gridTemplateRows: `repeat(7, ${CELL}px)` }}>
                  {week.map((cell) =>
                    cell.visible ? (
                      <span
                        key={cell.key}
                        onMouseEnter={(event) => onEnter(event, cell)}
                        className={cn(
                          'rounded-[2px] transition-shadow',
                          LEVELS[cell.level].className,
                          hover?.cell.key === cell.key ? 'ring-ink/70 ring-1' : '',
                        )}
                        style={{ width: CELL, height: CELL }}
                      />
                    ) : (
                      <span key={cell.key} style={{ width: CELL, height: CELL }} />
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {hover ? (
          <Tooltip x={hover.x} y={hover.y} align={hover.align}>
            <span className="block font-bold">{hover.cell.ms > 0 ? durationLabel(hover.cell.ms) : 'Oʻqilmagan'}</span>
            <span className="block opacity-75">{longDate(hover.cell.date)}</span>
            {marksByDay.get(hover.cell.key) ? (
              <span className="block opacity-75">{marksByDay.get(hover.cell.key)} bet belgilangan</span>
            ) : null}
          </Tooltip>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-ink-faint text-sm">
          {range === 'last' ? 'Soʻnggi yilda' : `${range}-yilda`}:{' '}
          <span className="text-ink font-semibold">{formatDuration(rangeTotal)}</span> ·{' '}
          <span className="text-ink font-semibold">{rangeDays} kun</span> oʻqilgan
        </p>
        <div className="text-ink-faint flex items-center gap-1 text-[11px]">
          <span className="mr-1">Kam</span>
          {LEVELS.map((level) => (
            <span
              key={level.label}
              title={level.label}
              className={cn('rounded-[2px]', level.className)}
              style={{ width: CELL, height: CELL }}
            />
          ))}
          <span className="ml-1">Koʻp</span>
        </div>
      </div>
    </Card>
  )
}

/* Y o'qi uchun "toza" qadam: 4 tadan ko'p chiziq bo'lmasin */
const TICK_STEPS = [5, 10, 15, 30, 60, 120, 180, 240, 360, 480, 720]

function tickLabel(minutes) {
  return minutes === 0 ? '0' : formatDuration(minutes * MINUTE, { short: true })
}

/** So'nggi 30 kun — har bir ustun bir kun */
function Last30Chart({ totals, today }) {
  const [hover, setHover] = useState(null)
  const HEIGHT = 160
  const days = Array.from({ length: 30 }, (_, index) => {
    const date = addDays(today, index - 29)
    const key = dayKey(date)
    return { date, key, ms: totals[key] ?? 0 }
  })
  const maxMinutes = Math.max(...days.map((day) => day.ms)) / MINUTE
  const step = TICK_STEPS.find((value) => maxMinutes / value <= 4) ?? TICK_STEPS.at(-1)
  const top = Math.max(step, Math.ceil(maxMinutes / step) * step)
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, index) => index * step)
  const peak = days.reduce((best, day, index) => (day.ms > (days[best]?.ms ?? 0) ? index : best), -1)
  const barHeight = (ms) => (ms >= MINUTE ? Math.max(2, (ms / MINUTE / top) * HEIGHT) : 0)

  return (
    <Card className="p-6">
      <SectionTitle>Soʻnggi 30 kun</SectionTitle>

      {maxMinutes < 1 ? (
        <p className="text-ink-faint mt-3 text-sm">
          Soʻnggi 30 kunda hali oʻqish vaqti yozilmagan.
        </p>
      ) : (
        <div className="mt-7 flex">
          <div className="relative w-16 flex-none" style={{ height: HEIGHT }}>
            {ticks.map((value) => (
              <span
                key={value}
                className="text-ink-faint absolute right-2.5 text-[10px] whitespace-nowrap tabular-nums"
                style={{ bottom: (value / top) * HEIGHT, transform: 'translateY(50%)' }}
              >
                {tickLabel(value)}
              </span>
            ))}
          </div>

          <div className="min-w-0 flex-1">
            <div className="relative" style={{ height: HEIGHT }} onMouseLeave={() => setHover(null)}>
              {ticks.map((value) => (
                <span
                  key={value}
                  className="bg-line absolute inset-x-0 h-px"
                  style={{ bottom: (value / top) * HEIGHT }}
                />
              ))}

              <div className="absolute inset-0 flex">
                {days.map((day, index) => (
                  <div
                    key={day.key}
                    onMouseEnter={() => setHover(index)}
                    className={cn(
                      'relative flex h-full flex-1 items-end justify-center rounded-t-[4px] transition-colors',
                      hover === index ? 'bg-surface-2/70' : '',
                    )}
                  >
                    {index === peak ? (
                      <span
                        className="text-ink-soft absolute text-[10px] font-semibold whitespace-nowrap tabular-nums"
                        style={{ bottom: barHeight(day.ms) + 4 }}
                      >
                        {formatDuration(day.ms, { short: true })}
                      </span>
                    ) : null}
                    <span
                      className={cn(
                        'mx-[3px] block w-full max-w-[18px] rounded-t-[4px] transition-colors',
                        hover === index ? 'bg-emerald-400' : 'bg-emerald-500',
                      )}
                      style={{ height: barHeight(day.ms) }}
                    />
                  </div>
                ))}
              </div>

              {hover !== null ? (
                <Tooltip
                  x={`${((hover + 0.5) / days.length) * 100}%`}
                  y={HEIGHT - barHeight(days[hover].ms) - (hover === peak ? 16 : 0)}
                  align={hover < 3 ? 'start' : hover > days.length - 4 ? 'end' : 'center'}
                >
                  <span className="block font-bold">
                    {days[hover].ms > 0 ? durationLabel(days[hover].ms) : 'Oʻqilmagan'}
                  </span>
                  <span className="block opacity-75">{longDate(days[hover].date)}</span>
                </Tooltip>
              ) : null}
            </div>

            <div className="text-ink-faint relative mt-2 h-4 text-[10px] tabular-nums">
              {days.map((day, index) =>
                (days.length - 1 - index) % 7 === 0 ? (
                  <span
                    key={day.key}
                    className="absolute -translate-x-1/2 whitespace-nowrap"
                    style={{ left: `${((index + 0.5) / days.length) * 100}%` }}
                  >
                    {index === days.length - 1
                      ? 'Bugun'
                      : `${pad(day.date.getDate())}.${pad(day.date.getMonth() + 1)}`}
                  </span>
                ) : null,
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

/** Kunlar ro'yxati — eng yangisi tepada (kalendar va diagrammaning jadval ko'rinishi) */
function DayList({ totals }) {
  const [showAll, setShowAll] = useState(false)
  const rows = Object.entries(totals)
    .filter(([, ms]) => ms > 0)
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
  const max = rows.reduce((top, [, ms]) => Math.max(top, ms), 0)
  const visible = showAll ? rows : rows.slice(0, 10)

  return (
    <Card className="p-6">
      <SectionTitle>Kunlar</SectionTitle>

      {rows.length === 0 ? (
        <p className="text-ink-faint mt-3 text-sm">Hali oʻqish vaqti yozilmagan.</p>
      ) : (
        <>
          <ul className="divide-line mt-3 divide-y">
            {visible.map(([key, ms]) => {
              const date = parseKey(key)
              return (
                <li key={key} className="flex items-center gap-3 py-2 text-sm">
                  <span className="text-ink w-24 flex-none font-semibold tabular-nums">{shortDate(date)}</span>
                  <span className="text-ink-faint w-24 flex-none">{WEEKDAYS[weekdayIndex(date)]}</span>
                  <span className="bg-surface-2 hidden h-1.5 flex-1 overflow-hidden rounded-full sm:block">
                    <span
                      className="block h-full rounded-full bg-emerald-500"
                      style={{ width: `${(ms / max) * 100}%` }}
                    />
                  </span>
                  <span className="text-ink ml-auto w-36 flex-none text-right font-semibold tabular-nums">
                    {durationLabel(ms)}
                  </span>
                </li>
              )
            })}
          </ul>
          {rows.length > 10 ? (
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Kamroq koʻrsatish' : `Hammasini koʻrsatish (${rows.length} kun)`}
            </Button>
          ) : null}
        </>
      )}
    </Card>
  )
}

export default function ReadingTimeSettings() {
  const totals = useReadingTime()
  const xatm = useXatm()
  const [confirming, setConfirming] = useState(false)
  const [today] = useState(() => startOfDay(Date.now()))
  const stats = readingStats(totals, today)

  /* Kalendar tooltip'i uchun: o'sha kuni nechta bet «o'qildi» deb belgilangan */
  const marksByDay = useMemo(() => {
    const counts = new Map()
    for (const time of Object.values(xatm)) {
      const key = dayKey(time)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }, [xatm])

  function onReset() {
    resetReadingTime()
    setConfirming(false)
  }

  return (
    <div className="space-y-5">
      <TodayCard stats={stats} today={today} />
      <ReadingCalendar totals={totals} marksByDay={marksByDay} today={today} />
      <Last30Chart totals={totals} today={today} />
      <DayList totals={totals} />

      <Card className="p-6">
        <SectionTitle>Oʻqish vaqtini tozalash</SectionTitle>
        <p className="text-ink-faint mt-2 text-sm leading-relaxed">
          Barcha kunlar boʻyicha yozilgan oʻqish vaqti oʻchiriladi va hisob noldan boshlanadi.
          Xatm belgilari va boshqa maʼlumotlarga taʼsir qilmaydi.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {confirming ? (
            <>
              <span className="text-ink text-sm font-semibold">
                {formatDuration(stats.total)} ({stats.readDays} kun) oʻchirilsinmi?
              </span>
              <Button variant="danger" size="sm" onClick={onReset}>
                Ha, tozalash
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                Bekor qilish
              </Button>
            </>
          ) : (
            <Button
              variant="danger"
              size="sm"
              disabled={stats.total === 0}
              onClick={() => setConfirming(true)}
            >
              Barchasini tozalash
            </Button>
          )}
        </div>
      </Card>

      <p className="text-ink-faint text-[13px] leading-relaxed">
        Vaqt faqat sura, sahifa va juz oʻqish sahifalarida hisoblanadi. 1 daqiqa davomida
        sichqoncha, klaviatura yoki scroll harakati boʻlmasa, oʻsha oraliq hisobga kirmaydi;
        oyna yashirilganda hisob toʻxtaydi.
      </p>
    </div>
  )
}
