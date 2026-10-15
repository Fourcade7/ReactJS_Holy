/**
 * Hadis kitoblari public/data/hadith ichidagi statik JSON fayllardan o'qiladi.
 * Fayllar `npm run hadith:build` bilan hadith/raw va hadith/translations dan yig'iladi.
 */

const DATA_DIR = '/data/hadith'
const requests = new Map()

/* Bir fayl bir marta yuklanadi — hadislar orasida yurganda bo'lim qayta so'ralmaydi */
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

export const collectionApi = {
  list: () => json('collections.json'),
  get: async (id) => {
    const collection = (await json('collections.json')).find((item) => item.id === id)
    if (!collection) throw new Error(`"${id}" kitobi topilmadi`)
    return collection
  },
}

/** Kitobning bo'limlari (kitoblari): raqam, nom, hadislar oralig'i, tarjima holati */
export const sectionApi = {
  list: (collectionId) => json(`${collectionId}/sections.json`),
}

export const hadithApi = {
  section: (collectionId, sectionNumber) => json(`${collectionId}/section/${sectionNumber}.json`),
}
