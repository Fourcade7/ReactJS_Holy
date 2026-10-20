import { useSyncExternalStore } from 'react'

/* Ochiq sahifaning navbardagi «‹ Orqaga» havolasi — { to, label, onClick } yoki null */
let current = null
const listeners = new Set()

export function setBackLink(value) {
  current = value
  listeners.forEach((listener) => listener())
}

/** Sahifa almashganda sahifaning o'zi o'rnatgan havolanigina olib tashlaydi */
export function clearBackLink(value) {
  if (current === value) setBackLink(null)
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useBackLink() {
  return useSyncExternalStore(subscribe, () => current)
}
