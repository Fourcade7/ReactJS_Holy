import { useEffect, useState } from 'react'
import { surahApi } from '../api/client.js'
import { addReminder, deleteReminder, useReminders } from '../lib/reminders.js'
import { cn } from './Ui.jsx'

/* Sura nomlari bir marta yuklanadi — sarlavha uchun ("Ixlos surasi 1-oyat") */
let surahNamesPromise = null

function surahName(number) {
  surahNamesPromise ??= surahApi
    .list()
    .then((list) => new Map((Array.isArray(list) ? list : []).map((surah) => [surah.number, surah.nameUz])))
    .catch(() => new Map())
  return surahNamesPromise.then((names) => names.get(number) ?? null)
}

/**
 * Oyat tarjimasini «Eslatmalar»ga saqlash (faqat o'zbekcha matn, arabchasiz).
 * Saqlangan oyatda belgi doim ko'rinib turadi; qayta bosilsa eslatmalardan olib tashlanadi.
 * Ota element `group/ayah` bo'lsa, saqlanmagan oyatda belgi faqat hover'da chiqadi.
 * Belgi matnda joy egallamaydi: `relative` ota elementning chap tomonida (right-full) turadi.
 */
export default function AyahReminderButton({ surahNumber, ayahNumber, text, className, style }) {
  const reminders = useReminders()
  const source = `${surahNumber}:${ayahNumber}`
  const saved = reminders.find((item) => item.source === source)
  const [flash, setFlash] = useState(null)

  useEffect(() => {
    if (!flash) return
    const timer = setTimeout(() => setFlash(null), 1600)
    return () => clearTimeout(timer)
  }, [flash])

  async function onClick(event) {
    event.preventDefault()
    event.stopPropagation()
    if (saved) {
      deleteReminder(saved.id)
      setFlash('Eslatmalardan olib tashlandi')
      return
    }
    const name = await surahName(surahNumber)
    addReminder({
      type: 'ayah',
      title: name ? `${name} surasi ${ayahNumber}-oyat` : `${surahNumber}-sura ${ayahNumber}-oyat`,
      text: `${ayahNumber}. ${text}`,
      source,
    })
    setFlash('Eslatmalarga saqlandi')
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={saved ? 'Eslatmalarda saqlangan — olib tashlash uchun bosing' : 'Eslatmalarga saqlash'}
      aria-label={saved ? `${source} oyatini eslatmalardan olib tashlash` : `${source} oyatini eslatmalarga saqlash`}
      aria-pressed={Boolean(saved)}
      style={style}
      className={cn(
        'absolute right-full z-10 flex h-4 w-4 cursor-pointer items-center justify-center transition-[opacity,color] duration-150',
        saved
          ? 'text-accent hover:text-accent-hover'
          : 'text-ink-faint hover:text-accent pointer-events-none opacity-0 group-hover/ayah:pointer-events-auto group-hover/ayah:opacity-100 focus-visible:opacity-100',
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" />
      </svg>
      {flash ? (
        <span className="bg-ink text-bg animate-fade pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 rounded-md px-2 py-1 text-[11px] leading-none font-semibold whitespace-nowrap not-italic">
          {flash}
        </span>
      ) : null}
    </button>
  )
}
