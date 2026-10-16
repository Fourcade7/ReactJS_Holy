import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { bookApi } from '../api/books.js'
import { errorMessage } from '../api/client.js'
import { READ_ROW, READ_TILE } from '../components/HadithReadToggle.jsx'
import { Alert, Badge, Card, Loader, PageHeader, cn } from '../components/Ui.jsx'
import { LIST_BOX, rowClass, useListView, ViewToggle } from '../components/ViewToggle.jsx'
import { bookReadStatus, useBookMarks } from '../lib/bookMarks.js'
import { bookPath } from '../lib/books.js'
import { readStatusLabel } from '../lib/hadithMarks.js'

/** /library — kitoblar ro'yxati (hadis to'plamlari alohida: /books) */
export default function LibraryPage() {
  const [books, setBooks] = useState(null)
  const [error, setError] = useState('')
  const [view, changeView] = useListView()
  const marks = useBookMarks()

  useEffect(() => {
    bookApi
      .list()
      .then(setBooks)
      .catch((err) => setError(errorMessage(err)))
  }, [])

  return (
    <>
      <PageHeader title="Kitoblar" subtitle="Oʻzbekcha tarjimadagi kitoblar — boʻlaklab oʻqish va belgilash">
        {books ? <ViewToggle view={view} onChange={changeView} /> : null}
      </PageHeader>
      <Alert>{error}</Alert>
      {!books && !error ? <Loader rows={2} /> : null}

      {view === 'list' ? (
        <div className={LIST_BOX}>
          {books?.map((book, index) => {
            const status = bookReadStatus(marks, book)
            return (
              <Link
                key={book.id}
                to={bookPath(book.id)}
                className={cn(
                  rowClass(index),
                  'grid grid-cols-[2rem_1fr_auto] items-center gap-3 px-4 py-3',
                  status.done && READ_ROW,
                )}
              >
                <span className="text-ink-faint text-sm font-semibold tabular-nums">{index + 1}</span>
                <span className="min-w-0">
                  <span className="text-ink group-hover:text-accent block truncate font-semibold transition-colors">
                    {book.nameUz}
                  </span>
                  <span className="text-ink-faint block truncate text-xs">
                    {book.authorUz} · {book.totalItems} ta {book.itemName}
                  </span>
                  {status.read ? (
                    <span className="block truncate text-[11px] font-semibold text-emerald-500 tabular-nums">
                      {readStatusLabel(status, book.itemName)}
                    </span>
                  ) : null}
                </span>
                <span lang="ar" dir="rtl" className="arabic-hadith text-ink-soft text-xl">
                  {book.nameArabic}
                </span>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {books?.map((book, index) => {
            const status = bookReadStatus(marks, book)
            return (
              <Link
                key={book.id}
                to={bookPath(book.id)}
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
                    {book.nameArabic}
                  </span>
                  <h2 className="text-ink mt-3 text-lg font-bold tracking-tight">{book.nameUz}</h2>
                  <p className="text-ink-faint mt-0.5 text-sm">{book.authorUz}</p>
                  <p className="text-ink-soft mt-3 line-clamp-4 flex-1 text-sm leading-relaxed">
                    {book.descriptionUz}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge>
                      {book.totalItems} ta {book.itemName}
                    </Badge>
                    {status.read ? (
                      <Badge className="bg-emerald-500/10! text-emerald-500! tabular-nums">
                        {readStatusLabel(status, book.itemName)}
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
