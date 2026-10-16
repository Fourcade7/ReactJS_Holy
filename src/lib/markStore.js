import { useEffect, useState } from 'react'

/**
 * «O'qildi» belgilari ombori: { "kitob:raqam": vaqt, … } — localStorage'ning bitta kalitida.
 * Hadislar (read-hadiths) va kitoblar (read-books) uchun umumiy; o'zgarish shu oynadagi
 * hamma ro'yxatlarga hodisa orqali, boshqa oynalarga storage hodisasi orqali yetadi.
 */
export function createMarkStore(key) {
  const event = `${key}-change`

  function read() {
    try {
      const raw = localStorage.getItem(key)
      const value = raw ? JSON.parse(raw) : null
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
    } catch {
      return {}
    }
  }

  function write(value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* private rejim — eslab qolmasdan davom etamiz */
    }
    window.dispatchEvent(new CustomEvent(event, { detail: value }))
  }

  function useMarks() {
    const [value, setValue] = useState(read)

    useEffect(() => {
      function onChange(changeEvent) {
        setValue(changeEvent.detail ?? {})
      }
      /* boshqa oynada o'zgarsa ham yangilanadi */
      function onStorage(storageEvent) {
        if (storageEvent.key === key || storageEvent.key === null) setValue(read())
      }
      window.addEventListener(event, onChange)
      window.addEventListener('storage', onStorage)
      return () => {
        window.removeEventListener(event, onChange)
        window.removeEventListener('storage', onStorage)
      }
    }, [])

    return value
  }

  return { read, write, useMarks }
}
