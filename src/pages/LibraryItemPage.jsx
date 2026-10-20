import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import BackLink from '../components/BackLink.jsx'
import { BookBlocks, LinkedText } from '../components/Book.jsx'
import { ReadMarkButton } from '../components/PageReadMark.jsx'
import { ReaderPager } from '../components/Quran.jsx'
import { Alert, Card, Diamond, Loader } from '../components/Ui.jsx'
import { bookItemKey, toggleBookItemRead, useBookMarks } from '../lib/bookMarks.js'
import { bookPath, itemLabel, itemPath, textPagePath, useBook } from '../lib/books.js'

/** Hikmat: qisqa matn va sharhi — bitta kartochkada */
function SayingCard({ book, item }) {
  return (
    <Card key={item.number} className="animate-rise p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <Diamond>{item.number}</Diamond>
        <span className="text-ink-faint text-[13px] font-semibold">{itemLabel(book, item.number)}</span>
      </div>

      <p className="txt-uz text-ink mt-5">
        <LinkedText text={item.text} book={book} />
      </p>

      {item.commentary ? (
        <div className="border-line mt-5 border-t pt-4">
          <p className="text-accent mb-1.5 text-[11px] font-bold tracking-[0.12em] uppercase">Sharh</p>
          <p className="txt-uz-sub text-ink-soft">
            <LinkedText text={item.commentary} book={book} />
          </p>
        </div>
      ) : null}
    </Card>
  )
}

/** Bob: sarlavhasi va butun matni (bo'limlar, iqtiboslar, ro'yxatlar) bitta sahifada */
function Chapter({ book, item }) {
  return (
    <article key={item.number} className="animate-rise">
      <header className="mb-8 flex items-center gap-5">
        <Diamond>{item.number}</Diamond>
        <div className="min-w-0">
          <p className="text-ink-faint text-[13px] font-semibold">
            {itemLabel(book, item.number)}
            {item.subtitleUz ? ` · ${item.subtitleUz}` : null}
          </p>
          <h1 className="font-display text-ink mt-1 text-2xl leading-tight tracking-tight sm:text-3xl">
            {item.title}
          </h1>
        </div>
      </header>
      <BookBlocks blocks={item.blocks} book={book} />
    </article>
  )
}

/** /library/:id/:number — bitta hikmat yoki bob, oldingi / keyingi (← → tugmalari ham) */
export default function LibraryItemPage() {
  const { id, number } = useParams()
  const { book, content, error, loading } = useBook(id)
  const marks = useBookMarks()

  /* Keyingi hikmat / bobga o'tganda sahifa boshidan ko'rsatiladi */
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [id, number])

  if (error) return <Alert>{error}</Alert>
  if (loading) return <Loader rows={2} />

  const { items, pages } = content
  const index = items.findIndex((item) => String(item.number) === number)

  if (index < 0) {
    return (
      <div className="space-y-4">
        <Alert>{`${itemLabel(book, number)} topilmadi`}</Alert>
        <Link to={bookPath(id)} className="text-accent text-sm font-semibold">
          ← {book.nameUz}
        </Link>
      </div>
    )
  }

  const item = items[index]
  const lastPage = pages.at(-1)
  /* Birinchi bo'lakdan oldin — kitobning oxirgi matn sahifasi (Atamalar lug'ati, Kirish) */
  const prev =
    index > 0
      ? { label: `Oldingi ${book.itemName}`, to: itemPath(id, items[index - 1].number) }
      : lastPage
        ? { label: lastPage.title, to: textPagePath(id, lastPage.slug) }
        : null
  const next =
    index < items.length - 1
      ? { label: `Keyingi ${book.itemName}`, to: itemPath(id, items[index + 1].number) }
      : null

  return (
    <>
      <BackLink to={bookPath(id)} label={book.nameUz} />

      {item.blocks ? <Chapter book={book} item={item} /> : <SayingCard book={book} item={item} />}

      <ReadMarkButton
        readAt={marks[bookItemKey(id, item.number)]}
        onToggle={() => toggleBookItemRead(id, item.number)}
      />

      <ReaderPager keyboard label={`${index + 1} / ${items.length}`} prev={prev} next={next} />
    </>
  )
}
