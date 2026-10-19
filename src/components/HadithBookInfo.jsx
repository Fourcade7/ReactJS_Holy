import { collectionReadStatus, useHadithMarks } from '../lib/hadithMarks.js'
import { ReadStatusBadge } from './HadithReadToggle.jsx'
import { Badge, Card } from './Ui.jsx'

/**
 * Hadis kitobi haqida ma'lumot: nomi, muallifi, qisqa tavsifi va belgilar — Kitoblar ro'yxatidagi
 * kartochka bilan bir xil ma'lumot, kitob ochilganda bo'limlar ustida to'liq ko'rinadi.
 */
export default function HadithBookInfo({ collection }) {
  const { totalHadiths: total, translatedHadiths: translated } = collection
  /* Kitob bo'yicha nechta hadis o'qildi deb belgilangan — SurahInfo dagi kabi */
  const status = collectionReadStatus(useHadithMarks(), collection)

  return (
    <Card className="animate-rise mb-7 p-5 sm:p-6">
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <h1 className="font-display text-ink text-3xl tracking-tight">{collection.nameUz}</h1>
          <p className="text-ink-faint mt-1 text-sm">{collection.authorUz}</p>
        </div>
        <span lang="ar" dir="rtl" className="arabic-hadith text-accent text-3xl leading-snug">
          {collection.nameArabic}
        </span>
      </div>

      {collection.descriptionUz ? (
        <p className="text-ink-soft mt-4 max-w-4xl text-justify text-[15px] leading-relaxed">
          {collection.descriptionUz}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge>{total} ta hadis</Badge>
        {collection.sections > 1 ? <Badge>{collection.sections} ta boʻlim</Badge> : null}
        {translated < total ? (
          <Badge tone="accent">
            {translated}/{total} tarjima qilingan
          </Badge>
        ) : (
          <Badge tone="accent">Tarjima tayyor</Badge>
        )}
        <ReadStatusBadge status={status} />
      </div>
    </Card>
  )
}
