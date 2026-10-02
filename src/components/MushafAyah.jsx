import { Fragment, useEffect, useState } from 'react'
import { loadMushafPage, usePageFont } from '../lib/mushaf.js'
import { cn } from './Ui.jsx'

/**
 * Oyat bo'yicha rejimda arabcha matn sahifa rejimidagi KFGQPC shriftida chiqadi:
 * so'zlar oyat turgan mushaf betidan olinadi (Madina mushafida oyat betdan betga o'tmaydi).
 * Bet topilmasa `fallback` (oddiy Unicode matn) ko'rsatiladi.
 * `lineHeight` berilsa, standart satr oralig'i o'rniga ishlatiladi.
 */
export default function MushafAyah({
  surahNumber,
  ayahNumber,
  pageNumber,
  fallback = null,
  lineHeight,
}) {
  const [words, setWords] = useState(null)
  usePageFont(pageNumber)

  useEffect(() => {
    if (!pageNumber) return
    let cancelled = false
    loadMushafPage(pageNumber)
      .then((page) => {
        if (cancelled) return
        setWords(
          page.lines
            .flatMap((line) => line.words)
            .filter((word) => word.surahNumber === surahNumber && word.ayahNumber === ayahNumber),
        )
      })
      .catch(() => {
        if (!cancelled) setWords([])
      })
    return () => {
      cancelled = true
    }
  }, [pageNumber, surahNumber, ayahNumber])

  if (!pageNumber) return fallback
  /* Yuklanguncha joyni band qilib turamiz — sahifa sakramasligi uchun */
  if (words === null) return <div className="invisible">{fallback}</div>
  if (words.length === 0) return fallback

  return (
    <p className="arabic txt-mushaf-ayah text-ink" style={lineHeight ? { lineHeight } : undefined}>
      {words.map((word, index) => (
        <Fragment key={index}>
          {index > 0 ? ' ' : null}
          <span
            className={cn(
              'hover:text-accent transition-colors duration-150',
              word.charType === 'end' ? 'text-accent' : '',
            )}
            style={{ fontFamily: `"mushaf-p${pageNumber}"` }}
          >
            {word.code}
          </span>
        </Fragment>
      ))}
    </p>
  )
}
