/**
 * Shayx Muhammad Sodiq Muhammad Yusuf tafsirini quran.com dan yuklab,
 * public/data/tafsir/{sura}.json fayllariga yozadi:
 *
 *   node scripts/fetch-tafsir.mjs
 *
 * Ilovadagi o'zbekcha tarjima — quran.com dagi «Muhammad Sodiq Muhammad Yusuf (Latin)»
 * tarjimasi (#55). Undagi izoh (foot note) oyat oxirida turadi va shu oyatning qisqa
 * tafsiri hisoblanadi. Fayl: { "oyat raqami": "tafsir matni" }; tafsiri yo'q surada {},
 * shunda ilova har bir surani bir xil yo'l bilan so'raydi.
 *
 * manifest.json va meta.json ham yangilanadi — «Barcha JSON maʼlumotni yuklab olish»
 * arxiviga tafsir ham tushadi. Qayta ishga tushirish xavfsiz: eski tafsir yozuvlari almashadi.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const API = 'https://api.quran.com/api/v4'
const TRANSLATION_ID = 55
const DATA_DIR = new URL('../public/data/', import.meta.url)
const PARALLEL = 6

async function get(path, attempt = 1) {
  try {
    const response = await fetch(`${API}${path}`)
    if (!response.ok) throw new Error(`${response.status} ${path}`)
    return await response.json()
  } catch (error) {
    if (attempt >= 4) throw error
    await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
    return get(path, attempt + 1)
  }
}

/**
 * Izoh odatda butunlay qavs ichida keladi: «(Yaʼni, …)» — panelda qavssiz ko'rsatamiz.
 * Tashqi qavs faqat butun matnni o'raganda olinadi, aks holda matn o'zgarmaydi.
 */
function clean(text) {
  const plain = text.replace(/\s+/g, ' ').trim()
  if (!plain.startsWith('(')) return plain
  let depth = 0
  for (let index = 0; index < plain.length; index += 1) {
    if (plain[index] === '(') depth += 1
    else if (plain[index] === ')' && --depth === 0) {
      const rest = plain.slice(index + 1)
      if (!/^[\s.,;:]*$/.test(rest)) return plain
      const inner = plain.slice(1, index).trim()
      /* «(… demasinlar).» — nuqta qavsdan tashqarida bo'lsa, saqlab qolamiz */
      return rest.includes('.') && !/[.!?:]$/.test(inner) ? `${inner}.` : inner
    }
  }
  return plain.slice(1).trim() /* qavs yopilmagan */
}

/* 1. Qaysi oyatda qaysi izoh bor */
const notes = []
for (let surah = 1; surah <= 114; surah += 1) {
  const { translations } = await get(
    `/quran/translations/${TRANSLATION_ID}?chapter_number=${surah}&fields=verse_number`,
  )
  for (const { verse_number: ayah, text } of translations) {
    for (const match of text.matchAll(/<sup\b[^>]*foot_note="?(\d+)/g)) {
      notes.push({ surah, ayah, id: match[1] })
    }
  }
  process.stdout.write(`\rSuralar: ${surah}/114`)
}
console.log(`\nIzohlar: ${notes.length}`)

/* 2. Izoh matnlari — bir nechta parallel so'rov bilan */
let next = 0
let done = 0
async function worker() {
  while (next < notes.length) {
    const note = notes[next++]
    const { foot_note: footNote } = await get(`/foot_notes/${note.id}`)
    note.text = clean(footNote.text)
    done += 1
    if (done % 50 === 0 || done === notes.length) {
      process.stdout.write(`\rMatnlar: ${done}/${notes.length}`)
    }
  }
}
await Promise.all(Array.from({ length: PARALLEL }, worker))
console.log()

/* 3. tafsir/{sura}.json — bir oyatda bir nechta izoh bo'lsa, xatboshi qilib qo'shiladi */
await mkdir(new URL('tafsir/', DATA_DIR), { recursive: true })
const written = []
for (let surah = 1; surah <= 114; surah += 1) {
  const tafsir = {}
  for (const note of notes) {
    if (note.surah !== surah) continue
    tafsir[note.ayah] = tafsir[note.ayah] ? `${tafsir[note.ayah]}\n\n${note.text}` : note.text
  }
  const path = `tafsir/${surah}.json`
  const content = JSON.stringify(tafsir)
  await writeFile(new URL(path, DATA_DIR), content)
  written.push({ path, bytes: Buffer.byteLength(content) })
}

/* 4. manifest.json (arxivdagi fayllar) va meta.json (umumiy hisob, meta.json o'zidan tashqari) */
const manifestUrl = new URL('manifest.json', DATA_DIR)
const metaUrl = new URL('meta.json', DATA_DIR)
const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'))
const meta = JSON.parse(await readFile(metaUrl, 'utf8'))

const files = [
  ...manifest.files.filter((file) => !file.path.startsWith('tafsir/') && file.path !== 'meta.json'),
  ...written,
]
meta.files = files.length
meta.totalBytes = files.reduce((sum, file) => sum + file.bytes, 0)
const metaContent = JSON.stringify(meta)
await writeFile(metaUrl, metaContent)

manifest.files = [...files, { path: 'meta.json', bytes: Buffer.byteLength(metaContent) }]
await writeFile(manifestUrl, JSON.stringify(manifest))

const ayahs = new Set(notes.map((note) => `${note.surah}:${note.ayah}`)).size
console.log(`Tayyor: ${ayahs} oyat tafsiri, ${written.length} fayl → public/data/tafsir/`)
