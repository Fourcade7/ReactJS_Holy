import { useEffect } from 'react'
import { mushafApi } from '../api/client.js'

const loadedFonts = new Set()

/**
 * Har bir mushaf sahifasining o'z KFGQPC shrifti bor: p1, p2, … p604.
 * Manba: verses.quran.com/fonts/quran/hafs/v1/woff2/ — Quran.com ishlatadigan yangilangan
 * nusxa. static.qurancdn.com dagi eski nusxada 7 betda (94, 120, 175, 307, 356, 565, 579)
 * harakatlar qo'shni so'z glifiga chizilgan, masalan 7:188 dagi «لِّقَوۡمٖ» kasrasi.
 */
export function usePageFont(pageNumber) {
  useEffect(() => {
    if (!pageNumber || loadedFonts.has(pageNumber)) return
    const style = document.createElement('style')
    style.dataset.mushafPage = String(pageNumber)
    style.textContent = `@font-face{font-family:"mushaf-p${pageNumber}";src:url("${import.meta.env.BASE_URL}fonts/hafs/v1/p${pageNumber}.woff2") format("woff2");font-display:block}`
    document.head.appendChild(style)
    loadedFonts.add(pageNumber)
  }, [pageNumber])
}

const pageRequests = new Map()

/** Mushaf sahifasi bir marta yuklanadi — bir betdagi o'nlab oyat uni qayta so'ramaydi */
export function loadMushafPage(pageNumber) {
  if (!pageRequests.has(pageNumber)) {
    pageRequests.set(
      pageNumber,
      mushafApi.page(pageNumber).catch((error) => {
        pageRequests.delete(pageNumber)
        throw error
      }),
    )
  }
  return pageRequests.get(pageNumber)
}
