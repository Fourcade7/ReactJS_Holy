import { useEffect, useSyncExternalStore } from 'react'
import { tafsirApi } from '../api/client.js'

/** public/data/tafsir dagi izohlar muallifi — quran.com dagi tarjimasi (#55) izohlaridan */
export const TAFSIR_AUTHOR = 'Shayx Muhammad Sodiq Muhammad Yusuf'

/* Har bir sura tafsiri bir marta yuklanadi: sura raqami → { oyat: matn } */
const loaded = new Map()
const requested = new Set()
const listeners = new Set()

function subscribe(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function load(surahNumber) {
  if (requested.has(surahNumber)) return
  requested.add(surahNumber)
  tafsirApi.surah(surahNumber).then(
    (tafsir) => {
      loaded.set(surahNumber, tafsir)
      for (const listener of listeners) listener()
    },
    /* tarmoq xatosi — keyingi safar qayta urinib ko'ramiz */
    () => requested.delete(surahNumber),
  )
}

/**
 * Oyat tafsiri yoki null. Sura tafsiri birinchi so'ralganda bir marta yuklanadi
 * (shu paytgacha null). surahNumber bo'lmasa hech narsa yuklanmaydi.
 */
export function useAyahTafsir(surahNumber, ayahNumber) {
  useEffect(() => {
    if (surahNumber) load(surahNumber)
  }, [surahNumber])

  return useSyncExternalStore(subscribe, () => loaded.get(surahNumber)?.[ayahNumber] ?? null)
}
