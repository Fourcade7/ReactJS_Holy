/**
 * Kitoblar (hadis to'plamlaridan tashqari) public/data/books ichidagi statik JSON fayllardan o'qiladi:
 *   books.json  — ro'yxat: nomlar, muallif, tavsif, itemName («hikmat», «bob»), totalItems
 *   <id>.json   — matn: { pages: [{ slug, title, summaryUz, blocks }], items: [...] }
 *     qisqa bo'lak (hikmat): { number, text, commentary? }
 *     bob: { number, title, subtitleUz?, summaryUz, blocks } — bloklar turi components/Book.jsx dagi BookBlocks'da
 * Matn PDF'dan bir marta ajratib olingan — keyingi tuzatishlar shu JSON fayllarning o'zida qilinadi.
 */

const DATA_DIR = `${import.meta.env.BASE_URL}data/books`
const requests = new Map()

/* Bir fayl bir marta yuklanadi — bo'laklar orasida yurganda kitob qayta so'ralmaydi */
function json(path) {
  if (!requests.has(path)) {
    requests.set(
      path,
      fetch(`${DATA_DIR}/${path}`)
        .then((response) => {
          if (!response.ok) throw new Error(`${path} topilmadi`)
          return response.json()
        })
        .catch((error) => {
          requests.delete(path)
          throw error
        }),
    )
  }
  return requests.get(path)
}

export const bookApi = {
  list: () => json('books.json'),
  get: async (id) => {
    const book = (await json('books.json')).find((item) => item.id === id)
    if (!book) throw new Error(`"${id}" kitobi topilmadi`)
    return book
  },
  content: (id) => json(`${id}.json`),
}
