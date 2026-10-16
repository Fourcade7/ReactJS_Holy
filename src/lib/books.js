import { bookApi } from '../api/books.js'
import { useKeyed } from './hadith.js'

/** Kitob yo'llari: /library/hikam, /library/hikam/12, /library/hikam/p/atamalar */
export const bookPath = (bookId) => `/library/${bookId}`
export const itemPath = (bookId, number) => `/library/${bookId}/${number}`
export const textPagePath = (bookId, slug) => `/library/${bookId}/p/${slug}`

/** «12-hikmat» */
export const itemLabel = (book, number) => `${number}-${book.itemName}`

/** Kitob ma'lumoti (books.json dan) va matni (<id>.json) */
export function useBook(id) {
  const { value, error, loading } = useKeyed(id, async () => {
    const [book, content] = await Promise.all([bookApi.get(id), bookApi.content(id)])
    return { book, content }
  })
  return { book: value?.book ?? null, content: value?.content ?? null, error, loading }
}
