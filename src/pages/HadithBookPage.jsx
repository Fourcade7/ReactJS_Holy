import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import BackLink from '../components/BackLink.jsx'
import HadithBookInfo from '../components/HadithBookInfo.jsx'
import HadithReadToggle, {
  READ_ROW,
  READ_TILE,
  ReadStatusBadge,
  SectionReadToggle,
} from '../components/HadithReadToggle.jsx'
import { SavedReminderMark } from '../components/HadithReminderButton.jsx'
import {
  Alert,
  Badge,
  Card,
  Diamond,
  PageHeader,
  Progress,
  Skeleton,
  cn,
} from '../components/Ui.jsx'
import { LIST_BOX, rowClass, useListView, ViewToggle } from '../components/ViewToggle.jsx'
import {
  GRADES,
  hadithExcerpt,
  narratorName,
  sectionTitle,
  useCollection,
  useSectionHadiths,
} from '../lib/hadith.js'
import {
  hadithKey,
  markedNumbers,
  readStatusLabel,
  sectionReadStatus,
  useHadithMarks,
} from '../lib/hadithMarks.js'
import { hadithReminderSource, useSavedHadithSources } from '../lib/reminders.js'

/* Suralar ro'yxati bilan bir xil to'r: tor ekranda 1, sm da 2, keng ekranda 3 ustun.
   grid-cols-1 shart: aks holda bir ustunli to'r uzun matn kengligiga cho'zilib, ekrandan chiqib ketadi */
const GRID = 'grid grid-cols-1 gap-3 sm:grid-cols-2 min-[75rem]:grid-cols-3'

function GridSkeleton() {
  return (
    <div className={GRID}>
      {Array.from({ length: 9 }).map((_, index) => (
        <Skeleton key={index} className="h-[104px]" />
      ))}
    </div>
  )
}

/* Katak / ro'yxat almashtirgichi — ro'yxat ustida, o'ngda */
function ViewBar({ view, onChange }) {
  return (
    <div className="mb-4 flex justify-end">
      <ViewToggle view={view} onChange={onChange} />
    </div>
  )
}

/* «12/148 hadis o'qildi» — suralardagi «12/48 bet o'qildi» kabi, faqat nimadir belgilangan bo'lsa */
function ReadStatusLine({ status, className }) {
  if (!status.read) return null
  return (
    <p
      className={cn(
        'truncate text-[11px] font-semibold whitespace-nowrap text-emerald-500 tabular-nums',
        className,
      )}
    >
      {readStatusLabel(status)}
    </p>
  )
}

function SectionTile({ collectionId, section, index, status }) {
  const { totalHadiths: total, translatedHadiths: translated } = section
  const complete = translated === total

  return (
    <Link
      to={`/book/${collectionId}/s/${section.number}`}
      className="animate-rise"
      style={{ animationDelay: `${Math.min(index, 12) * 25}ms` }}
    >
      <Card
        className={cn(
          'group hover:border-accent/50 relative flex h-full items-start gap-3 p-4 transition-colors',
          status.done && READ_TILE,
        )}
      >
        <SectionReadToggle collectionId={collectionId} section={section} status={status} />
        <Diamond className="group-hover:bg-accent/15">{section.number}</Diamond>

        <div className="min-w-0 flex-1 pr-4">
          <p className="text-ink line-clamp-2 leading-snug font-bold">{sectionTitle(section)}</p>
          <p className="text-ink-faint mt-0.5 text-[13px]">
            {total} ta hadis
            {complete ? ' · tarjima tayyor' : translated === 0 ? ' · tarjimasiz' : null}
          </p>
          <ReadStatusLine status={status} className="mt-0.5" />
          {!complete && translated > 0 ? (
            <div className="mt-2">
              <Progress value={translated} total={total} />
              <p className="text-ink-faint mt-1 text-[11px] font-semibold tabular-nums">
                {translated}/{total} tarjima qilingan
              </p>
            </div>
          ) : null}
        </div>
      </Card>
    </Link>
  )
}

