import { createMarkStore } from './markStore.js'

/* O'qildi deb belgilangan kitob bo'laklari (hikmatlar …): { "hikam:12": 1758300000000, … }.
   Hadis belgilaridan alohida saqlanadi; xatm va statistikaga qo'shilmaydi */
const store = createMarkStore('read-books')

export const bookItemKey = (bookId, number) => `${bookId}:${number}`

/** Bo'lakni o'qildi deb belgilaydi yoki belgini olib tashlaydi */
export function toggleBookItemRead(bookId, number) {
  const key = bookItemKey(bookId, number)
  const next = { ...store.read() }
  if (next[key]) delete next[key]
  else next[key] = Date.now()
  store.write(next)
}

/** Butun kitob holati: { read, total, done } */
export function bookReadStatus(marks, book) {
  const prefix = `${book.id}:`
  const read = Object.keys(marks).filter((key) => key.startsWith(prefix)).length
  return { read, total: book.totalItems, done: read >= book.totalItems }
}

export const useBookMarks = store.useMarks
