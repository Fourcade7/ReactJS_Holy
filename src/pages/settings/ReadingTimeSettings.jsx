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

const weekdayIndex = (date) => (date.getDay() + 6) % 7

/** 5-oktabr 2026, yakshanba */
function longDate(date) {
  return `${date.getDate()}-${MONTHS[date.getMonth()]} ${date.getFullYear()}, ${WEEKDAYS[weekdayIndex(date)]}`
}

function levelOf(ms) {
  const minutes = Math.floor(ms / MINUTE)
  return LEVELS.reduce((level, item, index) => (minutes >= item.min ? index : level), 0)
}

/* 1 daqiqaga yetmagan vaqt ham ko'rinsin */
function durationLabel(ms) {
  return ms > 0 && ms < MINUTE ? '1 daqiqadan kam' : formatDuration(ms)
}

/** Tozalashni tasdiqlash uchun: jami vaqt va kamida 1 daqiqa o'qilgan kunlar soni */
function readingSummary(totals) {
  const values = Object.values(totals)
  return {
    total: values.reduce((sum, ms) => (ms > 0 ? sum + ms : sum), 0),
    readDays: values.filter((ms) => ms >= MINUTE).length,
  }
}

/* Kalendar katagi tooltip'i: avval qiymat, keyin sana */
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
  const [range, setRange] = useState(() => today.getFullYear())
  const [hover, setHover] = useState(null)
  const wrapRef = useRef(null)
  const scrollRef = useRef(null)

  /* «So'nggi yil» — joriy haftagacha 53 hafta; yil tanlansa — 1-yanvardan 31-dekabrgacha
     (hali kelmagan kunlar xira katak bo'lib ko'rinadi) */
  const weeks = useMemo(() => {
    const first = range === 'last' ? addDays(today, -weekdayIndex(today) - 52 * 7) : new Date(range, 0, 1)
    const last = range === 'last' ? today : new Date(range, 11, 31)
    const gridStart = addDays(first, -weekdayIndex(first))
    const columns = []
    for (let day = gridStart; day <= last || weekdayIndex(day) !== 0; day = addDays(day, 1)) {
      if (weekdayIndex(day) === 0) columns.push([])
      const key = dayKey(day)
      const visible = day >= first && day <= last
      const ms = totals[key] ?? 0
      columns.at(-1).push({ date: day, key, ms, visible, future: day > today, level: levelOf(ms) })
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

  /* Tor oynada: «So'nggi yil»da oxirgi haftalar, yil ko'rinishida bugungi hafta ko'rinib tursin */
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    if (range === 'last') {
      el.scrollLeft = el.scrollWidth
      return
    }
    const todayKey = dayKey(today)
    const column = weeks.findIndex((week) => week.some((cell) => cell.key === todayKey))
    el.scrollLeft = column >= 0 ? Math.max(0, LABEL_COLUMN + GAP + (column + 1) * STEP - el.clientWidth) : 0
  }, [weeks, range, today])

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
                        onMouseEnter={cell.future ? undefined : (event) => onEnter(event, cell)}
                        className={cn(
                          'rounded-[2px] transition-shadow',
                          cell.future ? 'bg-line/40' : LEVELS[cell.level].className,
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

export default function ReadingTimeSettings() {
  const totals = useReadingTime()
  const xatm = useXatm()
  const [confirming, setConfirming] = useState(false)
  const [today] = useState(() => startOfDay(Date.now()))
  const stats = readingSummary(totals)

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
      <ReadingCalendar totals={totals} marksByDay={marksByDay} today={today} />

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
