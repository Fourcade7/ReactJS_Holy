import { useEffect, useState } from 'react'

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

export function toArabicNumber(value) {
  return String(value)
    .split('')
    .map((digit) => ARABIC_DIGITS[Number(digit)] ?? digit)
    .join('')
}

/* Ko'rish rejimi tanlovi brauzerda eslab qolinadi */
export function usePref(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      return localStorage.getItem(key) ?? initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, value)
    } catch {
      /* private rejim — eslab qolmasdan davom etamiz */
    }
  }, [key, value])

  return [value, setValue]
}

export function groupByPage(ayahs) {
  const groups = []
  for (const ayah of ayahs) {
    const pageNumber = ayah.pageNumber ?? null
    const last = groups.at(-1)
    if (last && last.pageNumber === pageNumber) {
      last.ayahs.push(ayah)
    } else {
      groups.push({ pageNumber, ayahs: [ayah] })
    }
  }
  return groups
}

export const TEXT_MODES = [
  { value: 'both', label: 'Ikkalasi' },
  { value: 'arabic', label: 'Arabcha' },
  { value: 'translation', label: 'Tarjima' },
]

export const VIEW_MODES = [
  { value: 'ayah', label: 'Oyat boʻyicha' },
  { value: 'page', label: 'Sahifa boʻyicha' },
]
