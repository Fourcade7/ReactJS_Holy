import axios from 'axios'

/**
 * Ma'lumot ikki manbadan kelishi mumkin:
 *   api  — NestJS + PostgreSQL (to'liq, yozish ham mumkin)
 *   json — public/data ichidagi statik fayllar (faqat o'qish)
 * "auto" rejimida API bir marta tekshiriladi, javob bo'lmasa JSON'ga o'tiladi.
 */

const SOURCE_KEY = 'data-source'
const SOURCE_EVENT = 'data-source-change'
const DATA_DIR = '/data'

const http = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

export function getSourceMode() {
  try {
    const saved = localStorage.getItem(SOURCE_KEY)
    return saved === 'api' || saved === 'json' ? saved : 'auto'
  } catch {
    return 'auto'
  }
}

export function setSourceMode(mode) {
  try {
    localStorage.setItem(SOURCE_KEY, mode)
  } catch {
    /* private rejim — eslab qolmasdan davom etamiz */
  }
  resolved = null
  probe = null
  window.dispatchEvent(new CustomEvent(SOURCE_EVENT, { detail: mode }))
}

let resolved = null
let probe = null

export function resolvedSource() {
  return resolved
}

async function activeSource() {
  const mode = getSourceMode()
  if (mode !== 'auto') {
    resolved = mode
    return mode
  }
  if (resolved) return resolved

  if (!probe) {
    probe = http
      .get('/health', { timeout: 2500 })
      .then(() => 'api')
      .catch(() => 'json')
  }
  resolved = await probe
  window.dispatchEvent(new CustomEvent(SOURCE_EVENT, { detail: resolved }))
  return resolved
}

async function json(path) {
  const response = await fetch(`${DATA_DIR}/${path}`)
  if (!response.ok) {
    const error = new Error(`${path} topilmadi`)
    error.response = { status: response.status }
    throw error
  }
  return response.json()
}

/** Manbaga qarab mos funksiyani chaqiradi */
async function pick(handlers) {
  const source = await activeSource()
  if (source === 'api') {
    try {
      return await handlers.api()
    } catch (error) {
      /* Server o'chib qolgan bo'lsa, fayllarga qaytamiz */
      if (getSourceMode() === 'auto' && !error.response) {
        resolved = 'json'
        window.dispatchEvent(new CustomEvent(SOURCE_EVENT, { detail: 'json' }))
        return handlers.json()
      }
      throw error
    }
  }
  return handlers.json()
}

export function errorMessage(error) {
  const message = error?.response?.data?.message
  if (Array.isArray(message)) return message.join(', ')
  return message || error?.message || 'Nomaʼlum xatolik'
}

export const surahApi = {
  list: () =>
    pick({
      api: () => http.get('/surahs').then((r) => r.data),
      json: () => json('surahs.json'),
    }),
  get: (number) =>
    pick({
      api: () => http.get(`/surahs/${number}`).then((r) => r.data),
      json: () => json(`surah/${number}.json`),
    }),
}

export const ayahApi = {
  list: (params = {}) =>
    pick({
      api: () => http.get('/ayahs', { params }).then((r) => r.data),
      json: async () => {
        if (params.juz) return json(`juz/${params.juz}.json`)
        if (params.surah) return (await json(`surah/${params.surah}.json`)).ayahs
        if (params.page) return (await json(`page/${params.page}.json`)).ayahs
        return []
      },
    }),
}

export const pageApi = {
  list: () =>
    pick({
      api: () => http.get('/pages').then((r) => r.data),
      json: () => json('pages.json'),
    }),
  get: (number) =>
    pick({
      api: () => http.get(`/pages/${number}`).then((r) => r.data),
      json: () => json(`page/${number}.json`),
    }),
}

export const mushafApi = {
  page: (number) =>
    pick({
      api: () => http.get(`/mushaf/${number}`).then((r) => r.data),
      json: () => json(`mushaf/${number}.json`),
    }),
}

export const wordsApi = {
  list: ({ limit = 50, offset = 0, q } = {}) =>
    pick({
      api: () =>
        http.get('/words', { params: { limit, offset, q } }).then((r) => r.data),
      json: async () => {
        const all = await json('words.json')
        const needle = q?.trim().toLowerCase()
        const items = needle
          ? all.items.filter((word) =>
              [word.text, word.textPlain, word.transliteration]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(needle)),
            )
          : all.items
        return {
          total: items.length,
          limit,
          offset,
          items: items.slice(offset, offset + limit),
        }
      },
    }),
}

export const dataApi = {
  meta: () => json('meta.json').catch(() => null),
  health: () => http.get('/health', { timeout: 2500 }).then((r) => r.data),
}

export { SOURCE_EVENT }
export default http
