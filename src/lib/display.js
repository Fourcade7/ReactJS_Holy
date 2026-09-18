import { useCallback, useEffect, useState } from 'react'

export const TEXT_SCALES = {
  arabic: { key: 'arabic-scale', cssVar: '--arabic-scale' },
  uz: { key: 'uz-scale', cssVar: '--uz-scale' },
}

export const MIN_SCALE = 0.8
export const MAX_SCALE = 1.8
export const STEP = 0.1
export const DEFAULT_SCALE = 1

function clamp(value) {
  if (!Number.isFinite(value)) return DEFAULT_SCALE
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round(value * 10) / 10))
}

export function readScale(which) {
  try {
    const raw = localStorage.getItem(TEXT_SCALES[which].key)
    return raw ? clamp(Number(raw)) : DEFAULT_SCALE
  } catch {
    return DEFAULT_SCALE
  }
}

export function applyScale(which, value) {
  const scale = clamp(value)
  document.documentElement.style.setProperty(TEXT_SCALES[which].cssVar, String(scale))
  try {
    localStorage.setItem(TEXT_SCALES[which].key, String(scale))
  } catch {
    /* private rejim — eslab qolmasdan davom etamiz */
  }
  window.dispatchEvent(new CustomEvent('text-scale-change', { detail: { which, scale } }))
  return scale
}

/**
 * Matn kattalashganda o'qish ustuni ham kengayadi — aks holda mushaf satri
 * sahifaga sig'may, chetga chiqib ketadi. Ekrandan kengaya olmaydi.
 */
export function readingWidth(baseRem) {
  return { maxWidth: `min(100%, calc(${baseRem}rem * var(--arabic-scale)))` }
}

/** Sozlamalar sahifasi va MushafPage shu hook orqali o'lchamni kuzatadi */
export function useTextScale(which) {
  const [scale, setScale] = useState(() => readScale(which))

  useEffect(() => {
    function onChange(event) {
      if (event.detail?.which === which) setScale(event.detail.scale)
    }
    window.addEventListener('text-scale-change', onChange)
    return () => window.removeEventListener('text-scale-change', onChange)
  }, [which])

  const update = useCallback((value) => setScale(applyScale(which, value)), [which])

  return [scale, update]
}
