import { useEffect, useState } from 'react'
import DEFAULT_REMINDERS from '../data/default-reminders.json'

/* Foydalanuvchi o'zi kiritgan eslatmalar — [{ id, type, title, text, createdAt }, …] */
const KEY = 'reminders'
const EVENT = 'reminders-change'
/* Qaysi standart eslatmalar allaqachon qo'shilgan — o'chirilgani qaytib kelmasligi uchun */
const SEEDED_KEY = 'reminders-seeded'

export const REMINDER_TYPES = [
  { value: 'ayah', label: 'Oyat' },
  { value: 'hikmat', label: 'Hikmat' },
]

export function reminderTypeLabel(type) {
  return REMINDER_TYPES.find((item) => item.value === type)?.label ?? 'Eslatma'
}

export function readReminders() {
  try {
    const raw = localStorage.getItem(KEY)
    const value = raw ? JSON.parse(raw) : null
    return Array.isArray(value) ? value.filter((item) => item?.id && item.text) : []
  } catch {
    return []
  }
}

/**
 * Dastur bilan keladigan eslatmalar (src/data/default-reminders.json) har biri faqat
 * bir marta ro'yxatga qo'shiladi: yangi o'rnatishda hammasi, yangilanishda esa faqat
 * hali qo'shilmaganlari. Foydalanuvchi o'chirganlari qayta tiklanmaydi.
 * Ro'yxatda turganlari esa fayldagi so'nggi ko'rinishga yangilanadi (matn tuzatishlari uchun).
 */
function seedDefaultReminders() {
  try {
    const seeded = new Set(JSON.parse(localStorage.getItem(SEEDED_KEY) || '[]'))
    const defaults = new Map(DEFAULT_REMINDERS.map((item) => [item.id, item]))
    const stored = readReminders()
    const synced = stored.map((item) =>
      defaults.has(item.id) ? { ...defaults.get(item.id), createdAt: item.createdAt } : item,
    )
    const existing = new Set(stored.map((item) => item.id))
    const fresh = DEFAULT_REMINDERS.filter((item) => !seeded.has(item.id))
    const now = Date.now()
    const added = fresh
      .filter((item) => !existing.has(item.id))
      .map((item) => ({ ...item, createdAt: now }))
    const next = [...synced, ...added]
    if (JSON.stringify(next) !== JSON.stringify(stored)) {
      localStorage.setItem(KEY, JSON.stringify(next))
    }
    if (fresh.length > 0) {
      localStorage.setItem(SEEDED_KEY, JSON.stringify([...seeded, ...fresh.map((item) => item.id)]))
    }
  } catch {
    /* private rejim — standart eslatmalarsiz davom etamiz */
  }
}

seedDefaultReminders()

function writeReminders(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* private rejim — eslab qolmasdan davom etamiz */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: list }))
}

/* `source` — oyat tarjimasidan saqlanganda qaysi oyatligi ("112:1"), qayta saqlanmasligi uchun */
export function addReminder({ type, title, text, source }) {
  const reminder = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    title: title.trim(),
    text: text.trim(),
    ...(source ? { source } : {}),
    createdAt: Date.now(),
  }
  writeReminders([reminder, ...readReminders()])
}

export function deleteReminder(id) {
  writeReminders(readReminders().filter((item) => item.id !== id))
}

export function useReminders() {
  const [value, setValue] = useState(() => readReminders())

  useEffect(() => {
    function onChange(event) {
      setValue(event.detail ?? [])
    }
    /* boshqa oynada o'zgarsa ham yangilanadi */
    function onStorage(event) {
      if (event.key === KEY || event.key === null) setValue(readReminders())
    }
    window.addEventListener(EVENT, onChange)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(EVENT, onChange)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return value
}

/* Dastur har ochilganda bitta tasodifiy eslatma tanlanadi va shu seans davomida o'zgarmaydi */
let sessionPickId = null

export function pickSessionReminder(list) {
  if (list.length === 0) return null
  let picked = list.find((item) => item.id === sessionPickId)
  if (!picked) {
    picked = list[Math.floor(Math.random() * list.length)]
    sessionPickId = picked.id
  }
  return picked
}
