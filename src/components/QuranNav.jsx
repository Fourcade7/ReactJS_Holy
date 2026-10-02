import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { surahApi } from '../api/client.js'
import { cn } from './Ui.jsx'

const TABS = [
  { value: 'surah', label: 'Sura' },
  { value: 'verse', label: 'Oyat' },
  { value: 'juz', label: 'Juz' },
  { value: 'page', label: 'Sahifa' },
]

const JUZ_LIST = Array.from({ length: 30 }, (_, index) => index + 1)
const PAGE_LIST = Array.from({ length: 604 }, (_, index) => index + 1)

export default function QuranNav() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('surah')
  const [query, setQuery] = useState('')
  const [surahs, setSurahs] = useState([])
  const [pickedSurah, setPickedSurah] = useState(null)
  const panelRef = useRef(null)
  const searchRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    surahApi
      .list()
      .then(setSurahs)
      .catch(() => setSurahs([]))
  }, [])

  useEffect(() => {
    function onKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((prev) => !prev)
      }
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!open) return
    function onClick(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    searchRef.current?.focus()
    return () => document.removeEventListener('mousedown', onClick)
  }, [open, tab])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  const currentLabel = useMemo(() => {
    const surahMatch = location.pathname.match(/^\/surah\/(\d+)/)
    if (surahMatch) {
      const surah = surahs.find((item) => item.number === Number(surahMatch[1]))
      return surah ? `${surah.number}. ${surah.nameUz}` : `${surahMatch[1]}-sura`
    }
    const pageMatch = location.pathname.match(/^\/page\/(\d+)/)
    if (pageMatch) return `${pageMatch[1]}-sahifa`
    const juzMatch = location.pathname.match(/^\/juz\/(\d+)/)
    if (juzMatch) return `${juzMatch[1]}-juz`
    return "Qur'on boʻylab oʻtish"
  }, [location.pathname, surahs])

  const filteredSurahs = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q || (tab !== 'surah' && tab !== 'verse')) return surahs
    return surahs.filter(
      (surah) =>
        String(surah.number).includes(q) ||
        surah.nameUz.toLowerCase().includes(q) ||
        (surah.meaningUz || '').toLowerCase().includes(q),
    )
  }, [surahs, query, tab])

  const filteredNumbers = useMemo(() => {
    const source = tab === 'juz' ? JUZ_LIST : PAGE_LIST
    const q = query.trim()
    if (!q) return source
    return source.filter((item) => String(item).includes(q))
  }, [tab, query])

  const verseNumbers = useMemo(() => {
    if (!pickedSurah) return []
    const total = pickedSurah.totalAyahs || pickedSurah.savedAyahs || 0
    return Array.from({ length: total }, (_, index) => index + 1)
  }, [pickedSurah])

  function go(path) {
    navigate(path)
    setOpen(false)
    setQuery('')
  }

  function switchTab(next) {
    setTab(next)
    setQuery('')
    if (next !== 'verse') setPickedSurah(null)
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="text-ink hover:bg-surface-2 flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm font-bold transition-colors"
      >
        {currentLabel}
        <svg
          viewBox="0 0 24 24"
          className={cn('h-3.5 w-3.5 transition-transform', open ? '' : 'rotate-180')}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>

      {open ? (
        <div className="bg-surface border-line animate-rise absolute top-full left-0 z-50 mt-2 w-[min(92vw,460px)] rounded-md border p-4 shadow-2xl">
          <div className="flex items-center gap-2">
            <div className="bg-surface-2 border-line flex flex-1 items-center gap-0.5 rounded-md border p-0.5">
              {TABS.map((item) => (
                <button
                  key={item.value}
                  onClick={() => switchTab(item.value)}
                  className={cn(
                    'flex-1 cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
                    tab === item.value
                      ? 'bg-ink text-bg'
                      : 'text-ink-soft hover:text-ink',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Yopish"
              className="text-ink-faint hover:text-ink flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors"
            >
              ✕
            </button>
          </div>

          <p className="text-ink-faint mt-3 flex items-center gap-2 text-xs italic">
            Maslahat: tezkor ochish uchun
            <kbd className="bg-surface-2 border-line text-ink-soft rounded-md border px-1.5 py-0.5 text-[11px] not-italic">
              ctrl K
            </kbd>
          </p>

          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              tab === 'juz'
                ? 'Juz qidirish…'
                : tab === 'page'
                  ? 'Sahifa qidirish…'
                  : 'Sura qidirish…'
            }
            className="bg-surface-2 border-line text-ink placeholder:text-ink-faint focus:border-accent mt-3 w-full rounded-md border px-3.5 py-2.5 text-sm focus:outline-none"
          />

          {tab === 'verse' ? (
            <div className="mt-3 grid grid-cols-[1.6fr_1fr] gap-2">
              <div className="max-h-[46vh] overflow-y-auto pr-1">
                {filteredSurahs.map((surah) => (
                  <button
                    key={surah.id}
                    onClick={() => setPickedSurah(surah)}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
                      pickedSurah?.id === surah.id
                        ? 'bg-surface-2 text-ink font-bold'
                        : 'text-ink-soft hover:bg-surface-2/60 hover:text-ink',
                    )}
                  >
                    <span className="text-ink-faint w-5 flex-none text-[13px]">
                      {surah.number}
                    </span>
                    <span className="truncate">{surah.nameUz}</span>
                  </button>
                ))}
              </div>

              <div className="max-h-[46vh] overflow-y-auto pr-1">
                {pickedSurah ? (
                  verseNumbers.length > 0 ? (
                    verseNumbers.map((verse) => (
                      <button
                        key={verse}
                        onClick={() => go(`/surah/${pickedSurah.number}#ayah-${verse}`)}
                        className="text-ink-soft hover:bg-surface-2/60 hover:text-ink w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm transition-colors"
                      >
                        {verse}
                      </button>
                    ))
                  ) : (
                    <p className="text-ink-faint px-3 py-2 text-xs">
                      Bu surada oyatlar soni koʻrsatilmagan
                    </p>
                  )
                ) : (
                  <p className="text-ink-faint px-3 py-2 text-xs">Avval surani tanlang</p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-3 max-h-[46vh] overflow-y-auto pr-1">
              {tab === 'surah'
                ? filteredSurahs.map((surah) => (
                    <button
                      key={surah.id}
                      onClick={() => go(`/surah/${surah.number}`)}
                      className="text-ink-soft hover:bg-surface-2/60 hover:text-ink flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors"
                    >
                      <span className="text-ink-faint w-5 flex-none text-[13px]">
                        {surah.number}
                      </span>
                      <span className="truncate">{surah.nameUz}</span>
                      <span className="arabic text-ink-faint ml-auto flex-none text-sm">
                        {surah.nameArabic}
                      </span>
                    </button>
                  ))
                : filteredNumbers.map((item) => (
                    <button
                      key={item}
                      onClick={() => go(tab === 'juz' ? `/juz/${item}` : `/page/${item}`)}
                      className="text-ink-soft hover:bg-surface-2/60 hover:text-ink w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm transition-colors"
                    >
                      {tab === 'juz' ? `${item}-juz` : `${item}-sahifa`}
                    </button>
                  ))}

              {tab === 'surah' && filteredSurahs.length === 0 ? (
                <p className="text-ink-faint px-3 py-3 text-xs">Sura topilmadi</p>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
