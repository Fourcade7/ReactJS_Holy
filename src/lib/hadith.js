import { useEffect, useState } from 'react'
import { errorMessage } from '../api/client.js'
import { collectionApi, hadithApi, sectionApi } from '../api/hadith.js'

export const GRADES = {
  sahih: 'Sahih',
  hasan: 'Hasan',
  'hasan-sahih': 'Hasan sahih',
}

/* "Rasululloh sollallohu alayhi va sallamning nevaralari va rayhonlari (sevimlilari) Abu Muhammad…" kabi
   izoh qismi: kichik harfli so'zlar / qavsli izohlar, undan keyin bosh harfli ism boshlanadi */
const PROPHET_ATTRIBUTION =
  /^Rasululloh sollallohu alayhi va sallamning\s+(?:(?:\([^)]*\)|[a-zʻʼ]+)\s+)+(?=[A-Z])/

/**
 * "Abu Hurayra roziyallohu anhudan rivoyat qilinadi." → "Abu Hurayra".
 * To'liq isnod zanjiri bo'lsa ("Menga Molik Nofiʼdan, u …") bo'sh qaytadi — sarlavhaga yaramaydi.
 */
export function narratorName(narratorUz) {
  if (!narratorUz || /^(Menga|Bizga)\s/.test(narratorUz)) return ''
  const cut = narratorUz.search(/\s+roziyallohu\b/)
  const name = cut > 0 ? narratorUz.slice(0, cut) : narratorUz.replace(/\s+rivoyat qil\w*.*$/, '')
  if (/dan, u /.test(name)) return ''
  return name.replace(PROPHET_ATTRIBUTION, '').trim()
}

/**
 * Ro'yxatdagi kartada ko'rsatiladigan qisqa mazmun: "Rasululloh ... dedilar: «" kabi
 * kirish qismi tashlanadi, qolgan matn maxLength gacha qirqiladi.
 */
export function hadithExcerpt(textUz, maxLength = 150) {
  const quote = textUz.indexOf('«')
  const body = quote >= 0 && quote < 120 ? textUz.slice(quote + 1) : textUz
  const clean = body.replace(/[«»“”]/g, '').replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLength) return clean
  return `${clean.slice(0, maxLength).replace(/\s+\S*$/, '')}…`
}

/** Bo'lim nomi: o'zbekcha bo'lmasa inglizcha, u ham bo'lmasa raqam */
export function sectionTitle(section) {
  return section.nameUz || section.nameEn || `${section.number}-boʻlim`
}

/**
 * Natija qaysi kalitga (kitob / bo'lim) tegishli ekani saqlanadi — kalit almashganda eski
 * natija ko'rinmaydi, yuklash tugaguncha `loading` true bo'ladi.
 */
function useKeyed(key, load) {
  const [result, setResult] = useState({ key: null })

  useEffect(() => {
    let cancelled = false
    load()
      .then((value) => {
        if (!cancelled) setResult({ key, value })
      })
      .catch((error) => {
        if (!cancelled) setResult({ key, error: errorMessage(error) })
      })
    return () => {
      cancelled = true
    }
    // load faqat key ga bog'liq
    // oxlint-disable-next-line react/exhaustive-deps
  }, [key])

  const current = result.key === key ? result : null
  return { value: current?.value ?? null, error: current?.error ?? '', loading: current === null }
}

/** Kitob va uning bo'limlari ro'yxati */
export function useCollection(id) {
  const { value, error, loading } = useKeyed(id, async () => {
    const [collection, sections] = await Promise.all([collectionApi.get(id), sectionApi.list(id)])
    return { collection, sections }
  })
  return {
    collection: value?.collection ?? null,
    sections: value?.sections ?? null,
    error,
    loading,
  }
}

/** Bitta bo'limdagi hadislar */
export function useSectionHadiths(id, sectionNumber) {
  const { value, error, loading } = useKeyed(`${id}/${sectionNumber}`, () =>
    hadithApi.section(id, sectionNumber),
  )
  return { hadiths: value, error, loading }
}
