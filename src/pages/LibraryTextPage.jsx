import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookBlocks, ReaderBackLink } from '../components/Book.jsx'
import { ReaderPager } from '../components/Quran.jsx'
import { Alert, Loader, PageHeader } from '../components/Ui.jsx'
import { bookPath, itemLabel, itemPath, textPagePath, useBook } from '../lib/books.js'

/** /library/:id/p/:slug — Muqaddima, Atamalar lug'ati, Kirish kabi matn sahifasi */
export default function LibraryTextPage() {
  const { id, slug } = useParams()
  const { book, content, error, loading } = useBook(id)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [id, slug])

  if (error) return <Alert>{error}</Alert>
  if (loading) return <Loader rows={3} />

  const { pages, items } = content
  const index = pages.findIndex((page) => page.slug === slug)

  if (index < 0) {
    return (
      <div className="space-y-4">
        <Alert>Sahifa topilmadi</Alert>
        <Link to={bookPath(id)} className="text-accent text-sm font-semibold">
          ← {book.nameUz}
        </Link>
      </div>
    )
  }

  const page = pages[index]
  const first = items[0]
  /* Oxirgi matn sahifasidan keyin — birinchi bo'lak (hikmat, bob) */
  const prev =
    index > 0 ? { label: pages[index - 1].title, to: textPagePath(id, pages[index - 1].slug) } : null
  const next =
    index < pages.length - 1
      ? { label: pages[index + 1].title, to: textPagePath(id, pages[index + 1].slug) }
      : first
        ? { label: itemLabel(book, first.number), to: itemPath(id, first.number) }
        : null

  return (
    <>
      <ReaderBackLink to={bookPath(id)}>{book.nameUz}</ReaderBackLink>
      <PageHeader title={page.title} subtitle={`${book.nameUz} · ${page.summaryUz}`} />

      <div key={page.slug} className="animate-rise">
        <BookBlocks blocks={page.blocks} book={book} />
      </div>

      <ReaderPager keyboard prev={prev} next={next} />
    </>
  )
}
