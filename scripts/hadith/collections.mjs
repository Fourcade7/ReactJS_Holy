/**
 * Hadis kitoblari ro'yxati — fetch va build skriptlari shu yerdan o'qiydi.
 * Quyidagi yo'llar hadith/ papkasiga nisbatan.
 *
 * Yangi kitob qo'shish:
 *   1. shu massivga yozuv qo'shiladi (edition — fawazahmed0/hadith-api dagi arabcha nashr nomi)
 *   2. `npm run hadith:fetch` — arabcha matn hadith/raw/ ga tushadi
 *   3. hadith/translations/<id>.uz.json yoziladi
 *   4. `npm run hadith:build`
 */
export const COLLECTIONS = [
  {
    id: 'arbain',
    edition: 'ara-nawawi',
    nameArabic: 'الأربعون النووية',
    nameUz: 'Arbaʼin an-Navaviy',
    authorUz: 'Imom an-Navaviy',
    descriptionUz:
      'Imom an-Navaviy toʻplagan, Islom dinining asosiy qoidalarini oʻz ichiga olgan qirq ikki hadis.',
  },
  {
    id: 'dehlaviy',
    edition: 'ara-dehlawi',
    nameArabic: 'الأربعون — شاه ولي الله الدهلوي',
    nameUz: 'Shoh Valiyulloh Dehlaviyning qirq hadisi',
    authorUz: 'Shoh Valiyulloh ad-Dehlaviy',
    descriptionUz:
      'Hind allomasi Shoh Valiyulloh Dehlaviy (1703–1762) toʻplagan qirqta qisqa, hikmatli hadis.',
  },
  {
    id: 'malik',
    edition: 'ara-malik',
    nameArabic: 'موطأ مالك',
    nameUz: 'Muvatto Molik',
    authorUz: 'Imom Molik ibn Anas',
    descriptionUz:
      'Imom Molik ibn Anas (711–795) toʻplagan eng qadimgi hadis toʻplamlaridan biri; hadislar fiqh boblari boʻyicha tartiblangan.',
  },
  {
    id: 'tirmidhi',
    edition: 'ara-tirmidhi',
    nameArabic: 'جامع الترمذي',
    nameUz: 'Sunani Termiziy',
    authorUz: 'Imom Abu Iso at-Termiziy',
    descriptionUz:
      'Imom Abu Iso Muhammad ibn Iso at-Termiziy (824–892) toʻplagan «Kutubi sitta»dan biri; har bir hadisning darajasi va olimlarning amali zikr qilingan.',
  },
  {
    id: 'ibnmajah',
    edition: 'ara-ibnmajah',
    nameArabic: 'سنن ابن ماجه',
    nameUz: 'Sunani Ibn Moja',
    authorUz: 'Imom Ibn Moja al-Qazviniy',
    descriptionUz:
      'Imom Abu Abdulloh Muhammad ibn Yazid ibn Moja al-Qazviniy (824–887) toʻplagan «Kutubi sitta»ning oltinchisi; hadislar fiqh boblari boʻyicha tartiblangan.',
  },
  {
    id: 'abudawud',
    edition: 'ara-abudawud',
    nameArabic: 'سنن أبي داود',
    nameUz: 'Sunani Abu Dovud',
    authorUz: 'Imom Abu Dovud as-Sijistoniy',
    descriptionUz:
      'Imom Abu Dovud Sulaymon ibn al-Ashʼas as-Sijistoniy (817–889) toʻplagan «Kutubi sitta»dan biri; asosan ahkom (fiqh) hadislari jamlangan.',
  },
  {
    id: 'bukhari',
    edition: 'ara-bukhari',
    nameArabic: 'صحيح البخاري',
    nameUz: 'Sahihi Buxoriy',
    authorUz: 'Imom Muhammad ibn Ismoil al-Buxoriy',
    descriptionUz:
      'Imom Abu Abdulloh Muhammad ibn Ismoil al-Buxoriy (810–870) toʻplagan, Qurʼondan keyingi eng ishonchli kitob deb eʼtirof etilgan «Kutubi sitta»ning birinchisi.',
    /* Manba bir rivoyatni bir nechta raqamga bo'lib, matnni takrorlagan — build-data.mjs ga qarang */
    mergeRepeated: true,
  },
  {
    id: 'muslim',
    edition: 'ara-muslim',
    nameArabic: 'صحيح مسلم',
    nameUz: 'Sahihi Muslim',
    authorUz: 'Imom Muslim ibn Hajjoj an-Naysoburiy',
    descriptionUz:
      'Imom Abul Husayn Muslim ibn Hajjoj al-Qushayriy an-Naysoburiy (821–875) toʻplagan, Sahihi Buxoriydan keyingi eng ishonchli hadis kitobi; bir mavzudagi rivoyatlar turli isnodlari bilan bir joyda jamlangan.',
    /* Buxoriydagi kabi takrorlangan matnlar bor (68 guruh) */
    mergeRepeated: true,
  },
  {
    id: 'nasai',
    edition: 'ara-nasai',
    nameArabic: 'سنن النسائي',
    nameUz: 'Sunani Nasoiy',
    authorUz: 'Imom Abu Abdurrahmon an-Nasoiy',
    descriptionUz:
      'Imom Abu Abdurrahmon Ahmad ibn Shuayb an-Nasoiy (829–915) toʻplagan «Kutubi sitta»dan biri («al-Mujtabo»); hadislar fiqh boblari boʻyicha tartiblangan, isnod illatlari diqqat bilan koʻrsatilgan.',
    /* Ikki joyda (352–353, 4938–4939) bir rivoyat ikki raqamga takrorlangan */
    mergeRepeated: true,
  },
]

export const rawPath = (collection) => `raw/${collection.edition}.json`
export const translationsPath = (collection) => `translations/${collection.id}.uz.json`
