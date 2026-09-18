import { useEffect, useState } from 'react'

const KEY = 'last-read'
const EVENT = 'last-read-change'

export function readLastRead() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const value = JSON.parse(raw)
    return value?.path && value?.label ? value : null
  } catch {
    return null
  }
}

export function saveLastRead({ path, label }) {
  if (!path || !label) return
  const current = readLastRead()
  if (current?.path === path) return

  const value = { path, label, at: Date.now() }
  try {
    localStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    /* private rejim — eslab qolmasdan davom etamiz */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: value }))
}

export function clearLastRead() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* e'tiborsiz qoldiramiz */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: null }))
}

export function useLastRead() {
  const [lastRead, setLastRead] = useState(() => readLastRead())

  useEffect(() => {
    function onChange(event) {
      setLastRead(event.detail ?? null)
    }
    /* boshqa oynada o'zgarsa ham yangilanadi */
    function onStorage(event) {
      if (event.key === KEY) setLastRead(readLastRead())
    }
    window.addEventListener(EVENT, onChange)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(EVENT, onChange)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return lastRead
}
