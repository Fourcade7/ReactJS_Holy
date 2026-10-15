import { useState } from 'react'

/**
 * Mavzular (Sozlamalar → Mavzu): ranglar palitrasi, asosiy rang, orqa fon naqshi, kartochkalar
 * uslubi va burchaklar. Tanlovga qarab bitta <style id="appearance"> yoziladi — u index.css dagi
 * rang o'zgaruvchilarini (--color-bg, --color-surface, … --color-accent) almashtiradi, shuning uchun
 * butun tizim o'zgaradi. Har bir mavzuning yorug' va qorong'i varianti bor — header'dagi
 * almashtirgich odatdagidek ishlaydi.
 *
 * SINOV BOSQICHIDA. Butunlay olib tashlash uchun:
 *   1. shu fayl va src/pages/settings/ThemeSettings.jsx o'chiriladi
 *   2. SettingsPage.jsx — 'theme' tabi va <ThemeSettings /> qatori
 *   3. main.jsx — initAppearance importi va chaqiruvi
 *   4. index.html — «Mavzu» bloki (appearance-css)
 * Brauzerdagi 'appearance' va 'appearance-css' kalitlari shundan keyin hech narsaga ta'sir qilmaydi.
 */

const KEY = 'appearance'
const CSS_KEY = 'appearance-css'
const STYLE_ID = 'appearance'

/* Palitra tartibi — index.css dagi o'zgaruvchilar bilan bir xil */
const VARS = ['bg', 'surface', 'surface-2', 'line', 'ink', 'ink-soft', 'ink-faint', 'accent', 'accent-hover', 'accent-soft']
const palette = (colors) =>
  Object.fromEntries(colors.trim().split(/\s+/).map((color, index) => [VARS[index], color]))

/*                         bg      surface surface-2 line    ink     ink-soft ink-faint accent  hover   soft */
export const THEMES = [
  {
    id: 'default',
    name: 'Feruza',
    hint: 'Standart',
    light: palette('#f6f6f7 #ffffff #f0f0f2 #e3e3e7 #17181b #55565e #9b9ca5 #157c85 #10646c #e4f2f3'),
    dark: palette('#0f1012 #1c1d21 #26272c #2c2d34 #f2f2f4 #a0a1aa #6e6f79 #4ec3cc #6ad3db #14343a'),
  },
  {
    id: 'night',
    name: 'Tungi koʻk',
    hint: 'Toʻq koʻk, siyohrang',
    light: palette('#f2f4fb #ffffff #e9edf8 #dbe1f0 #111834 #48527a #8a94b6 #4f46e5 #4338ca #e7e6fd'),
    dark: palette('#0a0f1f #111a33 #18223f #222d4f #edf0fb #a7b1d2 #66729b #818cf8 #a5adfb #1f2452'),
  },
  {
    id: 'bordo',
    name: 'Bordo',
    hint: 'Toʻq qizil, issiq',
    light: palette('#f8eef1 #ffffff #f4e6ea #ead5db #2b0d17 #6d3846 #a9808b #9f1239 #881337 #fbe4ea'),
    dark: palette('#2a0b16 #3a1220 #47182a #5a2236 #fdf0f3 #e0b3c0 #a8768a #fb7185 #fda4af #561a2c'),
  },
  {
    id: 'emerald',
    name: 'Zumrad',
    hint: 'Yashil, tinch',
    light: palette('#f1f8f4 #ffffff #e5f2eb #d3e7dc #0b2118 #3d5f50 #84a596 #047857 #065f46 #d9f2e6'),
    dark: palette('#07130e #0e1f18 #142a21 #1c372c #eaf7f0 #9cc3b1 #5f8a76 #34d399 #6ee7b7 #0f3526'),
  },
  {
    id: 'mushaf',
    name: 'Mushaf',
    hint: 'Sargʻish qogʻoz',
    light: palette('#f3ead7 #fbf6ea #eee2c8 #e0cfab #2a1f12 #5d4a30 #9a8564 #8a5a14 #714910 #f2e2bf'),
    dark: palette('#16120c #211b12 #2b2318 #3a2f20 #f3e8d3 #c5b291 #88775b #e3b55e #ecc87f #3b2e15'),
  },
  {
    id: 'violet',
    name: 'Binafsha',
    hint: 'Yumshoq binafsha',
    light: palette('#f6f3fd #ffffff #eee8fa #e1d8f4 #1a1129 #54457a #998eb8 #7c3aed #6d28d9 #ede5fd'),
    dark: palette('#100b1b #1a1329 #231a36 #2e2346 #f4f0fb #b9acd6 #7a6c99 #a78bfa #c4b5fd #2b1f4a'),
  },
  {
    id: 'ocean',
    name: 'Okean',
    hint: 'Moviy, salqin',
    light: palette('#f0f6fb #ffffff #e3edf6 #d1e0ee #0a1b2a #3d5872 #85a0b7 #0369a1 #075985 #dbedf8'),
    dark: palette('#06111b #0c1b2a #122539 #1a3048 #e9f3fb #9cb9d3 #5e7e9b #38bdf8 #7dd3fc #0d2f48'),
  },
  {
    id: 'graphite',
    name: 'Grafit',
    hint: 'Kulrang, oltin rang',
    light: palette('#f5f5f4 #ffffff #eeeeec #e2e1de #1c1917 #57534e #a29d97 #b45309 #92400e #fbeedb'),
    dark: palette('#111111 #1b1b1b #252525 #2f2f2f #f2f2f2 #a8a8a8 #6c6c6c #f5a524 #f8bb55 #362a13'),
  },
  {
    id: 'rose',
    name: 'Atirgul',
    hint: 'Pushti',
    light: palette('#fdf4f8 #ffffff #f9e8f0 #f1d7e4 #2a0f1c #6f3a53 #ae8499 #be185d #9d174d #fce4f0'),
    dark: palette('#170a11 #22101a #2d1623 #3b1d2e #fbeef5 #d9a8c1 #9b6a82 #f472b6 #f9a8d4 #3f1631'),
  },
  {
    id: 'contrast',
    name: 'Kontrast',
    hint: 'Sof oq / sof qora',
    light: palette('#ffffff #ffffff #f4f4f5 #d4d4d8 #000000 #27272a #71717a #0f766e #115e59 #dcf3f1'),
    dark: palette('#000000 #0a0a0a #141414 #262626 #ffffff #c4c4c8 #7c7c84 #2dd4bf #5eead4 #0b2c2a'),
  },
]

