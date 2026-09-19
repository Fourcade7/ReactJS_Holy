import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { mushafApi, surahApi } from '../api/client.js'
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
const LINES_PER_PAGE = 15
/* Median enining 75% dan qisqa satr markazga qo'yiladi (butun Qur'onda 602:15, 604:14, 604:15) */
const SHORT_LINE_RATIO = 0.75

let surahsPromise = null

/** Sura nomlari sarlavha uchun kerak — ro'yxat bir marta yuklanadi */
function useSurahNames() {
  const [surahs, setSurahs] = useState([])
  useEffect(() => {
    let cancelled = false
    surahsPromise ??= surahApi.list().catch(() => {
      surahsPromise = null
      return []
    })
    surahsPromise.then((list) => {
      if (!cancelled) setSurahs(Array.isArray(list) ? list : [])
    })
    return () => {
      cancelled = true
    }
  }, [])
  return surahs
}

/**
 * Mushaf JSON'ida sura sarlavhasi va basmala satrlari yo'q — ularning o'rnida
 * satr raqamlari tushib qolgan. Shu bo'shliqlarni topib, har biriga nima
 * qo'yilishini aniqlaymiz.
 */
function buildRows(lines, centered) {
  const byNumber = new Map(lines.map((line) => [line.lineNumber, line]))
  const lastLine = lines.at(-1)?.lineNumber ?? 0
  const total = centered ? lastLine : Math.max(LINES_PER_PAGE, lastLine)
  const rows = []

  for (let number = 1; number <= total; number += 1) {
    const line = byNumber.get(number)
    if (line) {
      rows.push({ type: 'line', line })
      continue
    }

    let end = number
    while (end < total && !byNumber.has(end + 1)) end += 1
    const length = end - number + 1
    const next = lines.find((item) => item.lineNumber > end)

    if (!next) {
      /* Bet oxirida faqat keyingi suraning sarlavhasi turadi, basmala keyingi betda */
      const surah = (lines.at(-1)?.words.at(-1)?.surahNumber ?? 0) + 1
      if (surah <= 114) rows.push({ type: 'header', surah, key: `h-${number}` })
    } else {
      const surah = next.words[0].surahNumber
      /* Fotihada basmala 1-oyatning o'zi, Tavbada esa basmala yo'q */
      const hasBasmala = surah !== 1 && surah !== 9
      if (length === 1 && number === 1 && hasBasmala) {
        /* Sarlavha oldingi betning oxirida qolgan */
        rows.push({ type: 'basmala', key: `b-${number}` })
      } else {
        rows.push({ type: 'header', surah, key: `h-${number}` })
        if (length >= 2 && hasBasmala) rows.push({ type: 'basmala', key: `b-${number}` })
      }
    }
    number = end
  }

  return rows
}

/* Sakkiz yaproqli gul — ramkaning yon panellari markazida turadi */
function Rosette({ x }) {
  return (
    <g transform={`translate(${x} 40)`}>
      <circle r="23" style={{ fill: 'var(--color-surface)' }} stroke="currentColor" strokeWidth="1.4" />
      <circle r="19" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.6" />
      {Array.from({ length: 8 }).map((_, index) => (
        <ellipse
          key={index}
          cy="-9"
          rx="3.6"
          ry="8.5"
          fill="currentColor"
          opacity={index % 2 ? 0.45 : 0.8}
          transform={`rotate(${index * 45})`}
        />
      ))}
      <circle r="3.4" style={{ fill: 'var(--color-surface)' }} stroke="currentColor" strokeWidth="1.2" />
    </g>
  )
}

/**
 * Bosma mushafdagi kabi naqshli sura sarlavhasi. Nom ham SVG ichida chiziladi,
 * shuning uchun u doim ramka bilan birga kattalashadi va undan chiqib ketmaydi.
 * Nom KFGQPC "surah-names" shriftida: "018 surah" ligaturasi «سورة الكهف» bo'ladi.
 */
