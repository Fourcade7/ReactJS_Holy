import {
  addReminder,
  deleteReminder,
  hadithReminderSource,
  useReminders,
} from '../lib/reminders.js'
import { cn } from './Ui.jsx'

/* Oyatdagi «Eslatmalarga saqlash» tugmasi bilan bir xil xatcho'p belgisi */
export function BookmarkIcon({ filled = false, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('h-4 w-4', className)}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" />
    </svg>
  )
}

/* Kartada / ro'yxat qatorida: hadis eslatmalarda saqlanganini bildiruvchi belgi (bosilmaydi) */
export function SavedReminderMark({ className }) {
  return (
    <span className={cn('text-accent inline-flex', className)} title="Eslatmalarda saqlangan">
      <BookmarkIcon filled />
      <span className="sr-only">Eslatmalarda saqlangan</span>
    </span>
  )
}

/** Matn: rivoyatchi va o'zbekcha tarjima; tarjimasi yo'q hadisda — arabcha matn */
function reminderText(hadith) {
  if (!hadith.textUz) return hadith.textArabic
  return [hadith.narratorUz, hadith.textUz].filter(Boolean).join('\n')
}

/**
 * Hadisni «Eslatmalar»ga saqlash — oyatdagi AyahReminderButton kabi.
 * Saqlangan hadisda belgi to'ldirilgan; qayta bosilsa eslatmalardan olib tashlanadi.
 */
export default function HadithReminderButton({ collection, hadith, className }) {
  const reminders = useReminders()
  const source = hadithReminderSource(collection.id, hadith.number)
  const saved = reminders.find((item) => item.source === source)
  const range = hadith.numberTo != null ? `${hadith.number}–${hadith.numberTo}` : hadith.number

  function onClick() {
    if (saved) {
      deleteReminder(saved.id)
      return
    }
    addReminder({
      type: 'hadith',
      title: `${collection.nameUz}, ${range}-hadis`,
      text: reminderText(hadith),
      source,
    })
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={saved ? 'Eslatmalardan olib tashlash uchun bosing' : undefined}
      aria-pressed={Boolean(saved)}
      className={cn(
        'inline-flex cursor-pointer items-center gap-1.5 rounded-md text-[13px] font-semibold transition-colors duration-150',
        'focus-visible:outline-accent focus-visible:outline-2 focus-visible:outline-offset-2',
        saved ? 'text-accent hover:text-accent-hover' : 'text-ink-soft hover:text-accent',
        className,
      )}
    >
      <BookmarkIcon filled={Boolean(saved)} />
      {saved ? 'Eslatmalarda saqlangan' : 'Eslatmalarga saqlash'}
    </button>
  )
}
