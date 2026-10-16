import { hadithApi } from '../api/hadith.js'
import { setHadithsRead, toggleHadithRead } from '../lib/hadithMarks.js'
import { formatReadAt } from '../lib/xatm.js'
import { Badge, cn } from './Ui.jsx'

/* Belgilangan hadis / bo'lim kartochkasi va ro'yxat qatori — o'qilgan sura kabi yashil */
export const READ_TILE = 'border-emerald-500/70! bg-emerald-500/[0.07]!'
export const READ_ROW = 'bg-emerald-500/[0.07]!'

/**
 * «O'qildi» doirachasi (suralardagi SurahReadToggle kabi). Link ichida turgani uchun bosilganda
 * sahifa ochilmaydi — faqat belgi almashadi. Kartochkada burchakka qo'yiladi (standart),
 * ro'yxatda qatorning o'z ustunida turadi. partial — bir qismi belgilangan bo'lim.
 * Kitoblar sahifasi (hikmatlar) ham shu tugmani ishlatadi.
 */
export function ToggleButton({ done, partial = false, onToggle, title, label, className }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onToggle()
      }}
      className={cn(
        className ?? 'absolute top-1.5 right-1.5 z-10',
        'flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border transition-colors',
        done
          ? 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600'
          : partial
            ? 'border-emerald-500/60 text-emerald-500/60 hover:border-emerald-500 hover:text-emerald-500'
            : 'border-line text-transparent hover:border-emerald-500/70 hover:text-emerald-500/70',
      )}
      title={title}
      aria-label={label}
      aria-pressed={done}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </button>
  )
}

/** Kitob yoki bo'lim sarlavhasidagi holat — suradagi «12/48 bet o'qildi · 36 ta qoldi» kabi.
    itemName — kitoblarda «hikmat» kabi */
export function ReadStatusBadge({ status, itemName = 'hadis' }) {
  if (!status.read) return null
  return (
    <Badge className="bg-emerald-500/10! text-emerald-500! tabular-nums">
      {status.done
        ? `✓ Toʻliq oʻqildi · ${status.total} ta ${itemName}`
        : `${status.read}/${status.total} ${itemName} oʻqildi · ${status.total - status.read} ta qoldi`}
    </Badge>
  )
}

/** Bitta hadisni o'qildi deb belgilash */
export default function HadithReadToggle({ collectionId, number, readAt, className }) {
  const done = Boolean(readAt)

  return (
    <ToggleButton
      done={done}
      onToggle={() => toggleHadithRead(collectionId, number)}
      title={done ? `Oʻqildi · ${formatReadAt(readAt)} — belgini olib tashlash` : 'Oʻqildi deb belgilash'}
      label={done ? `${number}-hadis belgisini olib tashlash` : `${number}-hadisni oʻqildi deb belgilash`}
      className={className}
    />
  )
}

/**
 * Butun bo'limni o'qildi deb belgilash yoki (hammasi belgilangan bo'lsa) belgilarni olib tashlash —
 * suralar ro'yxatidagi kabi. Bo'lim hadislari bosilganda yuklanadi (bir marta, keyin keshdan).
 */
export function SectionReadToggle({ collectionId, section, status, className }) {
  async function toggle() {
    try {
      const hadiths = await hadithApi.section(collectionId, section.number)
      setHadithsRead(
        collectionId,
        hadiths.map((hadith) => hadith.number),
        !status.done,
      )
    } catch {
      /* bo'lim fayli yuklanmadi — belgi o'zgarmaydi */
    }
  }

  return (
    <ToggleButton
      done={status.done}
      partial={status.read > 0}
      onToggle={toggle}
      title={
        status.done
          ? `Belgilarni olib tashlash (${status.total} ta hadis)`
          : `Butun boʻlimni oʻqildi deb belgilash (${status.total} ta hadis)`
      }
      label={
        status.done
          ? `${section.number}-boʻlim belgilarini olib tashlash`
          : `${section.number}-boʻlimni oʻqildi deb belgilash`
      }
      className={className}
    />
  )
}
