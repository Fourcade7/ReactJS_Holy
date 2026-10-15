/**
 * hadith/raw/<nashr>.json (arabcha) + hadith/translations/ (oʻzbekcha) → public/data/hadith/
 *
 * Natija:
 *   public/data/hadith/collections.json
 *   public/data/hadith/<kitob>/sections.json          bo'limlar (kitoblar) ro'yxati
 *   public/data/hadith/<kitob>/section/<n>.json       bo'limdagi hadislar
 *
 * Tarjimalar ikki joydan o'qiladi (ikkalasi ham ixtiyoriy, kalitlar birlashtiriladi):
 *   hadith/translations/<kitob>.uz.json               { "<hadis raqami>": { textUz, … } }
 *   hadith/translations/<kitob>/*.uz.json             shu, bo'limlarga bo'lingan ko'rinishda
 *   hadith/translations/<kitob>/sections.uz.json      { "<bo'lim raqami>": "Bo'lim nomi" }
 *
 * Tarjimasi yo'q hadislar arabcha matn bilan chiqadi (textUz bo'sh) — shuning uchun
 * katta kitoblarni bosqichma-bosqich tarjima qilib, har safar shu skriptni yurgizish mumkin.
 *
 * Ishlatish: npm run hadith:build
 */
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { COLLECTIONS, rawPath, translationsPath } from './collections.mjs'

/* Manba (raw/, translations/) — hadith/ papkasida, natija — public/data/hadith/ da */
const ROOT = new URL('../../hadith/', import.meta.url)
const OUT = new URL('../../public/data/hadith/', import.meta.url)

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, ROOT), 'utf8'))
}

async function writeJson(path, value) {
  const url = new URL(path, OUT)
  await mkdir(new URL('./', url), { recursive: true })
  await writeFile(url, `${JSON.stringify(value)}\n`)
}

const exists = (path) => existsSync(new URL(path, ROOT))

const DIACRITICS = '\\u064B-\\u0652\\u0670'
const stripDiacritics = (text) => text.replace(new RegExp(`[${DIACRITICS}]`, 'g'), '')

/* Alif maqsura (ى) bilan yoziladigan, lekin manbada forscha ی bilan kelgan so'zlar */
const ALEF_MAKSURA_WORDS = new Set(['علي', 'السفلي', 'التقوي', 'يري'])

/**
 * Forscha/urducha harflarni arabchaga o'tkazadi: ک → ك, ی → ي.
 * So'z oxiridagi ی alif maqsura bo'lgan so'zlarda (على, التقوى …) ى ga aylanadi.
 */
function normalizeArabicLetters(text) {
  return text
    .replace(/ک/g, 'ك')
    .split(/(\s+)/)
    .map((token) => {
      if (!token.includes('ی')) return token
      const converted = token.replace(/ی/g, 'ي')
      if (!ALEF_MAKSURA_WORDS.has(stripDiacritics(converted))) return converted
      return converted.replace(new RegExp(`\\u064A(?=[${DIACRITICS}]*$)`), 'ى')
    })
    .join('')
}

/** "الْسَّفَرُ" → "السَّفَرُ": quyosh harfi oldidagi lamda sukun yozilmaydi */
function dropSukunBeforeSunLetter(text) {
  return text.replace(
    new RegExp(`(^|\\s)(\\u0627[${DIACRITICS}]*\\u0644)\\u0652(?=[\\u0621-\\u064A][\\u064B-\\u0652]*\\u0651)`, 'g'),
    '$1$2',
  )
}

