# Hadislar — arabcha matn va o'zbekcha tarjima

Sidebar'dagi **Hadislar → Kitoblar** bo'limi. Avval alohida «Sunnat» ilovasi (ReactJS_Sunnah) bo'lgan,
endi Holy ichida. Server yo'q: ilova `public/data/hadith` ichidagi JSON fayllardan o'qiydi.

## Sahifalar

| Yo'l | Nima |
|---|---|
| `/books` | Kitoblar ro'yxati |
| `/book/:id` | Kitob haqida ma'lumot va bo'limlar (kitoblar) to'ri; bitta bo'limli kitobda — hadislar |
| `/book/:id/s/:section` | Bo'limdagi hadislar |
| `/book/:id/s/:section/:number` | Hadisni o'qish, oldingi / keyingi (← → tugmalari ham) |

Hadislarni «o'qildi» deb belgilash mumkin: ro'yxatdagi kartochka burchagida va hadis sahifasining
tagida. Belgilar brauzerda (`localStorage` → `read-hadiths`) saqlanadi. Ular xatmga, o'qish vaqtiga
va statistikaga qo'shilmaydi.

Suralar kabi yuqori darajalar ham belgilarni ko'rsatadi: bo'lim kartochkasi va qatori
(«12/148 hadis oʻqildi», hammasi belgilansa yashil), bo'lim va kitob sarlavhasi, Kitoblar ro'yxati.
Bo'lim burchagidagi doiracha butun bo'limni birdan belgilaydi (hammasi belgilangan bo'lsa — olib
tashlaydi).

Kod: `src/api/hadith.js`, `src/lib/hadith.js`, `src/lib/hadithMarks.js`, `src/components/Hadith*.jsx`,
`src/pages/Hadith*Page.jsx`.

## Ma'lumot oqimi

```
scripts/hadith/collections.mjs          kitoblar ro'yxati (id, nashr, nomlar)
hadith/raw/<nashr>.json                 arabcha matn (manbadan, o'zgartirilmaydi)
hadith/translations/<id>.uz.json        tarjima — kichik kitoblar uchun bitta fayl
hadith/translations/<id>/*.uz.json      tarjima — katta kitoblar uchun bo'lib-bo'lib (batch-01, batch-02, …)
hadith/translations/<id>/sections.uz.json   bo'limlarning o'zbekcha nomlari
        │
        ▼   npm run hadith:build
public/data/hadith/collections.json
public/data/hadith/<id>/sections.json
public/data/hadith/<id>/section/<n>.json
```

- `npm run hadith:fetch` — `collections.mjs` dagi, `hadith/raw/` da hali yo'q kitoblarni yuklaydi
  (`-- <id>` bitta kitob, `-- --force` qayta yuklash).
- `npm run hadith:build` — arabcha matn + tarjimani birlashtiradi. Tarjimasi yo'q hadislar arabcha
  matn bilan chiqadi ("Tarjima hali kiritilmagan"), shuning uchun katta kitoblar bosqichma-bosqich
  tarjima qilinadi. Build quyidagilarda xato beradi: manbada yo'q hadis raqami, bir hadisning ikki
  marta tarjimasi, noma'lum daraja, o'zbekcha matnda kirill harfi.
- Tarjima yozuvi: `{ narratorUz?, textUz, sourceUz?, grade?, arabicFix?, sectionFix? }`.
  `arabicFix` — manbadagi aniq yozuv xatosini tuzatilgan arabcha matn bilan almashtiradi.
  `sectionFix` — manbada bo'lim raqami xato belgilangan hadisni shu raqamli bo'limga o'tkazadi
  (raqam manbadagi bo'limlardan biri bo'lishi shart, aks holda build xato beradi).

Yangi kitob: `collections.mjs` ga yozuv → `npm run hadith:fetch` → tarjima fayllari → `npm run hadith:build`.

`sections.json` dagi har bir bo'limda `ranges` — bo'lim hadislari turgan uzluksiz raqam oraliqlari
(`[[dan, gacha], …]`). Bo'limlar raqamlar bo'yicha aralashishi mumkin (Termiziyda 7 ta bo'lim bir
nechta oraliqdan iborat), shuning uchun «o'qildi» belgilari bo'limlar bo'yicha `firstHadith`–
`lastHadith` bilan emas, shu oraliqlar bilan sanaladi.

`public/data/hadith` Qur'on ma'lumotining `manifest.json` iga kirmaydi — Sozlamalardagi zip arxivga
qo'shilmaydi.

## Arabcha matn

- Shrift: **KFGQPC Uthmanic Hafs** (`public/fonts/uthmanic-hafs/`), `arabic-hadith` utilitasi
  (`src/index.css`). O'lcham — Qur'on bilan umumiy `.txt-arabic`, Sozlamalardagi matn o'lchami unga ham
  ta'sir qiladi. `،` `؛` `؟` bu shriftda Qur'on ornamenti bo'lgani uchun `unicode-range` bilan chiqarilgan.
  King Fahd Complex shrifti — muallif ko'rsatilishi kerak.
- Build vaqtida tozalanadi: `<br>`, bidi belgilari, `[رقم:…]` havolalar; forscha `ک`/`ی` → arabcha;
  quyosh harfi oldidagi lamdagi sukun.

## Holat

| Kitob | Hadis | Tarjima |
|---|---|---|
| Arbaʼin an-Navaviy | 42 | 42 — toʻliq |
| Shoh Valiyulloh Dehlaviy, 40 hadis | 40 | 40 — toʻliq |
| Muvatto Molik (61 boʻlim) | 1 829 | 1 829 — toʻliq |
| Sunani Termiziy (49 boʻlim) | 3 924 | 3 924 — toʻliq |
| Sunani Ibn Moja (38 boʻlim) | 4 338 | 4 338 — toʻliq |
| Sunani Abu Dovud (43 boʻlim) | 5 272 | 5 272 — toʻliq |
| Sahihi Buxoriy (97 boʻlim) | 7 277 | 7 277 — toʻliq |
| Sahihi Muslim (57 boʻlim) | 7 292 | 7 292 — toʻliq |
| Sunani Nasoiy (51 boʻlim) | 5 677 | 5 677 — toʻliq |

Hadis soni — matni bor yozuvlar (manbadagi matni bo'sh yozuvlar build vaqtida tushiriladi).
Aniq joriy holatni `npm run hadith:build` chiqaradi.

"To'qqiz kitob"dan yettitasi (Muvatto, Buxoriy, Muslim, Abu Dovud, Termiziy, Nasoiy, Ibn Moja) to'liq qo'shilgan. **Musnad Ahmad va Sunan ad-Doramiy** bu manbada yo'q — boshqa manba kerak.

## Manbalar va tarjima

- Arabcha matn: [fawazahmed0/hadith-api](https://github.com/fawazahmed0/hadith-api). Matnning asl huquqlari
  alohida masala — ommaga chiqarishdan oldin tekshirilishi kerak.
- O'zbekcha tarjima: sun'iy intellekt yordamida arabchadan qilingan, **mutaxassis tomonidan tekshirilmagan**
  (`translation: "ai"`). Tekshirilgach yozuvga `"status": "reviewed"` qo'shiladi.
- Inglizcha nashr yordamchi sifatida ishlatilmaydi: Muvattoda u ba'zan boshqa hadisga tegishli bo'lib chiqadi.
