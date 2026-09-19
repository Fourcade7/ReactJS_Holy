import { useEffect, useState } from 'react'
import { pageApi } from '../api/client.js'
import { TranslationFlow } from './Quran.jsx'

const pageCache = new Map()

/**
 * Mushaf beti har doim to'liq chiqadi (oldingi sura oxiri ham), shuning uchun
 * tarjima ham butun bet bo'yicha bo'lishi kerak — faqat joriy sura yoki juz
 * oyatlari emas. Bet yuklanguncha `ayahs` ko'rsatib turiladi.
 */
export default function PageTranslation({ pageNumber, ayahs, surahNumber }) {
  const [loaded, setLoaded] = useState(null)

  useEffect(() => {
    if (!pageNumber || pageCache.has(pageNumber)) return
    let cancelled = false
    pageApi
      .get(pageNumber)
      .then((page) => {
        if (!page?.ayahs?.length) return
        pageCache.set(pageNumber, page.ayahs)
        if (!cancelled) setLoaded({ pageNumber, ayahs: page.ayahs })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [pageNumber])

  const fetched = pageNumber
    ? (pageCache.get(pageNumber) ?? (loaded?.pageNumber === pageNumber ? loaded.ayahs : null))
    : null
  const list = fetched ?? ayahs ?? []
  const segments = []
  for (const ayah of list) {
    const number = ayah.surah?.number ?? surahNumber
    const last = segments.at(-1)
    if (last && last.number === number) last.ayahs.push(ayah)
    else segments.push({ number, surah: ayah.surah, ayahs: [ayah] })
  }

  if (segments.length <= 1) {
    return <TranslationFlow ayahs={list} surahNumber={surahNumber} />
  }

  /* Betda ikki sura bo'lsa, oyat raqamlari aralashmasligi uchun sura nomi bilan ajratamiz */
  return (
    <div className="space-y-4">
      {segments.map((segment) => (
        <div key={segment.number}>
          <div className="text-accent mb-2 flex items-center gap-3 text-[13px] font-semibold">
            <span className="bg-line h-px flex-1" />
            {segment.number}. {segment.surah?.nameUz ?? 'sura'}
            <span className="bg-line h-px flex-1" />
          </div>
          <TranslationFlow ayahs={segment.ayahs} surahNumber={segment.number} />
        </div>
      ))}
    </div>
  )
}
