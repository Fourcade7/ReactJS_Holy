import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { errorMessage } from '../api/client.js'
import { collectionApi } from '../api/hadith.js'
import { READ_ROW, READ_TILE } from '../components/HadithReadToggle.jsx'
import { Alert, Badge, Card, Loader, PageHeader, cn } from '../components/Ui.jsx'
import { LIST_BOX, rowClass, useListView, ViewToggle } from '../components/ViewToggle.jsx'
import { collectionReadStatus, readStatusLabel, useHadithMarks } from '../lib/hadithMarks.js'

/** /books — hadis kitoblari ro'yxati */
export default function HadithBooksPage() {
  const [collections, setCollections] = useState(null)
  const [error, setError] = useState('')
  const [view, changeView] = useListView()
  const marks = useHadithMarks()

  useEffect(() => {
    collectionApi
      .list()
      .then(setCollections)
      .catch((err) => setError(errorMessage(err)))
  }, [])

  return (
    <>
      <PageHeader title="Kitoblar" subtitle="Hadis toʻplamlari — arabcha matn va oʻzbekcha tarjima">
        {collections ? <ViewToggle view={view} onChange={changeView} /> : null}
      </PageHeader>
      <Alert>{error}</Alert>
      {!collections && !error ? <Loader rows={2} /> : null}

      {view === 'list' ? (
        <div className={LIST_BOX}>
          {collections?.map((collection, index) => {
            const status = collectionReadStatus(marks, collection)
            return (
              <Link
                key={collection.id}
                to={`/book/${collection.id}`}
                className={cn(
                  rowClass(index),
                  'grid grid-cols-[2rem_1fr_auto] items-center gap-3 px-4 py-3',
                  status.done && READ_ROW,
                )}
              >
                <span className="text-ink-faint text-sm font-semibold tabular-nums">{index + 1}</span>
                <span className="min-w-0">
                  <span className="text-ink group-hover:text-accent block truncate font-semibold transition-colors">
                    {collection.nameUz}
                  </span>
                  <span className="text-ink-faint block truncate text-xs">
                    {collection.authorUz} · {collection.totalHadiths} ta hadis
                    {collection.translatedHadiths < collection.totalHadiths
                      ? ` · ${collection.translatedHadiths}/${collection.totalHadiths} tarjima`
                      : ''}
                  </span>
                  {status.read ? (
                    <span className="block truncate text-[11px] font-semibold text-emerald-500 tabular-nums">
                      {readStatusLabel(status)}
                    </span>
                  ) : null}
                </span>
                <span lang="ar" dir="rtl" className="arabic-hadith text-ink-soft text-xl">
                  {collection.nameArabic}
                </span>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {collections?.map((collection, index) => {
            const status = collectionReadStatus(marks, collection)
            return (
              <Link
                key={collection.id}
                to={`/book/${collection.id}`}
                className="group animate-rise block h-full"
                style={{ animationDelay: `${Math.min(index, 12) * 25}ms` }}
              >
                <Card
                  className={cn(
                    'group-hover:border-accent flex h-full flex-col p-5 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg',
                    status.done && READ_TILE,
                  )}
                >
                  <span
                    lang="ar"
                    dir="rtl"
                    className="arabic-hadith text-ink-soft group-hover:text-accent block text-right text-2xl leading-snug transition-colors"
                  >
                    {collection.nameArabic}
                  </span>
                  <h2 className="text-ink mt-3 text-lg font-bold tracking-tight">{collection.nameUz}</h2>
                  <p className="text-ink-faint mt-0.5 text-sm">{collection.authorUz}</p>
                  <p className="text-ink-soft mt-3 line-clamp-4 flex-1 text-sm leading-relaxed">
                    {collection.descriptionUz}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge>{collection.totalHadiths} ta hadis</Badge>
                    {collection.sections > 1 ? <Badge>{collection.sections} ta boʻlim</Badge> : null}
                    {collection.translatedHadiths < collection.totalHadiths ? (
                      <Badge tone="accent">
                        {collection.translatedHadiths}/{collection.totalHadiths} tarjima qilingan
                      </Badge>
                    ) : null}
                    {/* Kitobdan nechta hadis o'qildi deb belgilangan */}
                    {status.read ? (
                      <Badge className="bg-emerald-500/10! text-emerald-500! tabular-nums">
                        {readStatusLabel(status)}
                      </Badge>
                    ) : null}
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
