import { juzOfAyah } from '../lib/juz.js'
import { surahPageRange, surahXatmStatus, useXatm } from '../lib/xatm.js'
import { Badge } from './Ui.jsx'

/**
 * Sura haqida qisqa ma'lumot: qayerda nozil bo'lgani, oyatlar soni, mushafdagi o'rni.
 * Betlar va juzlar Madina mushafi jadvallaridan olinadi — suraning oyatlari yuklanishi shart emas.
 */
function surahInfoText(surah) {
  const range = surahPageRange(surah.number)
  if (!range) return null
  const [from, to] = range
  const place =
    surah.revelationPlace === 'makka'
      ? 'Makkada'
      : surah.revelationPlace === 'madina'
        ? 'Madinada'
        : null
  const total = surah.totalAyahs || surah.ayahs?.length
  const pages =
    from === to ? `${from}-sahifasida` : `${from}–${to}-sahifalarida (${to - from + 1} bet)`
  const firstJuz = juzOfAyah(surah.number, 1)
  const lastJuz = juzOfAyah(surah.number, total)
  const juz =
    !firstJuz || !lastJuz
      ? ''
      : firstJuz === lastJuz
        ? `, ${firstJuz}-juzda`
        : `, ${firstJuz}–${lastJuz}-juzlarda`
  return `${place ? `${place} nozil boʻlgan, ` : ''}${total} oyatdan iborat. Mushafning ${pages}${juz} joylashgan.`
}

/**
 * Sura sarlavhasi: kitobdagi nomi, ma'nosi, qisqa ma'lumot va belgilar.
 * Suralar va Sahifalar bo'limlarida bir xil ko'rinadi; atrofidagi Card'ni chaqiruvchi beradi.
 */
export default function SurahInfo({ surah, as: Title = 'h1' }) {
  const xatm = useXatm()
  const xatmStatus = surahXatmStatus(xatm, surah.number)

  return (
    <div className="flex items-start gap-4">
      <div className="bg-surface-2 hidden h-16 min-w-16 flex-none items-center justify-center rounded-md px-2 sm:flex">
        {/* Kitobdagi sura sarlavhasi xatti (KFGQPC surah-names): "002" → «البقرة» */}
        <span
          dir="ltr"
          className="text-accent text-[32px] leading-none"
          style={{ fontFamily: '"surah-names"' }}
          title={surah.nameArabic}
          aria-label={surah.nameArabic}
        >
          {String(surah.number).padStart(3, '0')}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <Title className="text-ink text-2xl font-extrabold tracking-tight">
          {surah.number}. {surah.nameUz}
        </Title>
        {surah.meaningUz ? (
          <p className="text-accent mt-0.5 text-lg font-semibold">{surah.meaningUz}</p>
        ) : null}
        <p className="text-ink-faint mt-2 text-[13px] leading-relaxed">{surahInfoText(surah)}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {surah.revelationPlace ? (
            <Badge>{surah.revelationPlace === 'makka' ? 'Makkiy' : 'Madaniy'}</Badge>
          ) : null}
          <Badge tone="accent">{surah.totalAyahs || surah.ayahs?.length} oyat</Badge>
          {surah.startPage ? <Badge>{surah.startPage}-sahifadan</Badge> : null}
          {xatmStatus ? (
            <Badge
              className="bg-emerald-500/10! text-emerald-500! tabular-nums"
              title={`${xatmStatus.from}–${xatmStatus.to}-betlar`}
            >
              {xatmStatus.done
                ? `✓ Toʻliq oʻqildi · ${xatmStatus.total} bet`
                : `${xatmStatus.read}/${xatmStatus.total} bet oʻqildi · ${xatmStatus.total - xatmStatus.read} ta qoldi`}
            </Badge>
          ) : null}
        </div>
      </div>
    </div>
  )
}
