import { useEffect, useMemo, useRef, useState } from 'react'
import { mushafApi } from '../api/client.js'
import { useAyahHoverByKey } from './Quran.jsx'
import { cn } from './Ui.jsx'

const loadedFonts = new Set()
const BASE_FONT = 28

/** Har bir mushaf sahifasining o'z KFGQPC shrifti bor: p1, p2, … p604 */
function usePageFont(pageNumber) {
  useEffect(() => {
    if (!pageNumber || loadedFonts.has(pageNumber)) return
    const style = document.createElement('style')
    style.dataset.mushafPage = String(pageNumber)
    style.textContent = `@font-face{font-family:"mushaf-p${pageNumber}";src:url("/fonts/hafs/v1/p${pageNumber}.woff2") format("woff2");font-display:block}`
    document.head.appendChild(style)
    loadedFonts.add(pageNumber)
  }, [pageNumber])
}

/* 1- va 2-sahifalar bosma mushafda ham markazga tekislangan */
const CENTERED_PAGES = new Set([1, 2])

function MushafWord({ word, pageNumber }) {
  const verseKey = `${word.surahNumber}:${word.ayahNumber}`
  const { active, onMouseEnter, onMouseLeave } = useAyahHoverByKey(verseKey)

  return (
    <span
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'rounded transition-colors duration-150',
        active ? 'bg-surface-2' : 'bg-transparent',
        word.charType === 'end' ? 'text-accent' : '',
      )}
      style={{ fontFamily: `"mushaf-p${pageNumber}"` }}
    >
      {word.code}
    </span>
  )
}

export default function MushafPage({ pageNumber, fallback = null }) {
  const [page, setPage] = useState(null)
  const [status, setStatus] = useState('loading')
  const [fontSize, setFontSize] = useState(BASE_FONT)
  const containerRef = useRef(null)
  const measureRef = useRef(null)
  usePageFont(pageNumber)

  const centered = useMemo(() => CENTERED_PAGES.has(Number(pageNumber)), [pageNumber])

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    mushafApi
      .page(pageNumber)
      .then((data) => {
        if (cancelled) return
        setPage(data)
        setStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        setPage(null)
        setStatus('missing')
      })
    return () => {
      cancelled = true
    }
  }, [pageNumber])

  /**
   * Mushafda har bir satr betning to'liq enini egallaydi. Shuning uchun shrift
   * o'lchamini eng uzun satr konteynerga sig'adigan qilib hisoblaymiz —
   * aks holda `space-between` so'zlarni bir-biridan uzoqlashtirib yuboradi.
   */
  useEffect(() => {
    if (!page) return
    let cancelled = false

    async function fit() {
      try {
        await document.fonts.load(`${BASE_FONT}px "mushaf-p${pageNumber}"`)
      } catch {
        /* shrift yuklanmasa ham o'lchab ko'ramiz */
      }
      if (cancelled || !containerRef.current || !measureRef.current) return

      const available = containerRef.current.clientWidth
      if (!available) return

      let widest = 0
      for (const node of measureRef.current.children) {
        widest = Math.max(widest, node.getBoundingClientRect().width)
      }
      if (!widest) return

      const target = centered ? available * 0.82 : available
      /* Chegara faqat xavfsizlik uchun — o'lcham satr eniga qarab belgilanadi */
      const next = Math.min(140, Math.max(12, (target / widest) * BASE_FONT))
      setFontSize(next)
    }

    fit()
    const observer = new ResizeObserver(() => fit())
    if (containerRef.current) observer.observe(containerRef.current)
    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [page, pageNumber, centered])

  if (status === 'loading') {
    return (
      <div className="space-y-4 py-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-surface-2 h-7 animate-pulse rounded" />
        ))}
      </div>
    )
  }

  if (status === 'missing' || !page) return fallback

  return (
    <div ref={containerRef} dir="rtl" className="relative select-text">
      {/* o'lchash uchun ko'rinmas nusxa */}
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 h-0 overflow-hidden opacity-0"
        style={{ visibility: 'hidden' }}
      >
        {page.lines.map((line) => (
          <div
            key={line.lineNumber}
            style={{
              fontFamily: `"mushaf-p${pageNumber}"`,
              fontSize: BASE_FONT,
              whiteSpace: 'nowrap',
              display: 'inline-block',
            }}
          >
            {line.words.map((word) => word.code).join(' ')}
          </div>
        ))}
      </div>

      {/* O'lcham satrni konteynerga moslashdan kelib chiqadi: sozlamada matn
          kattalashtirilsa, o'qish ustuni kengayadi va shrift o'zi o'sadi */}
      <div style={{ fontSize }}>
        {page.lines.map((line, lineIndex) => {
          /* Sura tugagan satr bosma mushafda cho'zilmaydi — markazda turadi */
          const nextLine = page.lines[lineIndex + 1]
          const endsSurah =
            nextLine && nextLine.words[0].surahNumber !== line.words.at(-1).surahNumber

          return (
            <div
              key={line.lineNumber}
              className={cn(
                'flex items-center whitespace-nowrap',
                centered || endsSurah ? 'justify-center gap-x-[0.25em]' : 'justify-between',
              )}
              style={{ lineHeight: 2 }}
            >
              {line.words.map((word, index) => (
                <MushafWord
                  key={`${line.lineNumber}-${index}`}
                  word={word}
                  pageNumber={pageNumber}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
