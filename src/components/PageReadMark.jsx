import { formatReadAt, toggleXatmPage, useXatm } from '../lib/xatm.js'

/* Betni o'qib bo'lgach shu yerning o'zida «o'qildi» deb belgilash */
export default function PageReadMark({ pageNumber }) {
  const xatm = useXatm()
  const readAt = xatm[pageNumber]

  return (
    <div className="mt-5 flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={() => toggleXatmPage(pageNumber)}
        aria-pressed={Boolean(readAt)}
        className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
          readAt
            ? 'border-emerald-500/70 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/15'
            : 'border-line bg-surface-2 text-ink-soft hover:text-ink hover:border-emerald-500/60'
        }`}
      >
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
            readAt ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-ink-faint text-transparent'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        {readAt ? "O'qildi" : "O'qildi deb belgilash"}
      </button>
      {readAt ? (
        <span className="text-[11px] font-medium text-emerald-500 tabular-nums">
          {formatReadAt(readAt)} · belgini olib tashlash uchun qayta bosing
        </span>
      ) : null}
    </div>
  )
}
