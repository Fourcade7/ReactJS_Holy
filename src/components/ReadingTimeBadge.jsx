import { Link } from 'react-router-dom'
import { formatDuration, useTodayReading } from '../lib/readingTime.js'

/**
 * Navbardagi bugungi o'qish vaqti — Sozlamalar → O'qish vaqti tabiga olib boradi.
 * O'qish davomida har 15 soniyada yangilanadi. Navbar balandligi o'zgarmaydi (blok 48px).
 */
export default function ReadingTimeBadge() {
  const today = useTodayReading()

  return (
    <Link
      to="/settings?tab=reading"
      title="Bugun oʻqish sahifalarida oʻtkazilgan vaqt — batafsil: Sozlamalar → Oʻqish vaqti"
      aria-label={`Bugun ${formatDuration(today)} oʻqildi`}
      className="hover:bg-surface-2/60 hidden h-12 flex-none items-center gap-2 rounded-md px-2 transition-colors min-[1120px]:flex"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[18px] w-[18px] flex-none text-emerald-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
      <span className="flex flex-col gap-0.5 leading-tight whitespace-nowrap tabular-nums">
        <span className="text-ink text-[13px] font-bold">{formatDuration(today, { short: true })}</span>
        <span className="text-ink-faint text-[10px] font-medium">bugun oʻqildi</span>
      </span>
    </Link>
  )
}