/* Asosiy rang mavzudagidan boshqa bo'lishi mumkin: [yorug' rejimda, qorong'i rejimda] */
export const ACCENTS = [
  { id: 'theme', name: 'Mavzudagi' },
  { id: 'bordo', name: 'Bordo', light: '#9f1239', dark: '#fb7185' },
  { id: 'red', name: 'Qizil', light: '#b91c1c', dark: '#f87171' },
  { id: 'pink', name: 'Pushti', light: '#be185d', dark: '#f472b6' },
  { id: 'purple', name: 'Binafsha', light: '#7e22ce', dark: '#c084fc' },
  { id: 'indigo', name: 'Siyohrang', light: '#4338ca', dark: '#818cf8' },
  { id: 'blue', name: 'Koʻk', light: '#1d4ed8', dark: '#60a5fa' },
  { id: 'sky', name: 'Osmon', light: '#0369a1', dark: '#38bdf8' },
  { id: 'teal', name: 'Feruza', light: '#157c85', dark: '#4ec3cc' },
  { id: 'emerald', name: 'Zumrad', light: '#047857', dark: '#34d399' },
  { id: 'green', name: 'Yashil', light: '#15803d', dark: '#4ade80' },
  { id: 'olive', name: 'Zaytun', light: '#4d7c0f', dark: '#a3e635' },
  { id: 'gold', name: 'Oltin', light: '#a16207', dark: '#facc15' },
  { id: 'orange', name: 'Toʻq sariq', light: '#c2410c', dark: '#fb923c' },
  { id: 'brown', name: 'Jigarrang', light: '#7c4a2d', dark: '#d6a27a' },
  { id: 'slate', name: 'Grafit', light: '#334155', dark: '#94a3b8' },
]

/* ---------------- Orqa fon naqshlari ---------------- */

