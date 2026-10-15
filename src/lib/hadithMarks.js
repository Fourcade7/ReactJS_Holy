import { useEffect, useState } from 'react'

/* O'qildi deb belgilangan hadislar: { "bukhari:1": 1758300000000, … }.
   Hadis raqamlari har bir kitob ichida yagona — kalit «kitob:raqam».
   Xatm va statistikaga qo'shilmaydi — faqat belgi */
const KEY = 'read-hadiths'
const EVENT = 'read-hadiths-change'

export const hadithKey = (collectionId, number) => `${collectionId}:${number}`

function readMarks() {
  try {
    const raw = localStorage.getItem(KEY)
    const value = raw ? JSON.parse(raw) : null
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch {
    return {}
  }
}

function writeMarks(value) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    /* private rejim — eslab qolmasdan davom etamiz */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: value }))
}

/** Hadisni o'qildi deb belgilaydi yoki belgini olib tashlaydi */
export function toggleHadithRead(collectionId, number) {
  const key = hadithKey(collectionId, number)
  const next = { ...readMarks() }
  if (next[key]) delete next[key]
  else next[key] = Date.now()
  writeMarks(next)
}

/** Bir nechta hadisni birdan belgilaydi (read=true) yoki belgisini olib tashlaydi.
    Allaqachon belgilanganlarining sanasi saqlanib qoladi */
export function setHadithsRead(collectionId, numbers, read) {
  const next = { ...readMarks() }
  const now = Date.now()
  for (const number of numbers) {
    const key = hadithKey(collectionId, number)
    if (!read) delete next[key]
    else if (!next[key]) next[key] = now
  }
  writeMarks(next)
}

/** Kitobda belgilangan hadis raqamlari — o'sish tartibida (bo'limlar bo'yicha sanash uchun) */
export function markedNumbers(marks, collectionId) {
  const prefix = `${collectionId}:`
  return Object.keys(marks)
    .filter((key) => key.startsWith(prefix))
    .map((key) => Number(key.slice(prefix.length)))
    .sort((a, b) => a - b)
}

/* Tartiblangan massivda value dan kichik bo'lmagan birinchi element o'rni */
function lowerBound(sorted, value) {
  let low = 0
  let high = sorted.length
  while (low < high) {
    const middle = (low + high) >> 1
    if (sorted[middle] < value) low = middle + 1
    else high = middle
  }
  return low
}

/**
 * Bo'lim holati: { read, total, done }. Bo'limning hadislari sections.json dagi ranges
 * oraliqlarida — ular boshqa bo'lim hadislarini o'z ichiga olmaydi (Termiziyda bo'limlar aralash).
 */
export function sectionReadStatus(numbers, section) {
  const ranges = section.ranges ?? [[section.firstHadith, section.lastHadith]]
  const read = ranges.reduce(
    (sum, [from, to]) => sum + lowerBound(numbers, to + 1) - lowerBound(numbers, from),
    0,
  )
  return { read, total: section.totalHadiths, done: read >= section.totalHadiths }
}

/** Butun kitob holati: { read, total, done } */
export function collectionReadStatus(marks, collection) {
  const prefix = `${collection.id}:`
  const read = Object.keys(marks).filter((key) => key.startsWith(prefix)).length
  return { read, total: collection.totalHadiths, done: read >= collection.totalHadiths }
}

/** «12/148 hadis oʻqildi» yoki «✓ Oʻqildi» */
export function readStatusLabel(status) {
  return status.done ? '✓ Oʻqildi' : `${status.read}/${status.total} hadis oʻqildi`
}

export function useHadithMarks() {
  const [value, setValue] = useState(readMarks)

  useEffect(() => {
    function onChange(event) {
      setValue(event.detail ?? {})
    }
    /* boshqa oynada o'zgarsa ham yangilanadi */
    function onStorage(event) {
      if (event.key === KEY || event.key === null) setValue(readMarks())
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
