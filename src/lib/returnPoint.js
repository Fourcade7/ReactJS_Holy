import { useLayoutEffect } from 'react'
import { readLastRead } from './lastRead.js'
import { SECTIONS } from './sections.js'

/* Sozlamalarga o'tishdan oldingi sahifa: { path, label, scrollY } — shu oynada (sessionStorage) */
const KEY = 'settings-return'
export const SETTINGS_PATH = '/settings'

const FALLBACK = { path: '/', label: SECTIONS['/'], scrollY: 0 }

/** Yo'ldan qisqa nom: «3-sahifa», «2-juz», «Sahifalar» … */
function labelFor(path) {
  /* Sura / sahifa / juz o'qilayotgan bo'lsa — «Davom etish» dagi nom (Baqara 2:21) */
  const lastRead = readLastRead()
  if (lastRead?.path === path) return lastRead.label

  const pathname = path.replace(/[?#].*$/, '')
  if (SECTIONS[pathname]) return SECTIONS[pathname]
  let match
  if ((match = pathname.match(/^(?:\/surah\/\d+)?\/page\/(\d+)$/))) return `${match[1]}-sahifa`
  if ((match = pathname.match(/^\/juz\/(\d+)$/))) return `${match[1]}-juz`
  if ((match = pathname.match(/^\/surah\/(\d+)\/pages$/))) return `${match[1]}-sura sahifalari`
  if ((match = pathname.match(/^\/surah\/(\d+)$/))) return `${match[1]}-sura`
  if ((match = pathname.match(/^\/book\/[^/]+\/s\/[^/]+\/(\d+)$/))) return `${match[1]}-hadis`
  if (pathname.startsWith('/book/')) return 'Hadislar'
  return 'Orqaga'
}

/**
 * Sura 10 tadan oyat ko'rsatadi va qaysi bo'lakda turgani URL'da yo'q — qaytganda o'sha bo'lak
 * ochilishi uchun «Davom etish» dagi #ayah-N li yo'l olinadi (sahifa o'zi shu oyatga aylantiradi).
 */
function returnPath(pathname, search, hash) {
  const path = `${pathname}${search}${hash}`
  if (hash || !/^\/surah\/\d+$/.test(pathname)) return path
  const lastRead = readLastRead()
  return lastRead?.path.startsWith(`${pathname}#`) ? lastRead.path : path
}

export function readReturnPoint() {
  try {
    const value = JSON.parse(sessionStorage.getItem(KEY))
    return value?.path ? value : FALLBACK
  } catch {
    return FALLBACK
  }
}

/**
 * Joriy sahifaning yo'li va qayergacha aylantirilgani doim yozib boriladi (Sozlamalardan tashqari) —
 * Sozlamalar ochilganda qiymat tayyor turadi. Layout'da chaqiriladi: Sozlamalarga qaysi havoladan
 * o'tilmasin (tishli g'ildirak, xatm, o'qish vaqti, eslatma), «Orqaga» oxirgi sahifaga qaytaradi.
 */
export function useRememberReturnPoint({ pathname, search, hash }) {
  /* Layout effekti: sahifa almashganda tinglovchilar DOM yangilangan zahoti olib tashlanadi —
     brauzer eski joyni yangi (qisqa) sahifaga moslab o'zgartirgani yozilib qolmaydi */
  useLayoutEffect(() => {
    if (pathname === SETTINGS_PATH) return
    let frame = 0

    function save() {
      frame = 0
      const path = returnPath(pathname, search, hash)
      /* #ayah-N li yo'lda sahifa o'zi kerakli oyatga aylantiradi */
      const value = { path, label: labelFor(path), scrollY: path.includes('#') ? 0 : window.scrollY }
      try {
        sessionStorage.setItem(KEY, JSON.stringify(value))
      } catch {
        /* private rejim — «Orqaga» bosh sahifaga qaytaradi */
      }
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(save)
    }

    save()
    window.addEventListener('scroll', schedule, { passive: true })
    /* Surada keyingi oyatlarga o'tilganda «Davom etish» yo'li (#ayah-N) yangilanadi */
    window.addEventListener('last-read-change', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('last-read-change', schedule)
    }
  }, [pathname, search, hash])
}

const RESTORE_MS = 3000
const USER_INPUT = ['wheel', 'touchstart', 'keydown', 'mousedown']

/**
 * Qaytilgan sahifani eski joyiga aylantiradi. Sahifa ma'lumoti va shriftlari keyinroq yuklanib,
 * balandligi o'zgarib turadi — shuning uchun 3 soniya davomida joy ushlab turiladi;
 * foydalanuvchi o'zi aylantira boshlasa, darhol to'xtaydi.
 */
export function restoreScroll({ path, scrollY }) {
  if (!scrollY) return
  const pathname = path.replace(/[?#].*$/, '')
  const started = performance.now()
  let stopped = false
  const stop = () => {
    stopped = true
  }
  USER_INPUT.forEach((type) => window.addEventListener(type, stop, { passive: true }))

  function tick() {
    if (stopped || performance.now() - started > RESTORE_MS) {
      USER_INPUT.forEach((type) => window.removeEventListener(type, stop))
      return
    }
    /* Sozlamalar sahifasi hali almashmagan bo'lsa, uni aylantirmaymiz */
    if (window.location.pathname === pathname) {
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      const top = Math.min(scrollY, max)
      if (Math.abs(window.scrollY - top) > 1) window.scrollTo({ top, behavior: 'instant' })
    }
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
