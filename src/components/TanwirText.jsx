import { Fragment } from 'react'

/**
 * «At-Tanvir fi isqot at-tadbir», «Tahajjud va uni osonlashtiruvchi sabablar» va «Ogʻir sinov va yangi tugʻilish» matni uchun bezak
 * (Book.jsx dagi LinkedText chaqiradi):
 *   - «oyat» (Sura, 14) yoki „oyat“ (Sura, 3–4) — oyat tarjimasidagi tafsir paneli uslubida alohida kartochka;
 *   - Alloh, Rasululloh, Paygʻambar, Muhammad (sollallohu alayhi vasallam bilan birga) — qalin.
 * Iqtibos ichidagi oyat („…“) ham ajratiladi. `children` — qolgan oddiy matnni chizuvchi funksiya (havolalar uchun).
 */

const REF = String.raw`\(([\p{L}ʼʻ' ]{2,20}),\s*(\d+(?:\s*[–-]\s*\d+)?)\)`
const AYAH = new RegExp(String.raw`«([^«»]+)»\s*${REF}|„([^„“]+)“\s*${REF}`, 'gu')

const NAMES =
  /(?<!\p{L})(?:Rasululloh\p{L}*|Paygʻambar(?!lar)\p{L}*|(?<!(?:ibn|Abu) )Muhammad(?! ibn)\p{L}*|Alloh\p{L}*(?: taolo\p{L}*)?)(?: sollallohu alayhi va ?sallam\p{L}*| alayhissalotu vassalom)?/gu

/* `strict` rejimi: «Muhammad» faqat salavot bilan kelganda ajratiladi — xotira kitobida bu ism
   ko'pincha boshqa odamlarniki (Muhammad Hanif, Mulla Muhammad Umar...) */
const NAMES_STRICT =
  /(?<!\p{L})(?:Rasululloh\p{L}*|Paygʻambar(?!lar)\p{L}*|Muhammad\p{L}*(?= sollallohu| alayhissalotu)|Alloh\p{L}*(?: taolo\p{L}*)?)(?: sollallohu alayhi va ?sallam\p{L}*| alayhissalotu vassalom)?/gu

function Names({ text, strict, children }) {
  const parts = []
  let last = 0
  for (const match of text.matchAll(strict ? NAMES_STRICT : NAMES)) {
    parts.push(<Fragment key={`t${last}`}>{children(text.slice(last, match.index))}</Fragment>)
    parts.push(
      <strong key={`n${match.index}`} className="text-ink font-bold">
        {match[0]}
      </strong>,
    )
    last = match.index + match[0].length
  }
  parts.push(<Fragment key={`t${last}`}>{children(text.slice(last))}</Fragment>)
  return parts
}

function AyahCard({ text, surah, ayahs, strict, children }) {
  const label = /[–-]/.test(ayahs) ? `${ayahs}-oyatlar` : `${ayahs}-oyat`
  return (
    <span className="border-accent bg-surface-2 txt-uz-sub my-3 block rounded-r-md border-l-[3px] px-4 py-2.5">
      <span className="text-ink-faint mb-1 block text-[11px] font-semibold">
        Qurʼon · {surah} surasi, {label}
      </span>
      <span className="text-ink block">
        <Names text={text} strict={strict}>
          {children}
        </Names>
      </span>
    </span>
  )
}

export default function TanwirText({ text, strictNames = false, children }) {
  const parts = []
  let last = 0
  for (const match of text.matchAll(AYAH)) {
    const before = text.slice(last, match.index).trimEnd()
    if (before)
      parts.push(
        <Names key={`t${last}`} text={before} strict={strictNames}>
          {children}
        </Names>,
      )
    parts.push(
      <AyahCard
        key={`a${match.index}`}
        text={match[1] ?? match[4]}
        surah={match[2] ?? match[5]}
        ayahs={(match[3] ?? match[6]).replace(/\s+/g, '')}
        strict={strictNames}
      >
        {children}
      </AyahCard>,
    )
    last = match.index + match[0].length
    /* Kartochkadan keyingi matn tinish belgisi bilan boshlanmasin */
    last += text.slice(last).match(/^[\s.,;:]*/)[0].length
  }
  const rest = text.slice(last)
  if (rest)
    parts.push(
      <Names key={`t${last}`} text={rest} strict={strictNames}>
        {children}
      </Names>,
    )
  return parts
}
