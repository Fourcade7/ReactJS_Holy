import { Link, useLocation } from 'react-router-dom'
import { useLastRead } from '../lib/lastRead.js'

export default function ContinueReading() {
  const lastRead = useLastRead()
  const location = useLocation()

  if (!lastRead) return null
  /* Ayni o'sha joyda turgan bo'lsak, tugmani ko'rsatishdan ma'no yo'q */
  if (lastRead.path === `${location.pathname}${location.hash}`) return null

  return (
    <Link
      to={lastRead.path}
      title="Oxirgi oʻqilgan joydan davom etish"
      className="border-line bg-surface-2 text-ink-soft hover:border-accent/50 hover:text-ink flex items-center gap-2 h-8 rounded-md border px-2.5 text-xs font-semibold transition-colors"
    >
      <svg
        viewBox="0 0 24 24"
        className="text-accent h-4 w-4 flex-none"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" />
      </svg>
      <span className="hidden sm:inline">Davom etish:</span>
      <span className="text-ink max-w-[140px] truncate">{lastRead.label}</span>
    </Link>
  )
}