function HadithTile({ collectionId, sectionNumber, hadith, index, readAt, saved }) {
  const name = narratorName(hadith.narratorUz)

  return (
    <Link
      to={`/book/${collectionId}/s/${sectionNumber}/${hadith.number}`}
      className="animate-rise"
      style={{ animationDelay: `${Math.min(index, 12) * 25}ms` }}
    >
      <Card
        className={cn(
          'group hover:border-accent/50 relative flex h-full items-start gap-3 p-4 transition-colors',
          readAt && READ_TILE,
        )}
      >
        <HadithReadToggle collectionId={collectionId} number={hadith.number} readAt={readAt} />
        {/* O'qildi doirachasi ostida, o'sha ustunda */}
        {saved ? <SavedReminderMark className="absolute top-8 right-2" /> : null}
        <Diamond className="group-hover:bg-accent/15">{hadith.number}</Diamond>

        <div className="min-w-0 flex-1 pr-4">
          {!hadith.textUz ? (
            /* Tarjimasi hali yo'q: sarlavha — arabcha matnning boshi */
            <>
              <p
                lang="ar"
                className="arabic-hadith text-ink line-clamp-2 text-lg"
                style={{ lineHeight: 1.8 }}
              >
                {hadith.textArabic}
              </p>
              <Badge className="mt-2">Tarjimasiz</Badge>
            </>
          ) : name ? (
            <>
              <p className="text-ink truncate font-bold">{name}</p>
              <p className="text-ink-faint mt-0.5 line-clamp-2 text-[13px] leading-snug">
                {hadithExcerpt(hadith.textUz)}
              </p>
            </>
          ) : (
            /* Rivoyatchi nomi yo'q (yoki uzun isnod zanjiri): sarlavha — mazmun, ostida arabcha matn */
            <>
              <p className="text-ink line-clamp-2 leading-snug font-bold">
                {hadithExcerpt(hadith.textUz)}
              </p>
              <p
                lang="ar"
                className="arabic-hadith text-ink-faint mt-1 truncate text-lg"
                style={{ lineHeight: 1.8 }}
              >
                {hadith.textArabic}
              </p>
            </>
          )}
          {hadith.grade ? (
            <Badge tone="accent" className="mt-2">
              {GRADES[hadith.grade]}
            </Badge>
          ) : null}
        </div>
      </Card>
    </Link>
  )
}

