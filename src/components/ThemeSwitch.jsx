import { useEffect, useState } from 'react'
import { cn } from './Ui.jsx'

const ICON_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-[15px] w-[15px]',
}

const MODES = [
  {
    value: 'light',
    title: 'Yorugʻ',
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    ),
  },
  {
    value: 'dark',
    title: 'Qorongʻi',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
      </svg>
    ),
  },
  {
    value: 'system',
    title: 'Tizim',
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="2" y="4" width="20" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
]

function prefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function ThemeSwitch() {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'dark'
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    const dark = mode === 'dark' || (mode === 'system' && prefersDark())
    document.documentElement.classList.toggle('dark', dark)
    try {
      localStorage.setItem('theme', mode)
    } catch {
      /* private rejim — eslab qolmasdan davom etamiz */
    }
  }, [mode])

  useEffect(() => {
    if (mode !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => document.documentElement.classList.toggle('dark', media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [mode])

  return (
    <div className="bg-surface-2 border-line flex items-center gap-0.5 rounded-md border p-[3px]">
      {MODES.map((item) => (
        <button
          key={item.value}
          onClick={() => setMode(item.value)}
          title={item.title}
          aria-label={item.title}
          className={cn(
            'flex h-6 w-6 cursor-pointer items-center justify-center rounded-md transition-colors',
            mode === item.value
              ? 'bg-surface text-ink shadow-sm'
              : 'text-ink-faint hover:text-ink',
          )}
        >
          {item.icon}
        </button>
      ))}
    </div>
  )
}
