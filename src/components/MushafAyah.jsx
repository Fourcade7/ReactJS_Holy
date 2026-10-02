import { Fragment, useEffect, useRef, useState } from 'react'
import { loadMushafPage, usePageFont } from '../lib/mushaf.js'
import { cn } from './Ui.jsx'

/* Sahifa rejimi (MushafPage) bilan bir xil o'lcham qoidalari */
const BASE_FONT = 28
const CENTERED_PAGES = new Set([1, 2])
const widestLineCache = new Map()

/** Betning eng uzun satri BASE_FONT o'lchamda necha px — har bir bet bir marta o'lchanadi */
async function measureWidestLine(pageNumber, lines) {
  if (widestLineCache.has(pageNumber)) return widestLineCache.get(pageNumber)
  try {
    await document.fonts.load(`${BASE_FONT}px "mushaf-p${pageNumber}"`)
  } catch {
    /* shrift yuklanmasa ham o'lchab ko'ramiz */
  }
  const probe = document.createElement('div')
  probe.style.cssText = `position:absolute;top:0;left:0;visibility:hidden;white-space:nowrap;font-family:"mushaf-p${pageNumber}";font-size:${BASE_FONT}px`
  document.body.appendChild(probe)
  let widest = 0
  for (const line of lines) {
    /* MushafPage o'lchovi bilan bir xil: so'zlar orasida ingichka probel (U+2009) */
    probe.textContent = line.words.map((word) => word.code).join(' ')
    widest = Math.max(widest, probe.getBoundingClientRect().width)
  }
  probe.remove()
  if (widest) widestLineCache.set(pageNumber, widest)
  return widest
}

/**
 * Oyat bo'yicha rejimda arabcha matn sahifa rejimidagi KFGQPC shriftida chiqadi:
 * so'zlar oyat turgan mushaf betidan olinadi (Madina mushafida oyat betdan betga o'tmaydi).
 * Bet topilmasa `fallback` (oddiy Unicode matn) ko'rsatiladi.
 * `lineHeight` berilsa, standart satr oralig'i o'rniga ishlatiladi.
 * `fitToPage` berilsa, harf o'lchami sahifa rejimidagidek hisoblanadi: betning eng uzun
 * satri ustun eniga sig'adigan o'lcham — shunda ikkala rejimda harflar bir xil bo'ladi.
 */
export default function MushafAyah({
  surahNumber,
  ayahNumber,
  pageNumber,
  fallback = null,
  lineHeight,
  fitToPage = false,
}) {
  const [page, setPage] = useState(null)
  const [fontSize, setFontSize] = useState(null)
  const textRef = useRef(null)
  usePageFont(pageNumber)

  useEffect(() => {
    if (!pageNumber) return
    let cancelled = false
    loadMushafPage(pageNumber)
      .then((data) => {
        if (!cancelled) setPage(data)
      })
      .catch(() => {
        if (!cancelled) setPage({ lines: [] })
      })
    return () => {
      cancelled = true
    }
  }, [pageNumber])

  const words = page
    ? page.lines
        .flatMap((line) => line.words)
        .filter((word) => word.surahNumber === surahNumber && word.ayahNumber === ayahNumber)
    : null

  useEffect(() => {
    if (!fitToPage || !page?.lines.length || !textRef.current) return
    let cancelled = false

    async function fit() {
      const widest = await measureWidestLine(pageNumber, page.lines)
      if (cancelled || !widest || !textRef.current) return
      const available = textRef.current.clientWidth
      if (!available) return
      const target = CENTERED_PAGES.has(Number(pageNumber)) ? available * 0.82 : available
      setFontSize(Math.min(140, Math.max(12, (target / widest) * BASE_FONT)))
    }

    fit()
    const observer = new ResizeObserver(() => fit())
    observer.observe(textRef.current)
    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [fitToPage, page, pageNumber])

  if (!pageNumber) return fallback
  /* Yuklanguncha joyni band qilib turamiz — sahifa sakramasligi uchun */
  if (words === null) return <div className="invisible">{fallback}</div>
  if (words.length === 0) return fallback

  return (
    <p
      ref={textRef}
      className="arabic txt-mushaf-ayah text-ink"
      style={{
        lineHeight: lineHeight || undefined,
        fontSize: fitToPage && fontSize ? fontSize : undefined,
        /* o'lcham hisoblanguncha ko'rsatmaymiz — harflar sakramasligi uchun */
        visibility: fitToPage && !fontSize ? 'hidden' : undefined,
      }}
    >
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