/** Jadval uslubidagi hadislar ro'yxati: belgi · raqam · sarlavha · arabcha boshi */
function HadithList({ collectionId, sectionNumber, hadiths, marks, savedSources }) {
  return (
    <div className={LIST_BOX}>
      {hadiths.map((hadith, index) => {
        const name = narratorName(hadith.narratorUz)
        const readAt = marks[hadithKey(collectionId, hadith.number)]
        const saved = savedSources.has(hadithReminderSource(collectionId, hadith.number))
        return (
          <Link
            key={hadith.number}
            to={`/book/${collectionId}/s/${sectionNumber}/${hadith.number}`}
            className={cn(
              rowClass(index),
              'grid grid-cols-[1.5rem_3rem_1fr] items-center gap-3 px-4 py-2.5 md:grid-cols-[1.5rem_3rem_1fr_minmax(0,16rem)]',
              readAt && READ_ROW,
            )}
          >
            <HadithReadToggle
              collectionId={collectionId}
              number={hadith.number}
              readAt={readAt}
              className="justify-self-center"
            />
            <span className="text-ink-faint text-sm font-semibold tabular-nums">{hadith.number}</span>
            <span className="min-w-0">
              {hadith.textUz ? (
                <>
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="text-ink group-hover:text-accent truncate text-[15px] font-semibold transition-colors">
                      {name || hadithExcerpt(hadith.textUz)}
                    </span>
                    {saved ? <SavedReminderMark className="flex-none" /> : null}
                  </span>
                  {name ? (
                    <span className="text-ink-faint block truncate text-xs">
                      {hadithExcerpt(hadith.textUz)}
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="text-ink-faint text-sm">Tarjimasiz</span>
                  {saved ? <SavedReminderMark className="flex-none" /> : null}
                </span>
              )}
            </span>
            <span
              lang="ar"
              dir="rtl"
              className="arabic-hadith text-ink-soft hidden truncate text-right text-lg md:block"
              style={{ lineHeight: 1.8 }}
            >
              {hadith.textArabic}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

/** Jadval uslubidagi bo'limlar ro'yxati: raqam · nom · hadislar oralig'i · belgi */
function SectionList({ collectionId, sections, statuses }) {
  return (
    <div className={LIST_BOX}>
      {sections.map((section, index) => {
        const { totalHadiths: total, translatedHadiths: translated } = section
        const status = statuses.get(section.number)
        return (
          <Link
            key={section.number}
            to={`/book/${collectionId}/s/${section.number}`}
            className={cn(
              rowClass(index),
              'grid grid-cols-[2.5rem_1fr_auto_1.5rem] items-center gap-3 px-4 py-2.5 sm:grid-cols-[2.5rem_1fr_auto_auto_1.5rem]',
              status.done && READ_ROW,
            )}
          >
            <span className="text-ink-faint text-sm font-semibold tabular-nums">{section.number}</span>
            <span className="min-w-0">
              <span className="text-ink group-hover:text-accent block truncate text-[15px] font-semibold transition-colors">
                {sectionTitle(section)}
              </span>
              {section.nameEn && section.nameUz ? (
                <span className="text-ink-faint block truncate text-xs">{section.nameEn}</span>
              ) : null}
              <ReadStatusLine status={status} />
            </span>
            <span className="hidden sm:block">
              {translated === total ? (
                <Badge tone="accent">tayyor</Badge>
              ) : translated > 0 ? (
                <Badge>
                  {translated}/{total}
                </Badge>
              ) : null}
            </span>
            <span className="text-ink-soft text-right text-sm tabular-nums">
              {section.firstHadith != null ? (
                <>
                  {section.firstHadith}
                  <span className="text-ink-faint mx-2">–</span>
                  {section.lastHadith}
                </>
              ) : (
                `${total} ta`
              )}
            </span>
            <SectionReadToggle
              collectionId={collectionId}
              section={section}
              status={status}
              className="justify-self-center"
            />
          </Link>
        )
      })}
    </div>
  )
}

/** Kitobning bo'limlari (kitoblari) to'ri — ustida kitob haqida ma'lumot */
function SectionGrid({ collection, sections }) {
  const [view, changeView] = useListView()
  const marks = useHadithMarks()
  /* Har bir bo'lim nechta hadisi belgilangan — suralar ro'yxatidagi kabi */
  const statuses = useMemo(() => {
    const numbers = markedNumbers(marks, collection.id)
    return new Map(sections.map((section) => [section.number, sectionReadStatus(numbers, section)]))
  }, [marks, collection.id, sections])

  return (
    <>
      <BackLink to="/books" label="Hadislar" />
      <HadithBookInfo collection={collection} />

      <ViewBar view={view} onChange={changeView} />

      {view === 'list' ? (
        <SectionList collectionId={collection.id} sections={sections} statuses={statuses} />
      ) : (
        <div className={GRID}>
          {sections.map((section, index) => (
            <SectionTile
              key={section.number}
              collectionId={collection.id}
              section={section}
              index={index}
              status={statuses.get(section.number)}
            />
          ))}
        </div>
      )}
    </>
  )
}

/** Bitta bo'limdagi hadislar to'ri */
function HadithGrid({ collection, sections, sectionNumber }) {
  const { hadiths, error, loading } = useSectionHadiths(collection.id, sectionNumber)
  const [view, changeView] = useListView()
  const marks = useHadithMarks()
  const savedSources = useSavedHadithSources()
  const single = sections.length === 1
  const section = sections.find((item) => String(item.number) === String(sectionNumber))

  if (error) return <Alert>{error}</Alert>
  if (loading) return <GridSkeleton />
  if (!section) return <Alert>{`${sectionNumber}-boʻlim topilmadi`}</Alert>

  const translated = hadiths.filter((hadith) => hadith.translation).length
  const read = hadiths.filter((hadith) => marks[hadithKey(collection.id, hadith.number)]).length
  const status = { read, total: hadiths.length, done: read >= hadiths.length }

  return (
    <>
      <BackLink
        to={single ? '/books' : `/book/${collection.id}`}
        label={single ? 'Hadislar' : collection.nameUz}
      />
      {/* Bitta bo'limli kitob ochilganda darhol hadislar chiqadi — ustida kitob haqida ma'lumot */}
      {single ? (
        <HadithBookInfo collection={collection} />
      ) : (
        <PageHeader
          title={sectionTitle(section)}
          subtitle={`${collection.nameUz} · ${section.number}-boʻlim · ${hadiths.length} ta hadis`}
        >
          <ReadStatusBadge status={status} />
        </PageHeader>
      )}

      <div className="mb-6">
        {translated === 0 ? (
          <Alert tone="notice">
            Bu boʻlim hali tarjima qilinmagan — hozircha faqat arabcha matn koʻrsatiladi.
          </Alert>
        ) : (
          <Alert tone="notice">
            Oʻzbekcha tarjima arabcha matndan sunʼiy intellekt yordamida tayyorlangan va hali
            mutaxassis tomonidan tekshirilmagan. Muhim masalalarda ishonchli manbalarga murojaat
            qiling.
          </Alert>
        )}
      </div>

      <ViewBar view={view} onChange={changeView} />

      {view === 'list' ? (
        <HadithList
          collectionId={collection.id}
          sectionNumber={section.number}
          hadiths={hadiths}
          marks={marks}
          savedSources={savedSources}
        />
      ) : (
        <div className={GRID}>
          {hadiths.map((hadith, index) => (
            <HadithTile
              key={hadith.number}
              collectionId={collection.id}
              sectionNumber={section.number}
              hadith={hadith}
              index={index}
              readAt={marks[hadithKey(collection.id, hadith.number)]}
              saved={savedSources.has(hadithReminderSource(collection.id, hadith.number))}
            />
          ))}
        </div>
      )}
    </>
  )
}

/** /book/:id — bo'limlar to'ri (yoki bitta bo'limli kitobda hadislar), /book/:id/s/:section — hadislar */
export default function HadithBookPage() {
  const { id, section } = useParams()
  const { collection, sections, error, loading } = useCollection(id)

  if (error) {
    return (
      <div className="space-y-4">
        <Alert>{error}</Alert>
        <Link to="/books" className="text-accent text-sm font-semibold">
          ← Hadislar
        </Link>
      </div>
    )
  }
  if (loading) return <GridSkeleton />

  const sectionNumber = section ?? (sections.length === 1 ? sections[0].number : null)
  if (sectionNumber === null) return <SectionGrid collection={collection} sections={sections} />

  return <HadithGrid collection={collection} sections={sections} sectionNumber={sectionNumber} />
}
