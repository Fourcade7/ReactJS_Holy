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
 * Saqlangan oyatda belgi to'ldirilgan; qayta bosilsa eslatmalardan olib tashlanadi.
 */
export default function AyahReminderButton({ surahNumber, ayahNumber, text, className }) {
  const reminders = useReminders()
  const source = `${surahNumber}:${ayahNumber}`
  const saved = reminders.find((item) => item.source === source)

  async function onClick() {
    if (saved) {
      deleteReminder(saved.id)
      return
    }
    const name = await surahName(surahNumber)
    addReminder({
      type: 'ayah',
      title: name ? `${name} surasi ${ayahNumber}-oyat` : `${surahNumber}-sura ${ayahNumber}-oyat`,
      text: `${ayahNumber}. ${text}`,
      source,
    })
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={saved ? 'Eslatmalardan olib tashlash uchun bosing' : undefined}
      className={cn(
        'inline-flex cursor-pointer items-center gap-1.5 rounded-md text-[13px] font-semibold transition-colors duration-150',
        'focus-visible:outline-accent focus-visible:outline-2 focus-visible:outline-offset-2',
        saved ? 'text-accent hover:text-accent-hover' : 'text-ink-soft hover:text-accent',
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" />
      </svg>
      {saved ? 'Eslatmalarda saqlangan' : 'Eslatmalarga saqlash'}
    </button>
  )
}
