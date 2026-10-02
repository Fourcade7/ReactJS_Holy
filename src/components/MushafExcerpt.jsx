import { useEffect, useMemo, useState } from 'react'
import { pageApi } from '../api/client.js'
import MushafPage from './MushafPage.jsx'
import { AyahHoverScope, TranslationFlow } from './Quran.jsx'
import { Card, cn } from './Ui.jsx'

/**
 * Mushaf betidan bir yoki bir necha oyat — kitobdagi satrlari va o'rni bilan,
 * ostida o'zbekcha tarjimasi. Bosh sahifadagi doimiy tablar (Oyatal Kursiy va h.k.) uchun.
 */
export default function MushafExcerpt({ surah, ayahs, pageNumber, caption, className }) {
  const [translations, setTranslations] = useState([])
  const verses = useMemo(() => ayahs.map((ayah) => `${surah}:${ayah}`), [surah, ayahs])

  useEffect(() => {
    let cancelled = false
    pageApi
      .get(pageNumber)
      .then((page) => {
        if (cancelled) return
        setTranslations(
          (page?.ayahs ?? []).filter(
            (ayah) =>
              (ayah.surah?.number ?? ayah.surahId) === surah && ayahs.includes(ayah.numberInSurah),
          ),
        )
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [surah, ayahs, pageNumber])

  return (
    <AyahHoverScope>
      <Card className={cn('animate-fade px-4 py-4 sm:px-6', className)}>
        {caption ? <p className="text-ink-faint mb-2 text-center text-xs">{caption}</p> : null}
        <MushafPage pageNumber={pageNumber} verses={verses} />
        {translations.length > 0 ? (
          <div className="border-line mt-4 border-t pt-4">
            <TranslationFlow ayahs={translations} surahNumber={surah} />
          </div>
        ) : null}
      </Card>
    </AyahHoverScope>
  )
}
