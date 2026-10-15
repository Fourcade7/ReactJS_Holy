/**
 * Kitoblarning arabcha matnini ochiq datasetdan hadith/raw/ papkasiga yuklaydi.
 * Manba: https://github.com/fawazahmed0/hadith-api
 *
 * Ishlatish:
 *   npm run hadith:fetch                # hadith/raw/ da yo'q kitoblarni yuklaydi
 *   npm run hadith:fetch -- dehlaviy    # faqat bitta kitob
 *   npm run hadith:fetch -- --force     # mavjud fayllarni ham qayta yuklaydi
 */
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { COLLECTIONS, rawPath } from './collections.mjs'

const ROOT = new URL('../../hadith/', import.meta.url)
const args = process.argv.slice(2)
const force = args.includes('--force')
const ids = args.filter((arg) => !arg.startsWith('--'))

const selected = ids.length > 0 ? COLLECTIONS.filter((item) => ids.includes(item.id)) : COLLECTIONS
if (selected.length === 0) {
  console.error(`Kitob topilmadi: ${ids.join(', ')}`)
  process.exit(1)
}

await mkdir(new URL('raw/', ROOT), { recursive: true })

for (const collection of selected) {
  const target = new URL(rawPath(collection), ROOT)
  if (existsSync(target) && !force) {
    console.log(`${collection.id}: ${rawPath(collection)} bor, o'tkazib yuborildi`)
    continue
  }

  const source = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${collection.edition}.json`
  const response = await fetch(source)
  if (!response.ok) throw new Error(`${source} → HTTP ${response.status}`)

  const data = await response.json()
  if (!Array.isArray(data.hadiths) || data.hadiths.length === 0) {
    throw new Error(`${collection.id}: kutilgan formatda emas ("hadiths" massivi topilmadi)`)
  }

  await writeFile(target, `${JSON.stringify(data, null, 2)}\n`)
  console.log(`${collection.id}: ${data.hadiths.length} ta hadis → ${rawPath(collection)}`)
}
