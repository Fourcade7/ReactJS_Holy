import { useEffect, useState } from 'react'

/*
 * O'qish vaqti: o'qish sahifalarida (sura, sahifa, juz) har kuni o'tkazilgan vaqt, ms —
 * { "2026-10-06": 4380000, … }. Dasturda shunchaki ochiq turgan vaqt hisoblanmaydi:
 * vaqt faqat harakatlar (sichqoncha, klaviatura, scroll) orasidagi oraliqlardan yig'iladi,
 * oraliq IDLE_LIMIT dan uzun bo'lsa — o'qish to'xtagan deb, butunlay tashlab yuboriladi.
 */
const KEY = 'reading-time'
const EVENT = 'reading-time-change'
export const IDLE_LIMIT = 60_000
const SAVE_EVERY = 30_000
/* Sichqoncha harakati juda tez-tez keladi — soniyasiga bir martadan ortig'i kerak emas */
const ACTIVITY_THROTTLE = 1_000
const ACTIVITY_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'scroll', 'touchstart']

const pad = (n) => String(n).padStart(2, '0')

/** Mahalliy sana kaliti: "2026-10-06" */
export function dayKey(time) {
  const date = new Date(time)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function readStored() {
  try {
    const raw = localStorage.getItem(KEY)
    const value = raw ? JSON.parse(raw) : null
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
    return Object.fromEntries(
      Object.entries(value).filter(([, ms]) => typeof ms === 'number' && ms > 0),
    )
  } catch {
    return {}
  }
}

/* Hali localStorage'ga yozilmagan vaqt va joriy o'qish seansi ({ last: so'nggi harakat }) */
let pending = {}
let session = null

/* Oraliqni kunlarga bo'lib qo'shamiz — yarim tundan o'tsa, har kun o'z ulushini oladi */
function credit(from, to) {
  let start = from
  while (start < to) {
    const midnight = new Date(start)
    midnight.setHours(24, 0, 0, 0)
    const end = Math.min(to, midnight.getTime())
    const key = dayKey(start)
    pending[key] = (pending[key] || 0) + (end - start)
    start = end
  }
}

/* So'nggi harakatdan shu paytgacha bo'lgan oraliq: 1 daqiqadan oshmasa — o'qilgan */
function settle(now) {
  if (!session) return
  if (now - session.last <= IDLE_LIMIT) credit(session.last, now)
  session.last = now
}

function markActivity() {
  if (!session) return
  const now = Date.now()
  if (now - session.last < ACTIVITY_THROTTLE) return
  settle(now)
}

function startReading() {
  if (!session) session = { last: Date.now() }
}

function stopReading() {
  if (!session) return
  settle(Date.now())
  session = null
  flushReadingTime()
}

export function flushReadingTime() {
  if (Object.keys(pending).length === 0) return
  const next = readStored()
  for (const [key, ms] of Object.entries(pending)) next[key] = Math.round((next[key] || 0) + ms)
  pending = {}
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* private rejim — eslab qolmasdan davom etamiz */
  }
  window.dispatchEvent(new CustomEvent(EVENT))
}

/** Kunlar bo'yicha jami vaqt (saqlangan + hali yozilmagan) */
export function readingTotals() {
  const totals = readStored()
  for (const [key, ms] of Object.entries(pending)) totals[key] = (totals[key] || 0) + ms
  return totals
}

export function resetReadingTime() {
  pending = {}
  /* joriy seans davom etadi, lekin tozalashdan oldingi oraliq hisobga kirmaydi */
  if (session) session.last = Date.now()
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* e'tiborsiz qoldiramiz */
  }
  window.dispatchEvent(new CustomEvent(EVENT))
}

/**
 * `active` (o'qish sahifasidamiz) bo'lganda vaqtni hisoblaydi. O'qish sahifalari
 * orasida o'tilganda hisob uzilmaydi; oyna yashirilsa (minimize) to'xtaydi.
 */
export function useReadingTracker(active) {
  useEffect(() => {
    if (!active) return
    const listenerOptions = { capture: true, passive: true }
    function onVisibility() {
      if (document.hidden) stopReading()
      else startReading()
    }

    if (!document.hidden) startReading()
    for (const name of ACTIVITY_EVENTS) window.addEventListener(name, markActivity, listenerOptions)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', stopReading)
    const timer = setInterval(flushReadingTime, SAVE_EVERY)

    return () => {
      for (const name of ACTIVITY_EVENTS) window.removeEventListener(name, markActivity, listenerOptions)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', stopReading)
      clearInterval(timer)
      stopReading()
    }
  }, [active])
}

/* `select` jami vaqtlardan kerakli qiymatni oladi; `tickMs` berilsa, shu oraliqda qayta o'qiladi */
function useReadingValue(select, tickMs) {
  const [value, setValue] = useState(() => select(readingTotals()))

  useEffect(() => {
    const update = () => setValue(select(readingTotals()))
    function onStorage(event) {
      if (event.key === KEY || event.key === null) update()
    }
    window.addEventListener(EVENT, update)
    window.addEventListener('storage', onStorage)
    const timer = tickMs ? setInterval(update, tickMs) : null
    return () => {
      window.removeEventListener(EVENT, update)
      window.removeEventListener('storage', onStorage)
      if (timer) clearInterval(timer)
    }
  }, [select, tickMs])

  return value
}

const selectAll = (totals) => totals
const selectToday = (totals) => totals[dayKey(Date.now())] ?? 0

/** Kunlar bo'yicha vaqt */
export function useReadingTime() {
  return useReadingValue(selectAll, 0)
}

/** Bugungi vaqt — o'qish davomida har `tickMs` da yangilanadi (yarim tundan keyin yangi kun) */
export function useTodayReading(tickMs = 15_000) {
  return useReadingValue(selectToday, tickMs)
}

/** 4 980 000 ms → "1 soat 23 daqiqa"; `short` bilan → "1 soat 23 daq" */
export function formatDuration(ms, { short = false } = {}) {
  const minutes = Math.floor((ms || 0) / 60_000)
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  const unit = short ? 'daq' : 'daqiqa'
  if (hours === 0) return `${rest} ${unit}`
  return rest ? `${hours} soat ${rest} ${unit}` : `${hours} soat`
}
