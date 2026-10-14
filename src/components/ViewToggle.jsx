import { usePref } from '../lib/reading.js'
import { cn } from './Ui.jsx'

const VIEW_KEY = 'list-view'

/** Katak / ro'yxat ko'rinishi — barcha ro'yxat sahifalari uchun umumiy, brauzerda eslab qolinadi */
export function useListView() {
  const [value, setValue] = usePref(VIEW_KEY, 'grid')
  return [value === 'list' ? 'list' : 'grid', setValue]
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
    </svg>
  )
}

/** Katak / ro'yxat ko'rinishini almashtirgich (Segmented bilan bir xil uslubda) */
export function ViewToggle({ view, onChange, className }) {
  const button = (value, label, icon) => (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={view === value}
      onClick={() => onChange(value)}
      className={cn(
        'cursor-pointer rounded-md p-1.5 transition-all duration-150',
        view === value
          ? 'bg-accent/15 text-accent ring-accent/50 ring-1 ring-inset'
          : 'text-ink-faint hover:text-ink',
      )}
    >
      {icon}
    </button>
  )

  return (
    <div
      className={cn(
        'bg-surface-2 border-line inline-flex gap-0.5 rounded-md border p-0.5',
        className,
      )}
    >
      {button('grid', 'Katak koʻrinish', <GridIcon />)}
      {button('list', 'Roʻyxat koʻrinish', <ListIcon />)}
    </div>
  )
}

/** Jadval uslubidagi ro'yxat qobig'i va zebra qator klassi */
export const LIST_BOX = 'border-line overflow-hidden rounded-md border'

export const rowClass = (index) =>
  cn('group hover:bg-accent/10 transition-colors', index % 2 ? 'bg-surface-2' : 'bg-surface')

/** Ro'yxat yuklanayotganda ko'rsatiladigan qatorlar */
export function ListSkeleton({ rows = 9, rowHeight = 'h-[52px]' }) {
  return (
    <div className={LIST_BOX}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className={cn('bg-surface-2 border-line animate-pulse border-b last:border-b-0', rowHeight)}
        />
      ))}
    </div>
  )
}