function SurahHeader({ surah, name }) {
  const id = useId().replace(/:/g, '')
  const cartouche =
    'M318 40 C346 40 356 10 388 10 L612 10 C644 10 654 40 682 40 C654 40 644 70 612 70 L388 70 C356 70 346 40 318 40 Z'

  return (
    <div className="py-[0.35em]">
      <svg
        viewBox="-12 0 1024 80"
        className="text-accent block h-auto w-full"
        role="img"
        aria-label={name ? `سورة ${name}` : `${surah}-sura`}
      >
        <defs>
          <pattern id={`lattice-${id}`} x="0" y="10" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M10 2.5 L17.5 10 L10 17.5 L2.5 10 Z" fill="none" stroke="currentColor" strokeWidth="0.9" />
            <path d="M10 7 L13 10 L10 13 L7 10 Z" fill="currentColor" opacity="0.55" />
            <circle cx="0" cy="0" r="1.6" fill="currentColor" />
            <circle cx="20" cy="0" r="1.6" fill="currentColor" />
            <circle cx="0" cy="20" r="1.6" fill="currentColor" />
            <circle cx="20" cy="20" r="1.6" fill="currentColor" />
          </pattern>
        </defs>

        {/* tashqi va ichki hoshiya */}
        <rect x="2" y="3" width="996" height="74" rx="7" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="1.8" />
        <rect x="9" y="10" width="982" height="60" rx="4" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.7" />

        {/* yon panellardagi geometrik naqsh */}
        <rect x="9" y="10" width="982" height="60" rx="4" fill={`url(#lattice-${id})`} opacity="0.4" />

        {/* chetlardagi bargchalar */}
        {[2, 998].map((cx) => (
          <g key={cx} transform={`translate(${cx} 40)`}>
            <path d="M0 -14 L10 0 L0 14 L-10 0 Z" style={{ fill: 'var(--color-surface)' }} stroke="currentColor" strokeWidth="1.4" />
            <path d="M0 -7 L5 0 L0 7 L-5 0 Z" fill="currentColor" />
          </g>
        ))}

        <Rosette x={166} />
        <Rosette x={834} />

        {/* o'rtadagi nom yoziladigan medalyon */}
        <path d={cartouche} style={{ fill: 'var(--color-surface)' }} stroke="currentColor" strokeWidth="1.8" />
        <path
          d={cartouche}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          opacity="0.7"
          transform="translate(500 40) scale(0.94 0.82) translate(-500 -40)"
        />
        {[318, 682].map((cx) => (
          <circle key={cx} cx={cx} cy="40" r="3.2" fill="currentColor" />
        ))}

        <text
          x="500"
          y="40"
          textAnchor="middle"
          dominantBaseline="central"
          direction="ltr"
          fontSize="48"
          style={{ fontFamily: '"surah-names"', fill: 'var(--color-ink)' }}
        >
          {/* ligaturalar chapdan o'ngga terilgani uchun nom oldin, "surah" keyin yoziladi */}
          {`${String(surah).padStart(3, '0')} surah`}
        </text>
      </svg>
    </div>
  )
}

/* Basmala 1-betdagi Fotihaning 1-oyati — o'sha sahifa shriftidagi glifdan olinadi,
   shunda u boshqa satrlar bilan bir xil mushaf uslubida chiqadi */
const BASMALA_CODES = ['ﭑ', 'ﭒ', 'ﭓ', 'ﭔ']

function Basmala() {
  usePageFont(1)

  return (
    <div className="pb-[0.3em] text-center">
      <div
        className="text-ink flex items-center justify-center gap-x-[0.25em] whitespace-nowrap"
        style={{ fontFamily: '"mushaf-p1"', lineHeight: 2 }}
      >
        {BASMALA_CODES.map((code) => (
          <span key={code}>{code}</span>
        ))}
      </div>
      <div
        dir="ltr"
        className="text-ink-faint font-sans"
        style={{ fontSize: 'clamp(11px, 0.32em, 14px)', lineHeight: 1.5 }}
      >
        Mehribon va Rahmli Allohning nomi bilan boshlayman
      </div>
    </div>
  )
}

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
  const [shortLines, setShortLines] = useState([])
  const containerRef = useRef(null)
  const measureRef = useRef(null)
  usePageFont(pageNumber)
  const surahs = useSurahNames()

  const centered = useMemo(() => CENTERED_PAGES.has(Number(pageNumber)), [pageNumber])
  const rows = useMemo(() => (page ? buildRows(page.lines, centered) : []), [page, centered])

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    mushafApi
      .page(pageNumber)
      .then((data) => {
        if (cancelled) return
        setPage(data)
        setShortLines([])
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

      const widths = [...measureRef.current.children].map(
        (node) => node.getBoundingClientRect().width,
      )
      const widest = Math.max(0, ...widths)
      if (!widest) return

      const target = centered ? available * 0.82 : available
      /* Chegara faqat xavfsizlik uchun — o'lcham satr eniga qarab belgilanadi */
      const next = Math.min(140, Math.max(12, (target / widest) * BASE_FONT))
      setFontSize(next)

      /* Bosma mushafda qisqa satrlar (masalan, 604-betdagi Nos oxiri) cho'zilmaydi,
         markazda turadi. Betning median eniga nisbatan o'lchaymiz — bitta uzun
         satr (443-bet kabi) qolganlarini "qisqa" qilib ko'rsatmasligi uchun. */
      const median = [...widths].sort((a, b) => a - b)[Math.floor(widths.length / 2)]
      const short = page.lines
        .filter((_, index) => widths[index] < median * SHORT_LINE_RATIO)
        .map((line) => line.lineNumber)
      setShortLines((prev) =>
        prev.length === short.length && prev.every((n, i) => n === short[i]) ? prev : short,
      )
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
        {rows.map((row) => {
          if (row.type === 'header') {
            return (
              <SurahHeader
                key={row.key}
                surah={row.surah}
                name={surahs.find((item) => item.number === row.surah)?.nameArabic}
              />
            )
          }
          if (row.type === 'basmala') return <Basmala key={row.key} />

          const { line } = row
          const lineIndex = page.lines.indexOf(line)
          /* Sura tugagan satr bosma mushafda cho'zilmaydi — markazda turadi */
          const nextLine = page.lines[lineIndex + 1]
          const endsSurah =
            nextLine && nextLine.words[0].surahNumber !== line.words.at(-1).surahNumber

          return (
            <div
              key={line.lineNumber}
              className={cn(
                'flex items-center whitespace-nowrap',
                centered || endsSurah || shortLines.includes(line.lineNumber)
                  ? 'justify-center gap-x-[0.25em]'
                  : 'justify-between',
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
