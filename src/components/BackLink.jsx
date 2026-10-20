import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { clearBackLink, setBackLink, useBackLink } from '../lib/backLink.js'

/**
 * Sahifaning «‹ Orqaga» havolasi. Sahifa ichida hech narsa chizmaydi — havola navbarda
 * ko'rinadi, navbar esa doim tepada turadi: qancha pastga tushilsa ham orqaga qaytish bir bosish.
 */
export default function BackLink({ to, label, onClick }) {
  useEffect(() => {
    const value = { to, label, onClick }
    setBackLink(value)
    return () => clearBackLink(value)
  }, [to, label, onClick])

  return null
}

/** Navbardagi joyi (Qur'on bo'ylab o'tish tugmasidan keyin): ochiq sahifa BackLink qo'ygan bo'lsa ko'rinadi */
export function HeaderBackLink() {
  const back = useBackLink()
  if (!back) return null

  return (
    <>
      <span className="bg-line hidden h-5 w-px flex-none sm:block" />
      <Link
        to={back.to}
        onClick={back.onClick}
        title={back.label}
        aria-label={back.label}
        className="text-ink-soft hover:bg-surface-2 hover:text-ink flex h-8 min-w-0 flex-none items-center gap-1.5 rounded-md px-2 text-[13px] font-semibold transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 flex-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        {/* Tor ekranda faqat belgi — navbarda joy kam */}
        <span className="hidden max-w-[220px] truncate sm:inline">{back.label}</span>
      </Link>
    </>
  )
}