/* Naqsh o'lchami (--pattern-scale) bilan birga kattalashadigan uzunlik */
const u = (px) => `calc(${px}px * var(--pattern-scale))`
/* Naqsh rangining yarim shaffof varianti — to'liq bo'yaladigan (chiziq emas) naqshlar uchun */
const soft = (percent) => `color-mix(in oklab, var(--pattern-color) ${percent}%, transparent)`
const round = (value) => +value.toFixed(2)

const stroke = (body) => `<g fill='none' stroke='black' stroke-width='1.1'>${body}</g>`
const fill = (body) => `<g fill='black'>${body}</g>`
/* Burchakdagi shakl to'rt burchakda ham chiziladi — qo'shni kataklar bilan birga to'liq bo'ladi */
const corners = (width, height, shape) =>
  [[0, 0], [width, 0], [0, height], [width, height]].map(([x, y]) => shape(x, y)).join('')

/**
 * SVG katak niqob (mask) sifatida: shakl qora, naqsh rangi esa --pattern-color dan —
 * shuning uchun bitta SVG har qanday mavzu va rangga mos keladi.
 */
function svgMask(width, height, body) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>${body}</svg>`
  const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  const size = `${u(width)} ${u(height)}`
  return {
    'background-color': 'var(--pattern-color)',
    'mask-image': url,
    '-webkit-mask-image': url,
    'mask-size': size,
    '-webkit-mask-size': size,
  }
}

/** {n/k} yulduz ko'pburchagi — islomiy naqshlardagi kabi bir-birini kesib o'tgan qirralar */
function starPolygon(cx, cy, radius, points, step) {
  const vertices = Array.from({ length: points }, (_, index) => {
    const angle = (index * step * 2 * Math.PI) / points
    return `${round(cx + radius * Math.cos(angle))} ${round(cy + radius * Math.sin(angle))}`
  })
  return `<path d='M${vertices.join('L')}Z'/>`
}

/* Hilol: tashqi doiradan siljigan ichki doira kesib olingan */
function crescent(cx, cy, radius, offset, angle) {
  const half = offset / 2
  const h = round(Math.sqrt(radius * radius - half * half))
  const x = round(cx + half)
  return `<path transform='rotate(${angle} ${cx} ${cy})' d='M${x} ${round(cy - h)}A${radius} ${radius} 0 1 0 ${x} ${round(cy + h)}A${radius} ${radius} 0 0 1 ${x} ${round(cy - h)}Z'/>`
}

/* To'rt qirrali yulduzcha (uchqun) */
function sparkle(x, y, radius) {
  const k = round(radius * 0.2)
  return `<path d='M${x} ${y - radius}Q${x + k} ${y - k} ${x + radius} ${y}Q${x + k} ${y + k} ${x} ${y + radius}Q${x - k} ${y + k} ${x - radius} ${y}Q${x - k} ${y - k} ${x} ${y - radius}Z'/>`
}

const fade = (gradient) => ({ 'mask-image': gradient, '-webkit-mask-image': gradient })

export const PATTERN_GROUPS = [
  { id: 'simple', title: 'Oddiy' },
  { id: 'geometric', title: 'Geometrik' },
  { id: 'islamic', title: 'Islomiy naqshlar' },
  { id: 'natural', title: 'Tabiiy' },
]

/* Orqa fon naqshlari — rangi matn (yoki asosiy) rangidan (--pattern-color), shuning uchun har
   mavzuga mos. id lar saqlangan tanlov bilan bog'liq — o'zgartirilmaydi */
export const PATTERNS = [
  /* ---- Oddiy ---- */
  { id: 'none', group: 'simple', name: 'Yoʻq', css: {} },
  {
    id: 'lines',
    group: 'simple',
    name: 'Chiziqlar',
    css: {
      'background-image': `repeating-linear-gradient(135deg, var(--pattern-color) 0 1px, transparent 1px ${u(12)})`,
    },
  },
  {
    id: 'stripes',
    group: 'simple',
    name: 'Yoʻl-yoʻl',
    css: {
      'background-image': `repeating-linear-gradient(135deg, ${soft(60)} 0 ${u(8)}, transparent ${u(8)} ${u(24)})`,
    },
  },
  {
    id: 'columns',
    group: 'simple',
    name: 'Ustunlar',
    css: {
      'background-image': `repeating-linear-gradient(90deg, var(--pattern-color) 0 1px, transparent 1px ${u(22)})`,
    },
  },
  {
    id: 'notebook',
    group: 'simple',
    name: 'Daftar',
    css: {
      'background-image': `repeating-linear-gradient(180deg, var(--pattern-color) 0 1px, transparent 1px ${u(28)})`,
    },
  },
  {
    id: 'cross',
    group: 'simple',
    name: 'Toʻr',
    css: {
      'background-image': [45, 135]
        .map((deg) => `repeating-linear-gradient(${deg}deg, var(--pattern-color) 0 1px, transparent 1px ${u(16)})`)
        .join(', '),
    },
  },
  {
    id: 'grid',
    group: 'simple',
    name: 'Katak',
    css: {
      'background-image':
        'linear-gradient(var(--pattern-color) 1px, transparent 1px), linear-gradient(90deg, var(--pattern-color) 1px, transparent 1px)',
      'background-size': `${u(32)} ${u(32)}`,
    },
  },
  {
    id: 'graph',
    group: 'simple',
    name: 'Chizma qogʻozi',
    css: {
      'background-image': `linear-gradient(var(--pattern-color) 1px, transparent 1px), linear-gradient(90deg, var(--pattern-color) 1px, transparent 1px), linear-gradient(${soft(45)} 1px, transparent 1px), linear-gradient(90deg, ${soft(45)} 1px, transparent 1px)`,
      'background-size': `${u(80)} ${u(80)}, ${u(80)} ${u(80)}, ${u(16)} ${u(16)}, ${u(16)} ${u(16)}`,
    },
  },
  {
    id: 'plaid',
    group: 'simple',
    name: 'Mato katagi',
    css: {
      'background-image': [0, 90]
        .map(
          (deg) =>
            `repeating-linear-gradient(${deg}deg, ${soft(70)} 0 ${u(4)}, transparent ${u(4)} ${u(12)}, ${soft(70)} ${u(12)} calc(${u(12)} + 1px), transparent calc(${u(12)} + 1px) ${u(44)})`,
        )
        .join(', '),
    },
  },
  {
    id: 'dots',
    group: 'simple',
    name: 'Nuqtalar',
    css: {
      'background-image': 'radial-gradient(var(--pattern-color) 1.4px, transparent 1.8px)',
      'background-size': `${u(20)} ${u(20)}`,
    },
  },
  {
    id: 'rings',
    group: 'simple',
    name: 'Doirachalar',
    css: {
      'background-image': `radial-gradient(circle, transparent ${u(3)}, var(--pattern-color) ${u(3)} calc(${u(3)} + 1px), transparent calc(${u(3)} + 1.5px))`,
      'background-size': `${u(26)} ${u(26)}`,
    },
  },
  {
    id: 'checker',
    group: 'simple',
    name: 'Shaxmat',
    css: {
      'background-image': `conic-gradient(${soft(55)} 25%, transparent 0 50%, ${soft(55)} 0 75%, transparent 0)`,
      'background-size': `${u(40)} ${u(40)}`,
    },
  },

  /* ---- Geometrik ---- */
  {
    id: 'zigzag',
    group: 'geometric',
    name: 'Zigzag',
    css: svgMask(24, 14, stroke("<path d='M0 12L6 2L12 12L18 2L24 12'/>")),
  },
  {
    id: 'maze',
    group: 'geometric',
    name: 'Labirint',
    css: svgMask(24, 24, stroke("<path d='M0 22H24M3 22V4H21V18H9V10H15V14'/>")),
  },
  {
    id: 'diamonds',
    group: 'geometric',
    name: 'Romblar',
    css: svgMask(
      28,
      28,
      stroke("<path d='M14 7L21 14L14 21L7 14Z'/>") +
        fill(corners(28, 28, (x, y) => `<circle cx='${x}' cy='${y}' r='1.6'/>`)),
    ),
  },
  {
    id: 'triangles',
    group: 'geometric',
    name: 'Uchburchaklar',
    /* Teng tomonli uchburchaklar: katak 30 × 30·√3 */
    css: svgMask(30, 51.96, stroke("<path d='M0 0H30M0 25.98H30M0 51.96H30M0 0L30 51.96M30 0L0 51.96'/>")),
  },
  {
    id: 'hexagons',
    group: 'geometric',
    name: 'Asalari uyasi',
    /* Tekis tepali oltiburchaklar, tomoni 16: katak 48 × 16·√3 */
    css: svgMask(48, 27.71, stroke("<path d='M40 13.86L32 27.71H16L8 13.86L16 0H32ZM0 13.86H8M40 13.86H48'/>")),
  },
  {
    id: 'bricks',
    group: 'geometric',
    name: 'Gʻisht',
    css: svgMask(48, 24, stroke("<path d='M0 0H48M0 12H48M0 24H48M12 0V12M36 0V12M0 12V24M24 12V24M48 12V24'/>")),
  },
  {
    id: 'scales',
    group: 'geometric',
    name: 'Tangachalar',
    css: svgMask(
      40,
      40,
      stroke(
        "<path d='M0 21A20 20 0 0 1 40 21M8 21A12 12 0 0 1 32 21M0 21A20 20 0 0 1 20 41M20 41A20 20 0 0 1 40 21M0 29A12 12 0 0 1 12 41M28 41A12 12 0 0 1 40 29'/>",
      ),
    ),
  },
  {
    id: 'flowers',
    group: 'geometric',
    name: 'Gullar',
    /* Kesishgan doiralar — orasida to'rt gulbargli gullar hosil bo'ladi */
    css: svgMask(
      40,
      40,
      stroke("<circle cx='20' cy='20' r='20'/>" + corners(40, 40, (x, y) => `<circle cx='${x}' cy='${y}' r='20'/>`)),
    ),
  },

  /* ---- Islomiy naqshlar ---- */
  {
    id: 'stars',
    group: 'islamic',
    name: 'Rubʼ al-hizb',
    /* ۞ — ikki kvadrat ustma-ust, mushafda hizb choraklarini belgilaydi */
    css: svgMask(
      60,
      60,
      stroke(
        "<path d='M30 9L51 30L30 51L9 30Z'/><path d='M15.15 15.15H44.85V44.85H15.15Z'/><circle cx='30' cy='30' r='6'/><path d='M30 0V9M30 51V60M0 30H9M51 30H60'/>",
      ),
    ),
  },
  {
    id: 'star8',
    group: 'islamic',
    name: 'Sakkiz yulduz',
    css: svgMask(
      40,
      40,
      stroke(
        starPolygon(20, 20, 14, 8, 3) +
          corners(40, 40, (x, y) => `<path d='M${x} ${y - 4}L${x + 4} ${y}L${x} ${y + 4}L${x - 4} ${y}Z'/>`),
      ),
    ),
  },
  {
    id: 'shamsa',
    group: 'islamic',
    name: 'Shamsa',
    /* Qo'lyozmalardagi «quyosh» rozetkasi: o'n ikki qirrali yulduz doira ichida */
    css: svgMask(
      48,
      48,
      stroke(
        starPolygon(24, 24, 16, 12, 5) +
          "<circle cx='24' cy='24' r='19'/>" +
          corners(48, 48, (x, y) => `<circle cx='${x}' cy='${y}' r='3'/>`),
      ),
    ),
  },
  {
    id: 'octagons',
    group: 'islamic',
    name: 'Sakkizburchak',
    /* Sakkizburchak va kvadratli pol plitkasi; ichida kichik sakkizburchak */
    css: svgMask(
      40,
      40,
      stroke(
        "<path d='M11.72 0H28.28L40 11.72V28.28L28.28 40H11.72L0 28.28V11.72ZM15.86 10H24.14L30 15.86V24.14L24.14 30H15.86L10 24.14V15.86Z'/>",
      ),
    ),
  },
  {
    id: 'lattice',
    group: 'islamic',
    name: 'Panjara',
    css: svgMask(
      24,
      24,
      stroke(
        "<path d='M0 0L24 24M24 0L0 24'/><circle cx='12' cy='12' r='3.5'/>" +
          corners(24, 24, (x, y) => `<circle cx='${x}' cy='${y}' r='3.5'/>`),
      ),
    ),
  },
  {
    id: 'arches',
    group: 'islamic',
    name: 'Mehrob',
    css: svgMask(
      36,
      52,
      stroke(
        "<path d='M6 52V28C6 18 12 11 18 4C24 11 30 18 30 28V52M11 52V29C11 22 14 17 18 12C22 17 25 22 25 29V52'/>",
      ),
    ),
  },
  {
    id: 'crescents',
    group: 'islamic',
    name: 'Hilol',
    css: svgMask(
      80,
      80,
      fill(
        crescent(24, 26, 9, 5, -30) +
          crescent(60, 60, 6, 3.4, -30) +
          "<circle cx='58' cy='20' r='1.3'/><circle cx='16' cy='62' r='1.1'/><circle cx='40' cy='48' r='0.9'/>",
      ),
    ),
  },

  /* ---- Tabiiy ---- */
  {
    id: 'waves',
    group: 'natural',
    name: 'Toʻlqin',
    css: svgMask(80, 24, stroke("<path d='M0 12C10 4 30 4 40 12S70 20 80 12'/>")),
  },
  {
    id: 'dunes',
    group: 'natural',
    name: 'Qum barxanlari',
    css: svgMask(
      120,
      42,
      stroke(
        "<path d='M0 8C20 2 40 2 60 8S100 14 120 8M0 22C20 12 40 12 60 22S100 32 120 22M0 35C20 32 40 32 60 35S100 38 120 35'/>",
      ),
    ),
  },
  {
    id: 'ripples',
    group: 'natural',
    name: 'Halqalar',
    /* Markazdan tarqalgan halqalar, chetga borib so'nadi */
    css: {
      'background-image': `repeating-radial-gradient(circle at 50% 40%, var(--pattern-color) 0 1px, transparent 1px ${u(26)})`,
      ...fade('radial-gradient(circle at 50% 40%, black 25%, transparent 80%)'),
    },
  },
  {
    id: 'rays',
    group: 'natural',
    name: 'Nur',
    /* Yuqoridan tushayotgan nur, pastga borib so'nadi */
    css: {
      'background-image':
        'repeating-conic-gradient(from 0deg at 50% -15%, var(--pattern-color) 0 1deg, transparent 1deg calc(6deg * var(--pattern-scale)))',
      ...fade('linear-gradient(to bottom, black, transparent 90%)'),
    },
  },
  {
    id: 'sky',
    group: 'natural',
    name: 'Yulduzli osmon',
    css: svgMask(
      140,
      140,
      fill(
        [[18, 22, 6], [96, 16, 3.5], [122, 64, 5], [60, 52, 2.6], [30, 98, 4], [104, 112, 2.8], [74, 128, 1.8]]
          .map(([x, y, radius]) => sparkle(x, y, radius))
          .join('') +
          [[44, 20, 1], [130, 30, 0.9], [84, 82, 1.2], [12, 64, 0.8], [56, 118, 0.9], [118, 92, 1]]
            .map(([x, y, radius]) => `<circle cx='${x}' cy='${y}' r='${radius}'/>`)
            .join(''),
      ),
    ),
  },
  {
    id: 'paper',
    group: 'natural',
    name: 'Qogʻoz',
    /* Qog'oz donasi: shovqin filtri (feTurbulence), chetlari ulanadigan qilib */
    css: svgMask(
      180,
      180,
      "<filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 2.4 0 0 0 -0.9'/></filter><rect width='180' height='180' filter='url(#g)'/>",
    ),
  },
]

/* Naqsh va yog'du kuchi: naqsh rangi — matn rangining shuncha foizi */
export const STRENGTHS = [
  { value: 'low', label: 'Past', percent: 4 },
  { value: 'medium', label: 'Oʻrta', percent: 7 },
  { value: 'high', label: 'Kuchli', percent: 11 },
]

/* Naqsh o'lchami — katakning kattaligi (chiziqlar qalinligi o'zgarmaydi) */
export const SIZES = [
  { value: 'small', label: 'Kichik', scale: 0.7 },
  { value: 'medium', label: 'Oʻrta', scale: 1 },
  { value: 'large', label: 'Katta', scale: 1.5 },
]

/* Burchaklar: index.css dagi yagona --radius-md (hamma narsa rounded-md) */
export const RADII = [
  { value: 'sharp', label: 'Oʻtkir', size: '0.125rem' },
  { value: 'default', label: 'Standart', size: '0.375rem' },
  { value: 'soft', label: 'Yumaloq', size: '0.625rem' },
  { value: 'round', label: 'Juda yumaloq', size: '0.875rem' },
]

/* Kartochkalar: .bg-surface.border — Card va shunga o'xshash bloklar; ochiladigan menyular
   (absolute / fixed) bundan mustasno */
const CARD = '.bg-surface.border:not(.absolute):not(.fixed)'

export const CARD_STYLES = [
  { id: 'flat', name: 'Tekis', hint: 'Faqat chegara', light: {}, dark: {} },
  {
    id: 'shadow',
    name: 'Soyali',
    hint: 'Yengil koʻtarilgan',
    light: { 'box-shadow': '0 1px 2px rgb(0 0 0 / 0.04), 0 10px 28px -14px rgb(0 0 0 / 0.25)' },
    dark: { 'box-shadow': '0 1px 2px rgb(0 0 0 / 0.3), 0 12px 32px -12px rgb(0 0 0 / 0.65)' },
  },
  {
    id: 'glass',
    name: 'Shaffof',
    hint: 'Orqa fon koʻrinib turadi',
    light: {
      'background-color': 'color-mix(in oklab, var(--color-surface) 72%, transparent)',
      'backdrop-filter': 'blur(10px)',
      '-webkit-backdrop-filter': 'blur(10px)',
    },
    dark: {
      'background-color': 'color-mix(in oklab, var(--color-surface) 68%, transparent)',
      'backdrop-filter': 'blur(10px)',
      '-webkit-backdrop-filter': 'blur(10px)',
    },
  },
  {
    id: 'borderless',
    name: 'Chegarasiz',
    hint: 'Faqat rang bilan ajraladi',
    light: { 'border-color': 'transparent', 'box-shadow': '0 1px 3px rgb(0 0 0 / 0.06)' },
    dark: { 'border-color': 'transparent' },
  },
]

export const DEFAULTS = {
  theme: 'default',
  accent: 'theme',
  pattern: 'none',
  strength: 'medium',
  size: 'medium',
  tint: false,
  glow: false,
  cards: 'flat',
  radius: 'default',
}

const find = (list, id, key = 'id') => list.find((item) => item[key] === id) ?? list[0]

/** Tanlangan mavzu + asosiy rang → { '--color-bg': …, … } (CSS va namunalar uchun umumiy) */
export function colorVars(value, dark) {
  const colors = { ...find(THEMES, value.theme)[dark ? 'dark' : 'light'] }
  const accent = find(ACCENTS, value.accent)
  if (accent.id !== 'theme') {
    const color = accent[dark ? 'dark' : 'light']
    colors.accent = color
    colors['accent-hover'] = `color-mix(in oklab, ${color} ${dark ? '75%, white' : '82%, black'})`
    colors['accent-soft'] = `color-mix(in oklab, ${color} ${dark ? 20 : 12}%, var(--color-surface))`
  }
  return Object.fromEntries(Object.entries(colors).map(([name, color]) => [`--color-${name}`, color]))
}

/** Yorug' / qorong'i rejimdagi asosiy rang — ranglar doirachasi uchun */
export function accentColor(value, accentId, dark) {
  const accent = find(ACCENTS, accentId)
  return accent.id === 'theme'
    ? find(THEMES, value.theme)[dark ? 'dark' : 'light'].accent
    : accent[dark ? 'dark' : 'light']
}

/** Naqsh rangi (matn yoki asosiy rangdan) va o'lchami — fon qatlami hamda namunalar uchun */
export function patternVars({ strength, size, tint }) {
  const { percent } = find(STRENGTHS, strength, 'value')
  const { scale } = find(SIZES, size, 'value')
  /* Asosiy rang fonga yaqinroq — ko'rinishi uchun biroz kuchliroq olinadi */
  const color = tint ? `var(--color-accent) ${Math.round(percent * 1.6)}%` : `var(--color-ink) ${percent}%`
  return {
    '--pattern-color': `color-mix(in oklab, ${color}, transparent)`,
    '--pattern-scale': String(scale),
  }
}

/* Asosiy rangdagi yumshoq yorug'lik — burchaklardan */
export function glowCss(strength) {
  const { percent } = find(STRENGTHS, strength, 'value')
  const glow = (amount) => `color-mix(in oklab, var(--color-accent) ${amount}%, transparent)`
  return {
    'background-image': `radial-gradient(60rem 42rem at 0% 0%, ${glow(percent * 3)}, transparent 70%), radial-gradient(52rem 40rem at 100% 100%, ${glow(percent * 2)}, transparent 70%)`,
  }
}

export const findPattern = (id) => find(PATTERNS, id)
export const findCardStyle = (id) => find(CARD_STYLES, id)

/** { 'background-image': … } → React style: { backgroundImage: … } */
export function toStyle(declarations) {
  return Object.fromEntries(
    Object.entries(declarations).map(([name, value]) => [
      name.startsWith('--')
        ? name
        : name.replace(/^-webkit-/, 'Webkit-').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()),
      value,
    ]),
  )
}

const block = (selector, declarations) => {
  const body = Object.entries(declarations)
    .map(([name, value]) => `${name}:${value}`)
    .join(';')
  return body ? `${selector}{${body}}` : ''
}

/* Fon qatlami: sahifa ortida, sichqonchaga xalaqit bermaydi */
const LAYER = { content: "''", position: 'fixed', inset: '0', 'z-index': '-1', 'pointer-events': 'none' }

/** Tanlovdan CSS; hammasi standart bo'lsa — bo'sh qator */
export function buildCss(value) {
  const root = ':root[data-appearance]'
  const parts = []

  if (value.theme !== DEFAULTS.theme || value.accent !== DEFAULTS.accent) {
    parts.push(block(`${root}:not(.dark)`, colorVars(value, false)))
    parts.push(block(`${root}.dark`, colorVars(value, true)))
  }

  const radius = find(RADII, value.radius, 'value')
  if (radius.value !== DEFAULTS.radius) parts.push(block(root, { '--radius-md': radius.size }))

  const pattern = findPattern(value.pattern)
  if (pattern.id !== 'none') {
    parts.push(block(`${root} body::before`, { ...LAYER, ...patternVars(value), ...pattern.css }))
  }
  if (value.glow) parts.push(block(`${root} body::after`, { ...LAYER, ...glowCss(value.strength) }))

  const cards = findCardStyle(value.cards)
  parts.push(block(`${root}:not(.dark) ${CARD}`, cards.light))
  parts.push(block(`${root}.dark ${CARD}`, cards.dark))

  return parts.filter(Boolean).join('\n')
}

export function readAppearance() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY)) }
  } catch {
    return { ...DEFAULTS }
  }
}

export const isDefaultAppearance = (value) =>
  Object.keys(DEFAULTS).every((key) => value[key] === DEFAULTS[key])

/**
 * Tanlovni sahifaga qo'llaydi va saqlaydi. CSS ham saqlanadi — index.html uni sahifa birinchi
 * chizilishidan oldin qo'yadi, standart ranglar bir lahza ko'rinib qolmaydi.
 */
export function applyAppearance(value) {
  const css = buildCss(value)
  const root = document.documentElement
  let style = document.getElementById(STYLE_ID)

  try {
    if (isDefaultAppearance(value)) localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, JSON.stringify(value))
    if (css) localStorage.setItem(CSS_KEY, css)
    else localStorage.removeItem(CSS_KEY)
  } catch {
    /* private rejim — faqat shu ochilishda ishlaydi */
  }

  if (!css) {
    style?.remove()
    root.removeAttribute('data-appearance')
    return
  }
  if (!style) {
    style = document.createElement('style')
    style.id = STYLE_ID
    document.head.appendChild(style)
  }
  style.textContent = css
  root.setAttribute('data-appearance', '')
}

/** Ilova ochilganda: saqlangan tanlov joriy koddagi mavzular bilan qayta yoziladi */
export function initAppearance() {
  applyAppearance(readAppearance())
}

export function useAppearance() {
  const [value, setValue] = useState(readAppearance)

  function update(patch) {
    const next = { ...value, ...patch }
    setValue(next)
    applyAppearance(next)
  }

  return [value, update]
}