/** Manbadagi tahrirlash belgilarini olib tashlaydi: <br>, bidi belgilari, [رقم:123] kabi havolalar */
function cleanArabic(text) {
  const cleaned = text
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/[‪-‮‎‏]/g, '')
    .replace(/\s*\[\s*(?:راجع\s*)?رقم\s*:\s*[\d/\s]*\]/g, '')
    .replace(/\s*\[\s*\d+\/\d+\s*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return dropSukunBeforeSunLetter(normalizeArabicLetters(cleaned))
}

/** Apostrof turlarini yagona koʻrinishga keltiradi: oʻ/gʻ → ʻ, qolgan tutuq belgisi → ʼ */
function normalizeUzbek(text) {
  return text
    .replace(/([oOgG])['‘’`ʻʼ]/g, '$1ʻ')
    .replace(/['‘’`]/g, 'ʼ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** translations/<kitob>.uz.json va translations/<kitob>/*.uz.json ni birlashtiradi */
async function loadTranslations(collection) {
  const merged = {}
  const add = (entries, source) => {
    for (const [number, entry] of Object.entries(entries)) {
      if (number in merged) throw new Error(`${collection.id} #${number}: tarjima ikki marta berilgan (${source})`)
      merged[number] = entry
    }
  }

  if (exists(translationsPath(collection))) add(await readJson(translationsPath(collection)), 'flat')

  const dir = `translations/${collection.id}`
  if (exists(dir)) {
    const files = (await readdir(new URL(`${dir}/`, ROOT))).filter(
      (name) => name.endsWith('.uz.json') && name !== 'sections.uz.json',
    )
    for (const name of files.sort()) add(await readJson(`${dir}/${name}`), name)
  }
  return merged
}

async function loadSectionNames(collection) {
  const path = `translations/${collection.id}/sections.uz.json`
  return exists(path) ? readJson(path) : {}
}

/**
 * Manba ba'zi rivoyatlarni bir nechta raqamga bo'lib, to'liq matnni har biriga takrorlagan
 * (Buxoriy 299–301 kabi). Kitobda mergeRepeated yoqilgan bo'lsa, ketma-ket bir xil matnli
 * yozuvlar bitta hadisga birlashadi: raqam — birinchisiniki, numberTo — oxirgisiniki.
 * Bo'lim — guruhdagi birinchi noldan farqli bo'lim (takrorlar ko'pincha 0-bo'limga yozilgan).
 */
function mergeRepeated(hadiths) {
  const result = []
  for (const item of hadiths) {
    const previous = result.at(-1)
    if (previous && item.text.trim() && item.text.trim() === previous.text.trim()) {
      previous.numberTo = item.hadithnumber
      previous.merged.push(String(item.hadithnumber))
      if (!previous.reference?.book) previous.reference = item.reference
      continue
    }
    result.push({ ...item, merged: [] })
  }
  return result
}

/**
 * Har bir bo'limning o'z hadislari turgan uzluksiz raqam oraliqlari: { bo'lim: [[dan, gacha], …] }.
 * Bo'limlar raqamlar bo'yicha aralashishi mumkin (sectionFix; Termiziyda 33-bo'lim hadislari
 * 32-bo'lim oralig'ida) — shuning uchun firstHadith–lastHadith yetmaydi. Sayt «o'qildi»
 * belgilarini bo'limlar bo'yicha shu oraliqlar bilan sanaydi.
 */
function sectionRanges(groups) {
  const ordered = [...groups.entries()]
    .flatMap(([sectionNumber, hadiths]) =>
      hadiths.map((hadith) => ({ sectionNumber, from: hadith.number, to: hadith.numberTo ?? hadith.number })),
    )
    .sort((a, b) => a.from - b.from)

  const ranges = new Map()
  let current = null
  for (const item of ordered) {
    if (current?.sectionNumber === item.sectionNumber) {
      current.range[1] = item.to
      continue
    }
    current = { sectionNumber: item.sectionNumber, range: [item.from, item.to] }
    if (!ranges.has(item.sectionNumber)) ranges.set(item.sectionNumber, [])
    ranges.get(item.sectionNumber).push(current.range)
  }
  return ranges
}

const GRADES = new Set(['sahih', 'hasan', 'hasan-sahih'])

const index = []
let failed = false

for (const collection of COLLECTIONS) {
  const raw = await readJson(rawPath(collection))
  const translations = await loadTranslations(collection)
  const sectionNames = await loadSectionNames(collection)

  const groups = new Map()
  let skippedEmpty = 0
  const knownNumbers = new Set(raw.hadiths.map((item) => String(item.hadithnumber)))
  /*
   * 0-bo'lim nomsiz bo'lsa, unga yozilgan hadislar aslida oldingi hadisning bo'limiga tegishli.
   * Nomli bo'lsa ham (Muslimda "Introduction" — 1–92), section_details oralig'idan tashqaridagi
   * 0-bo'lim yozuvlari kitob bo'ylab sochilgan takrorlar — ular ham oldingi bo'limga o'tadi.
   */
  const zeroRange = raw.metadata?.section_details?.['0']
  const inSectionZero = (number) =>
    Boolean(raw.metadata?.sections?.['0']) &&
    (!zeroRange?.hadithnumber_last ||
      (number >= zeroRange.hadithnumber_first && number <= zeroRange.hadithnumber_last))
  let lastSection = 1

  for (const item of collection.mergeRepeated ? mergeRepeated(raw.hadiths) : raw.hadiths) {
    /* Manbada matni bo'sh yozuvlar bor — ular hadis emas, tushirib qoldiriladi */
    if (!item.text.trim()) {
      skippedEmpty += 1
      continue
    }

    for (const number of item.merged ?? []) {
      if (number in translations) {
        console.error(`${collection.id} #${number}: #${item.hadithnumber} bilan birlashtirilgan, tarjima oʻshanga yoziladi`)
        failed = true
      }
    }

    const translation = translations[String(item.hadithnumber)]
    /* Lotin yozuvidagi tarjimaga tasodifan kirill harfi aralashib qolmasin */
    for (const field of ['narratorUz', 'textUz', 'sourceUz']) {
      const match = translation?.[field]?.match(/\S*[Ѐ-ӿ]\S*/)
      if (match) throw new Error(`${collection.id} #${item.hadithnumber} ${field}: kirill harfi bor — "${match[0]}"`)
    }
    if (translation?.grade && !GRADES.has(translation.grade)) {
      throw new Error(`${collection.id} #${item.hadithnumber}: nomaʼlum daraja "${translation.grade}"`)
    }

    /* sectionFix — manbada bo'lim raqami xato belgilangan hadis ko'rsatilgan bo'limga o'tkaziladi */
    const sectionFix = translation?.sectionFix
    if (sectionFix != null && !(Number.isInteger(sectionFix) && String(sectionFix) in (raw.metadata?.sections ?? {}))) {
      throw new Error(`${collection.id} #${item.hadithnumber}: manbada yoʻq boʻlim "${sectionFix}" (sectionFix)`)
    }
    let sectionNumber = sectionFix ?? item.reference?.book ?? 1
    if (sectionNumber === 0 && !inSectionZero(item.hadithnumber)) sectionNumber = lastSection
    lastSection = sectionNumber
    if (!groups.has(sectionNumber)) groups.set(sectionNumber, [])
    groups.get(sectionNumber).push({
      number: item.hadithnumber,
      ...(item.numberTo != null ? { numberTo: item.numberTo } : {}),
      /* arabicFix — manbadagi aniq yozuv xatosi tuzatilgan joy (translations/ da hujjatlashtiriladi) */
      textArabic: cleanArabic(translation?.arabicFix ?? item.text),
      /* Rivoyatchi va manba bo'sh bo'lishi mumkin: ba'zi to'plamlarda isnod keltirilmagan */
      narratorUz: normalizeUzbek(translation?.narratorUz ?? ''),
      textUz: normalizeUzbek(translation?.textUz ?? ''),
      sourceUz: normalizeUzbek(translation?.sourceUz ?? ''),
      grade: translation?.grade ?? null,
      /* "ai" — avtomatik tarjima, tekshirilmagan; inson tekshirgach "reviewed" ga oʻzgartiriladi */
      translation: translation ? (translation.status ?? 'ai') : null,
    })
  }

  const extra = Object.keys(translations).filter((number) => !knownNumbers.has(number))
  if (extra.length > 0) {
    console.error(`${collection.id}: manbada yoʻq hadis raqamlari tarjimada bor: ${extra.join(', ')}`)
    failed = true
  }

  await rm(new URL(`${collection.id}/`, OUT), { recursive: true, force: true })

  const sections = []
  const ranges = sectionRanges(groups)
  for (const sectionNumber of [...groups.keys()].sort((a, b) => a - b)) {
    const hadiths = groups.get(sectionNumber)
    await writeJson(`${collection.id}/section/${sectionNumber}.json`, hadiths)
    sections.push({
      number: sectionNumber,
      nameUz: sectionNames[String(sectionNumber)] ? normalizeUzbek(sectionNames[String(sectionNumber)]) : null,
      nameEn: raw.metadata?.sections?.[String(sectionNumber)] || null,
      firstHadith: hadiths[0].number,
      lastHadith: hadiths.at(-1).numberTo ?? hadiths.at(-1).number,
      totalHadiths: hadiths.length,
      translatedHadiths: hadiths.filter((hadith) => hadith.translation).length,
      ranges: ranges.get(sectionNumber),
    })
  }
  await writeJson(`${collection.id}/sections.json`, sections)

  const total = sections.reduce((sum, section) => sum + section.totalHadiths, 0)
  const translated = sections.reduce((sum, section) => sum + section.translatedHadiths, 0)
  /* Bitta bo'limli kitobda bo'lim nomi ko'rsatilmaydi — ogohlantirish faqat ko'p bo'limlilarga */
  const unnamed = sections.length > 1 ? sections.filter((section) => !section.nameUz).length : 0

  index.push({
    id: collection.id,
    nameArabic: collection.nameArabic,
    nameUz: collection.nameUz,
    authorUz: collection.authorUz,
    descriptionUz: collection.descriptionUz,
    totalHadiths: total,
    translatedHadiths: translated,
    sections: sections.length,
  })

  console.log(
    `${collection.id}: ${translated}/${total} hadis tarjima qilingan, ${sections.length} ta boʻlim` +
      (unnamed > 0 ? ` (${unnamed} tasining oʻzbekcha nomi yoʻq)` : '') +
      (skippedEmpty > 0 ? `, matni boʻsh ${skippedEmpty} ta yozuv tushirildi` : ''),
  )
}

await writeJson('collections.json', index)
if (failed) process.exit(1)
