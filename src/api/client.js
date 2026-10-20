/**
 * Barcha ma'lumot public/data ichidagi statik JSON fayllardan o'qiladi.
 * Server kerak emas — Qur'on matni o'zgarmagani uchun fayllar tayyor holda turadi.
 */

/* BASE_URL — vite.config.js dagi `base` (GitHub Pages'da /ReactJS_Holy/) */
const DATA_DIR = `${import.meta.env.BASE_URL}data`

async function request(path) {
  const response = await fetch(`${DATA_DIR}/${path}`)
  if (!response.ok) throw new Error(`${path} topilmadi`)
  return response
}

async function json(path) {
  return (await request(path)).json()
}

export function errorMessage(error) {
  return error?.message || 'Nomaʼlum xatolik'
}

export const surahApi = {
  list: () => json('surahs.json'),
  get: (number) => json(`surah/${number}.json`),
}

export const ayahApi = {
  list: async (params = {}) => {
    if (params.juz) return json(`juz/${params.juz}.json`)
    if (params.surah) return (await json(`surah/${params.surah}.json`)).ayahs
    if (params.page) return (await json(`page/${params.page}.json`)).ayahs
    return []
  },
}

export const pageApi = {
  list: () => json('pages.json'),
  get: (number) => json(`page/${number}.json`),
}

export const mushafApi = {
  page: (number) => json(`mushaf/${number}.json`),
}

export const tafsirApi = {
  /** { "oyat raqami": "tafsir matni" } — tafsiri yo'q surada {} (scripts/fetch-tafsir.mjs) */
  surah: (number) => json(`tafsir/${number}.json`),
}

export const wordsApi = {
  list: async ({ limit = 50, offset = 0, q } = {}) => {
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
}

export const dataApi = {
  meta: () => json('meta.json').catch(() => null),
  manifest: () => json('manifest.json'),
  /** Faylning xom baytlari — arxivga o'zgartirmasdan yozish uchun */
  bytes: async (path) => new Uint8Array(await (await request(path)).arrayBuffer()),
}
