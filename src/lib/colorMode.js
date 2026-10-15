import { useEffect, useState } from 'react'

/* Yorug' / qorong'i / tizim rejimi — header'dagi almashtirgich va Sozlamalar bir xil holatni ko'radi */
const KEY = 'theme'
const EVENT = 'color-mode-change'

function readMode() {
  try {
    return localStorage.getItem(KEY) || 'dark'
  } catch {
    return 'dark'
  }
}

function prefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useColorMode() {
  const [mode, setModeState] = useState(readMode)

  /* Boshqa joyda (header yoki Sozlamalar) almashtirilsa, bu yerda ham yangilanadi */
  useEffect(() => {
    const onChange = (event) => setModeState(event.detail)
    window.addEventListener(EVENT, onChange)
    return () => window.removeEventListener(EVENT, onChange)
  }, [])

  useEffect(() => {
    const dark = mode === 'dark' || (mode === 'system' && prefersDark())
    document.documentElement.classList.toggle('dark', dark)
    try {
      localStorage.setItem(KEY, mode)
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

  function setMode(next) {
    setModeState(next)
    window.dispatchEvent(new CustomEvent(EVENT, { detail: next }))
  }

  return [mode, setMode]
}

/** Hozir qorong'i rejimdami — <html class="dark"> kuzatiladi (tizim rejimida ham to'g'ri) */
export function useIsDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => setDark(root.classList.contains('dark')))
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return dark
}
