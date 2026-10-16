import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import HadithCard from '../components/HadithCard.jsx'
import HadithReminderButton from '../components/HadithReminderButton.jsx'
import { ReadMarkButton } from '../components/PageReadMark.jsx'
import { ReaderPager } from '../components/Quran.jsx'
import { Alert, Loader, Segmented } from '../components/Ui.jsx'
import { sectionTitle, useCollection, useSectionHadiths } from '../lib/hadith.js'
import { hadithKey, toggleHadithRead, useHadithMarks } from '../lib/hadithMarks.js'
import { TEXT_MODES, usePref } from '../lib/reading.js'

/** /book/:id/s/:section/:number — bitta hadis, oldingi / keyingi (← → tugmalari ham) */
export default function HadithReadPage() {
  const { id, section, number } = useParams()
  const meta = useCollection(id)
  const data = useSectionHadiths(id, section)
  /* Qur'on o'qish sahifalari bilan umumiy: Ikkalasi / Arabcha / Tarjima */
  const [textMode, setTextMode] = usePref('text-mode', 'both')
  const marks = useHadithMarks()

  /* Keyingi hadisga o'tganda sahifa boshidan ko'rsatiladi */
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [id, section, number])

  const error = meta.error || data.error
  if (error) return <Alert>{error}</Alert>
  if (meta.loading || data.loading) return <Loader rows={2} />

  const { collection, sections } = meta
  const { hadiths } = data
  const sectionIndex = sections.findIndex((item) => String(item.number) === section)
  /* Birlashtirilgan rivoyat (299–301) oralig'idagi har qaysi raqam shu hadisni ochadi */
  const index = hadiths.findIndex(
    (item) =>
      String(item.number) === number ||
      (item.numberTo != null && Number(number) >= item.number && Number(number) <= item.numberTo),
  )
  const single = sections.length === 1

  const backTo = single ? `/book/${id}` : `/book/${id}/s/${section}`
  const backLabel = single || sectionIndex < 0 ? collection.nameUz : sectionTitle(sections[sectionIndex])

  if (index < 0) {
    return (
      <div className="space-y-4">
        <Alert>{`${number}-hadis topilmadi`}</Alert>
        <Link to={backTo} className="text-accent text-sm font-semibold">
          ← {backLabel}
        </Link>
      </div>
    )
  }

  const hadith = hadiths[index]
  const prevSection = sectionIndex > 0 ? sections[sectionIndex - 1] : null
  const nextSection = sectionIndex >= 0 ? (sections[sectionIndex + 1] ?? null) : null

  /* Bo'lim chegarasida: oldingi bo'limning oxirgi / keyingi bo'limning birinchi hadisiga o'tadi */
  const prev =
    index > 0
      ? { label: 'Oldingi hadis', to: `/book/${id}/s/${section}/${hadiths[index - 1].number}` }
      : prevSection
        ? {
            label: 'Oldingi boʻlim',
            to: `/book/${id}/s/${prevSection.number}/${prevSection.lastHadith}`,
          }
        : null
  const next =
    index < hadiths.length - 1
      ? { label: 'Keyingi hadis', to: `/book/${id}/s/${section}/${hadiths[index + 1].number}` }
      : nextSection
        ? {
            label: 'Keyingi boʻlim',
            to: `/book/${id}/s/${nextSection.number}/${nextSection.firstHadith}`,
          }
        : null

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          to={backTo}
          className="text-ink-faint hover:text-accent inline-flex min-w-0 items-center gap-1.5 text-[13px] font-semibold transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 flex-none"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="truncate">{backLabel}</span>
        </Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <HadithReminderButton collection={collection} hadith={hadith} />
          <Segmented options={TEXT_MODES} value={textMode} onChange={setTextMode} />
        </div>
      </div>

      <HadithCard key={hadith.number} hadith={hadith} mode={textMode} />

      <ReadMarkButton
        readAt={marks[hadithKey(id, hadith.number)]}
        onToggle={() => toggleHadithRead(id, hadith.number)}
      />

      <ReaderPager keyboard label={`${index + 1} / ${hadiths.length}`} prev={prev} next={next} />
    </>
  )
}
