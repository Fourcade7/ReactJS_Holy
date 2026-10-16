/**
 * Madina mushafi bo'yicha juz chegaralari (Qur'on o'zgarmaydi, shuning uchun doimiy):
 * [boshlanish surasi, oyati, tugash surasi, oyati, birinchi bet, oxirgi bet, oyatlar soni]
 */
export const JUZ_RANGES = {
  1: [1, 1, 2, 141, 1, 21, 148],
  2: [2, 142, 2, 252, 22, 41, 111],
  3: [2, 253, 3, 92, 42, 62, 126],
  4: [3, 93, 4, 23, 62, 81, 131],
  5: [4, 24, 4, 147, 82, 101, 124],
  6: [4, 148, 5, 81, 102, 121, 110],
  7: [5, 82, 6, 110, 121, 141, 149],
  8: [6, 111, 7, 87, 142, 161, 142],
  9: [7, 88, 8, 40, 162, 181, 159],
  10: [8, 41, 9, 92, 182, 201, 127],
  11: [9, 93, 11, 5, 201, 221, 151],
  12: [11, 6, 12, 52, 222, 241, 170],
  13: [12, 53, 14, 52, 242, 261, 154],
  14: [15, 1, 16, 128, 262, 281, 227],
  15: [17, 1, 18, 74, 282, 301, 185],
  16: [18, 75, 20, 135, 302, 321, 269],
  17: [21, 1, 22, 78, 322, 341, 190],
  18: [23, 1, 25, 20, 342, 361, 202],
  19: [25, 21, 27, 55, 362, 381, 339],
  20: [27, 56, 29, 45, 382, 401, 171],
  21: [29, 46, 33, 30, 402, 421, 178],
  22: [33, 31, 36, 27, 422, 441, 169],
  23: [36, 28, 39, 31, 442, 461, 357],
  24: [39, 32, 41, 46, 462, 481, 175],
  25: [41, 47, 45, 37, 482, 502, 246],
  26: [46, 1, 51, 30, 502, 521, 195],
  27: [51, 31, 57, 29, 522, 541, 399],
  28: [58, 1, 66, 12, 542, 561, 137],
  29: [67, 1, 77, 50, 562, 581, 431],
  30: [78, 1, 114, 6, 582, 604, 564],
}

/* Har bir chaqiruvda bir xil massiv qaytishi uchun (useMemo bog'liqligi) oldindan tuziladi */
const JUZ_PAGES = Object.fromEntries(
  Object.entries(JUZ_RANGES).map(([juz, range]) => [juz, [range[4], range[5]]]),
)

/** Juz egallagan betlar: [birinchi bet, oxirgi bet], topilmasa null */
export function juzPageRange(juzNumber) {
  return Object.hasOwn(JUZ_PAGES, juzNumber) ? JUZ_PAGES[juzNumber] : null
}

/** Oyat qaysi juzda: (sura, oyat) → juz raqami, topilmasa null */
export function juzOfAyah(surahNumber, ayahNumber) {
  for (const [juz, [fromSurah, fromAyah, toSurah, toAyah]] of Object.entries(JUZ_RANGES)) {
    const afterStart = surahNumber > fromSurah || (surahNumber === fromSurah && ayahNumber >= fromAyah)
    const beforeEnd = surahNumber < toSurah || (surahNumber === toSurah && ayahNumber <= toAyah)
    if (afterStart && beforeEnd) return Number(juz)
  }
  return null
}
