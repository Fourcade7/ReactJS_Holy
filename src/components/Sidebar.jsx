import { Link, useLocation } from 'react-router-dom'
import { cn } from './Ui.jsx'

const ICON = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-[18px] w-[18px] flex-none',
}

const GROUPS = [
  {
    title: "O'qish",
    items: [
      {
        to: '/',
        match: (path) => path === '/' || path.startsWith('/surah/'),
        label: 'Suralar',
        icon: (
          <svg {...ICON}>
            <path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5z" />
            <path d="M4 5.5v15" />
          </svg>
        ),
      },
      {
        to: '/pages',
        match: (path) => path === '/pages' || path.startsWith('/page/'),
        label: 'Sahifalar',
        icon: (
          <svg {...ICON}>
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 8h8M8 12h8M8 16h5" />
          </svg>
        ),
      },
      {
        to: '/juz',
        match: (path) => path.startsWith('/juz'),
        label: 'Juzlar',
        icon: (
          <svg {...ICON}>
            <path d="M3 6h7a3 3 0 013 3v10a2.5 2.5 0 00-2.5-2.5H3z" />
            <path d="M21 6h-3a3 3 0 00-3 3v10a2.5 2.5 0 012.5-2.5H21z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Lug'at",
    items: [
      {
        to: '/words',
        label: "Qiyin so'zlar",
        icon: (
          <svg {...ICON}>
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 3H20v18H6.5A2.5 2.5 0 014 18.5v-13A2.5 2.5 0 016.5 3z" />
            <path d="M9 7.5h7M9 11h5" />
          </svg>
        ),
      },
    ],
  },
]

export default function Sidebar({ onNavigate }) {
  const { pathname } = useLocation()

  return (
    <nav className="flex flex-col gap-7 px-3 py-6">
      {GROUPS.map((group) => (
        <div key={group.title}>
          <p className="text-ink-faint mb-2 px-3 text-[11px] font-bold tracking-[0.12em] uppercase">
            {group.title}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const isActive = item.match
                ? item.match(pathname)
                : pathname === item.to || pathname.startsWith(`${item.to}/`)

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-surface-2 text-ink'
                      : 'text-ink-soft hover:bg-surface-2/50 hover:text-ink',
                  )}
                >
                  {isActive ? (
                    <span className="bg-accent absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full" />
                  ) : null}
                  <span className={isActive ? 'text-accent' : ''}>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
