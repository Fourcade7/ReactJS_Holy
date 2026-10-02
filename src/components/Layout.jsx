import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { readingWidth } from '../lib/display.js'
import ContinueReading from './ContinueReading.jsx'
import QuranNav from './QuranNav.jsx'
import Sidebar from './Sidebar.jsx'
import ThemeSwitch from './ThemeSwitch.jsx'
import { cn } from './Ui.jsx'
import XatmProgress from './XatmProgress.jsx'

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const isReading = /^\/(surah|page|juz)\/\d+/.test(location.pathname)
  /* Ro'yxatlar kengroq: Sahifalar keng ekranda 10 ustun, bosh sahifada sura nomlari to'liq sig'ishi uchun */
  const listWidth = { '/pages': '80rem', '/': '72rem' }[location.pathname]

  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen">
      <header className="border-line bg-bg/90 fixed inset-x-0 top-0 z-40 h-16 border-b backdrop-blur-xl">
        <div className="flex h-full items-center gap-3 px-4">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Menyu"
            className="text-ink-soft hover:bg-surface-2 hover:text-ink flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors lg:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link to="/" className="flex w-[228px] flex-none items-center gap-2.5">
            <span className="bg-accent font-arabic flex h-9 w-9 items-center justify-center rounded-md text-base text-white">
              ق
            </span>
            <span className="leading-tight">
              <span className="text-ink block text-[15px] font-extrabold tracking-tight">
                Qur'on
              </span>
              <span className="text-ink-faint block text-[10px] font-bold tracking-[0.14em] uppercase">
                o'zbekcha tarjima
              </span>
            </span>
          </Link>

          <div className="hidden sm:block">
            <QuranNav />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <XatmProgress />
            <ContinueReading />
            <ThemeSwitch />
            <Link
              to="/settings"
              title="Sozlamalar"
              aria-label="Sozlamalar"
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                location.pathname === '/settings'
                  ? 'bg-surface-2 text-accent'
                  : 'text-ink-soft hover:bg-surface-2 hover:text-ink',
              )}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 008 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 8a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 3.6 1.65 1.65 0 0010 2.09V2a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 8v0a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <aside className="border-line fixed top-16 bottom-0 left-0 hidden w-60 overflow-y-auto border-r lg:block">
        <Sidebar />
      </aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Yopish"
            className="absolute inset-0 h-full w-full cursor-default bg-black/50"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="bg-surface border-line animate-fade absolute top-0 bottom-0 left-0 w-64 overflow-y-auto border-r">
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      ) : null}

      <main className="pt-16 lg:pl-60">
        <div
          className="mx-auto w-full px-4 py-8 sm:px-6"
          style={
            isReading ? readingWidth(56) : { maxWidth: listWidth ?? '56rem' }
          }
        >
          <div className="mb-6 sm:hidden">
            <QuranNav />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
