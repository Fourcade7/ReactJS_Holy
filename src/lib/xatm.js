import { useEffect, useState } from 'react'

/* Xatm: qaysi bet qachon o'qildi deb belgilangan — { "293": 1758300000000, … } */
const KEY = 'xatm-read-pages'
const EVENT = 'xatm-change'
/* Xatm boshlangan vaqt — birinchi bet belgilanganda yoziladi, tozalanganda o'chadi */
const START_KEY = 'xatm-started-at'

export const TOTAL_PAGES = 604

/* Har bir sura egallagan betlar [birinchi, oxirgi] — Madina mushafi, 1-sura 0-indeksda */
const SURAH_PAGES = [
  [1, 1], [2, 49], [50, 76], [77, 106], [106, 127], [128, 150],
  [151, 176], [177, 186], [187, 207], [208, 221], [221, 235], [235, 248],
  [249, 255], [255, 261], [262, 267], [267, 281], [282, 293], [293, 304],
  [305, 312], [312, 321], [322, 331], [332, 341], [342, 349], [350, 359],
  [359, 366], [367, 376], [377, 385], [385, 396], [396, 404], [404, 410],
  [411, 414], [415, 417], [418, 427], [428, 434], [434, 440], [440, 445],
  [446, 452], [453, 458], [458, 467], [467, 476], [477, 482], [483, 489],
  [489, 495], [496, 498], [499, 502], [502, 506], [507, 510], [511, 515],
  [515, 517], [518, 520], [520, 523], [523, 525], [526, 528], [528, 531],
  [531, 534], [534, 537], [537, 541], [542, 545], [545, 548], [549, 551],
  [551, 552], [553, 554], [554, 555], [556, 557], [558, 559], [560, 561],
  [562, 564], [564, 566], [566, 568], [568, 570], [570, 571], [572, 573],
  [574, 575], [575, 577], [577, 578], [578, 580], [580, 581], [582, 583],
  [583, 584], [585, 585], [586, 586], [587, 587], [587, 589], [589, 589],
  [590, 590], [591, 591], [591, 592], [592, 592], [593, 594], [594, 594],
  [595, 595], [595, 596], [596, 596], [596, 596], [597, 597], [597, 597],
  [598, 598], [598, 599], [599, 599], [599, 600], [600, 600], [600, 600],
  [601, 601], [601, 601], [601, 601], [602, 602], [602, 602], [602, 602],
  [603, 603], [603, 603], [603, 603], [604, 604], [604, 604], [604, 604],
]

export function surahPageRange(surahNumber) {
  return SURAH_PAGES[surahNumber - 1] ?? null
}

/**
 * Sura holati betlar belgisidan hisoblanadi — alohida saqlanmaydi, shuning uchun
 * Sahifalar, Suralar va Sozlamalar doim bir xil holatni ko'rsatadi.
 */
export function surahXatmStatus(xatm, surahNumber) {
  const range = surahPageRange(surahNumber)
  if (!range) return null
  const [from, to] = range
  let read = 0
  for (let page = from; page <= to; page += 1) if (xatm[page]) read += 1
  return { from, to, total: to - from + 1, read, done: read === to - from + 1 }
}

/** Surani to'liq o'qildi deb belgilaydi yoki (hammasi belgilangan bo'lsa) belgilarni olib tashlaydi */
export function toggleXatmSurah(surahNumber) {
  const status = surahXatmStatus(readXatm(), surahNumber)
  if (!status) return
  /* allaqachon belgilangan betlarning sanasi saqlanib qoladi */
  setXatmRange(status.from, status.to, !status.done, { keepExisting: true })
}

export function readXatm() {
  try {
    const raw = localStorage.getItem(KEY)
    const value = raw ? JSON.parse(raw) : null
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch {
    return {}
  }
}

function readStartedAt() {
  try {
    const value = Number(localStorage.getItem(START_KEY))
    return value > 0 ? value : null
  } catch {
    return null
  }
}

/**
 * Xatm qachon boshlangan: saqlangan vaqt, u bo'lmasa (eski belgilar uchun) eng birinchi belgi.
 * Belgi yo'q bo'lsa — null.
 */
export function xatmStartedAt(xatm) {
  const times = Object.values(xatm)
  if (times.length === 0) return null
  return readStartedAt() ?? Math.min(...times)
}

/** Oxirgi belgilangan bet: [betRaqami, vaqt]. Bir vaqtda belgilanganlardan eng kattasi. */
export function lastXatmMark(xatm) {
  return Object.entries(xatm).reduce(
    (best, entry) =>
      !best || entry[1] > best[1] || (entry[1] === best[1] && Number(entry[0]) > Number(best[0]))
        ? entry
        : best,
    null,
  )
}

function writeXatm(value) {
  try {
    if (Object.keys(value).length === 0) {
      localStorage.removeItem(START_KEY)
    } else if (!readStartedAt()) {
      /* birinchi belgi (yoki boshlanish vaqti hali yozilmagan eski belgilar) */
      const times = [...Object.values(readXatm()), ...Object.values(value)]
      localStorage.setItem(START_KEY, String(Math.min(...times)))
    }
    localStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    /* private rejim — eslab qolmasdan davom etamiz */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: value }))
}

/** Betni o'qildi deb belgilaydi yoki belgini olib tashlaydi */
export function toggleXatmPage(pageNumber) {
  const current = readXatm()
  const next = { ...current }
  if (next[pageNumber]) delete next[pageNumber]
  else next[pageNumber] = Date.now()
  writeXatm(next)
}

/** from–to oralig'idagi betlarni belgilaydi (read=true) yoki belgisini olib tashlaydi */
export function setXatmRange(from, to, read, { keepExisting = false } = {}) {
  const next = { ...readXatm() }
  const now = Date.now()
  for (let page = from; page <= to; page += 1) {
    if (read) {
      if (!(keepExisting && next[page])) next[page] = now
    } else delete next[page]
  }
  writeXatm(next)
}

export function resetXatm() {
  try {
    localStorage.removeItem(KEY)
    localStorage.removeItem(START_KEY)
  } catch {
    /* e'tiborsiz qoldiramiz */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: {} }))
}

export function useXatm() {
  const [value, setValue] = useState(() => readXatm())

  useEffect(() => {
    function onChange(event) {
      setValue(event.detail ?? {})
    }
    /* boshqa oynada o'zgarsa ham yangilanadi */
    function onStorage(event) {
      if (event.key === KEY || event.key === null) setValue(readXatm())
    }
    window.addEventListener(EVENT, onChange)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(EVENT, onChange)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return value
}

const pad = (n) => String(n).padStart(2, '0')

/** 19.09.2026 22:05 */
export function formatReadAt(timestamp) {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ''
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
