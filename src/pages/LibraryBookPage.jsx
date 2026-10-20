import { Link, useParams } from 'react-router-dom'
import BackLink from '../components/BackLink.jsx'
import { BOOK_GRID, BookItemReadToggle } from '../components/Book.jsx'
import { READ_ROW, READ_TILE, ReadStatusBadge } from '../components/HadithReadToggle.jsx'
import { Alert, Badge, Card, Diamond, Skeleton, cn } from '../components/Ui.jsx'
import { LIST_BOX, rowClass, useListView, ViewToggle } from '../components/ViewToggle.jsx'
import { bookItemKey, bookReadStatus, useBookMarks } from '../lib/bookMarks.js'
import { itemLabel, itemPath, textPagePath, useBook } from '../lib/books.js'

function GridSkeleton() {
  return (
    <div className={BOOK_GRID}>
      {Array.from({ length: 9 }).map((_, index) => (
        <Skeleton key={index} className="h-[104px]" />
      ))}
    </div>
  )
}

/** Kitob haqida: nomi, muallifi, tavsifi, belgilar va «davom etish» — HadithBookInfo kabi */
function BookInfo({ book, status, nextUnread }) {
  return (
    <Card className="animate-rise mb-6 p-5 sm:p-6">
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <h1 className="font-display text-ink text-3xl tracking-tight">{book.nameUz}</h1>
          <p className="text-ink-faint mt-1 text-sm">
            {book.authorUz}
            {book.subtitleUz ? ` · ${book.subtitleUz}` : null}
          </p>
        </div>
        <span lang="ar" dir="rtl" className="arabic-hadith text-accent text-3xl leading-snug">
          {book.nameArabic}
        </span>
      </div>

      {book.descriptionUz ? (
        <p className="text-ink-soft mt-4 max-w-4xl text-justify text-[15px] leading-relaxed">
          {book.descriptionUz}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge>
          {book.totalItems} ta {book.itemName}
        </Badge>
        <ReadStatusBadge status={status} itemName={book.itemName} />
        {/* Birinchi belgilanmagan bo'lak — 264 ta hikmat ichidan qolgan joyni qidirmaslik uchun */}
        {nextUnread ? (
          <Link
            to={itemPath(book.id, nextUnread.number)}
            className="bg-accent hover:bg-accent/90 ml-auto inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-semibold text-white transition-colors"
          >
            {status.read ? `Davom etish · ${itemLabel(book, nextUnread.number)}` : 'Oʻqishni boshlash'}
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        ) : null}
      </div>
    </Card>
  )
}

/** Muqaddima, Atamalar lug'ati kabi matn sahifalariga havolalar */
function TextPageLinks({ book, pages }) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {pages.map((page) => (
        <Link key={page.slug} to={textPagePath(book.id, page.slug)} className="group">
          <Card className="group-hover:border-accent/50 flex h-full items-center gap-3 p-4 transition-colors">
            <span className="bg-surface-2 text-accent flex h-10 w-10 flex-none items-center justify-center rounded-md">
              <svg
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
                <path d="M14 3v5h5M9 13h6M9 17h4" />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-ink group-hover:text-accent block font-bold transition-colors">
                {page.title}
              </span>
              <span className="text-ink-faint block truncate text-[13px]">{page.summaryUz}</span>
            </span>
          </Card>
        </Link>
      ))}
    </div>
  )
}

function ItemTile({ book, item, index, readAt }) {
  return (
    <Link
      to={itemPath(book.id, item.number)}
      className="animate-rise"
      style={{ animationDelay: `${Math.min(index, 12) * 25}ms` }}
    >
      <Card
        className={cn(
          'group hover:border-accent/50 relative flex h-full items-start gap-3 p-4 transition-colors',
          readAt && READ_TILE,
        )}
      >
        <BookItemReadToggle book={book} number={item.number} readAt={readAt} />
        <Diamond className="group-hover:bg-accent/15">{item.number}</Diamond>

        <div className="min-w-0 flex-1 pr-4">
          {/* Bobda — nomi va mundarijadagi qisqa tavsifi, hikmatda — matnining boshi */}
          <p className="text-ink line-clamp-3 text-[14px] leading-snug font-semibold">
            {item.title ?? item.text}
          </p>
          {item.summaryUz ? (
            <p className="text-ink-faint mt-1 line-clamp-2 text-[13px] leading-snug">{item.summaryUz}</p>
          ) : null}
          {item.commentary ? <Badge className="mt-2">Sharh bilan</Badge> : null}
        </div>
      </Card>
    </Link>
  )
}

/** Jadval uslubidagi ro'yxat: belgi · raqam · matn boshi (bob nomi va tavsifi) · sharh */
function ItemList({ book, items, marks }) {
  return (
    <div className={LIST_BOX}>
      {items.map((item, index) => {
        const readAt = marks[bookItemKey(book.id, item.number)]
        return (
          <Link
            key={item.number}
            to={itemPath(book.id, item.number)}
            className={cn(
              rowClass(index),
              'grid grid-cols-[1.5rem_2.5rem_1fr] items-center gap-3 px-4 py-2.5 sm:grid-cols-[1.5rem_2.5rem_1fr_auto]',
              readAt && READ_ROW,
            )}
          >
            <BookItemReadToggle
              book={book}
              number={item.number}
              readAt={readAt}
              className="justify-self-center"
            />
            <span className="text-ink-faint text-sm font-semibold tabular-nums">{item.number}</span>
            <span className="min-w-0">
              <span className="text-ink group-hover:text-accent block truncate text-[15px] font-medium transition-colors">
                {item.title ?? item.text}
              </span>
              {item.summaryUz ? (
                <span className="text-ink-faint block truncate text-xs">{item.summaryUz}</span>
              ) : null}
            </span>
            <span className="hidden sm:block">
              {item.commentary ? <Badge>Sharh</Badge> : null}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

/** /library/:id — kitob haqida, matn sahifalari va bo'laklar (hikmatlar, boblar) to'ri */
export default function LibraryBookPage() {
  const { id } = useParams()
  const { book, content, error, loading } = useBook(id)
  const [view, changeView] = useListView()
  const marks = useBookMarks()

  if (error) {
    return (
      <div className="space-y-4">
        <Alert>{error}</Alert>
        <Link to="/library" className="text-accent text-sm font-semibold">
          ← Kitoblar
        </Link>
      </div>
    )
  }
  if (loading) return <GridSkeleton />

  const { items, pages } = content
  const status = bookReadStatus(marks, book)
  const nextUnread = items.find((item) => !marks[bookItemKey(book.id, item.number)])

  return (
    <>
      <BackLink to="/library" label="Kitoblar" />
      <BookInfo book={book} status={status} nextUnread={nextUnread} />

      {book.noteUz ? (
        <div className="mb-6">
          <Alert tone="notice">{book.noteUz}</Alert>
        </div>
      ) : null}

      {pages.length ? <TextPageLinks book={book} pages={pages} /> : null}

      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-ink text-lg font-bold tracking-tight">
          {book.itemsTitleUz}
          <span className="text-ink-faint ml-2 text-sm font-semibold tabular-nums">{items.length}</span>
        </h2>
        <ViewToggle view={view} onChange={changeView} />
      </div>

      {view === 'list' ? (
        <ItemList book={book} items={items} marks={marks} />
      ) : (
        <div className={BOOK_GRID}>
          {items.map((item, index) => (
            <ItemTile
              key={item.number}
              book={book}
              item={item}
              index={index}
              readAt={marks[bookItemKey(book.id, item.number)]}
            />
          ))}
        </div>
      )}
    </>
  )
}
