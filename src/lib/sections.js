/* Sidebar'dan ochiladigan bo'limlar: yo'l → nom. Layout kengligi va Sozlamalardagi «Orqaga» shu yerdan */
export const SECTIONS = {
  '/': 'Suralar',
  '/pages': 'Sahifalar',
  '/juz': 'Juzlar',
  '/books': 'Hadislar',
  '/library': 'Kitoblar',
  '/words': 'Qiyin soʻzlar',
}

export const isSection = (pathname) => Object.hasOwn(SECTIONS, pathname)
