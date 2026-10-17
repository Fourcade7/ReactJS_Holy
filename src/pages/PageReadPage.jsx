import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { errorMessage, pageApi, surahApi } from '../api/client.js'
import MushafPage from '../components/MushafPage.jsx'
import PageReadMark from '../components/PageReadMark.jsx'
import PageTranslation from '../components/PageTranslation.jsx'
import { AyahHoverScope, MushafText, ReaderPager } from '../components/Quran.jsx'
import SurahInfo from '../components/SurahInfo.jsx'
import {
  Badge,
  Card,
  EmptyState,
  Loader,
  Segmented,
} from '../components/Ui.jsx'
import { readingWidth } from '../lib/display.js'
import { saveLastRead } from '../lib/lastRead.js'
import { TEXT_MODES, usePref } from '../lib/reading.js'
import { juzPageRange } from '../lib/juz.js'
import { surahPageRange } from '../lib/xatm.js'

/**
 * Suralar bo'limidan ochilgan bet (/surah/S/page/N) shu sura ichida qoladi. Oldingi yoki keyingi bet
 * sura chegarasidan chiqsa, o'sha betni egallagan qo'shni suraga o'tiladi: oldinga yurganda bet
 * boshidagi, orqaga yurganda bet oxiridagi sura (suralar betlar bo'yicha tartibli).
 */
function surahForPage(surahNumber, pageNumber) {
  const step = pageNumber < surahPageRange(surahNumber)[0] ? -1 : 1
  for (let number = surahNumber; number >= 1 && number <= 114; number += step) {
    const [from, to] = surahPageRange(number)
    if (pageNumber >= from && pageNumber <= to) return number
  }
  return surahNumber
}

/* Juzlar bo'limidan ochilgan bet (/juz/J/page/N) ham shunday: juz chegarasidan chiqilsa qo'shni juzga
   o'tiladi. Chegaradagi bet ikki juzga tegishli bo'lsa, joriy juz ichida qolinadi */
function juzForPage(juzNumber, pageNumber) {
  const step = pageNumber < juzPageRange(juzNumber)[0] ? -1 : 1
  for (let number = juzNumber; number >= 1 && number <= 30; number += step) {
    const [from, to] = juzPageRange(number)
    if (pageNumber >= from && pageNumber <= to) return number
  }
  return juzNumber
}

/* Yo'ldagi sura yoki juz raqami — bet uning ichida bo'lsagina, aks holda null */
function contextOf(param, rangeOf, pageNumber) {
  const range = param ? rangeOf(Number(param)) : null
  return range && pageNumber >= range[0] && pageNumber <= range[1] ? Number(param) : null
}

export default function PageReadPage() {
  const { surah: surahParam, juz: juzParam, number } = useParams()
  const current = Number(number)
  /* Suralar yoki Juzlar bo'limidan kelingan bo'lsa — shu sura / juz, aks holda null */
  const contextSurah = contextOf(surahParam, surahPageRange, current)
  const contextJuz = contextOf(juzParam, juzPageRange, current)
  const pagePath = (pageNumber) =>
    contextSurah
      ? `/surah/${surahForPage(contextSurah, pageNumber)}/page/${pageNumber}`
      : contextJuz
        ? `/juz/${juzForPage(contextJuz, pageNumber)}/page/${pageNumber}`
        : `/page/${pageNumber}`
  const readPath = pagePath(current)
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [textMode, setTextMode] = usePref('text-mode', 'both')
  const [surahNames, setSurahNames] = useState({})

  useEffect(() => {
    setLoading(true)
    setError('')
    setPage(null)
    pageApi
      .get(number)
      .then((data) => {
        setPage(data)
        saveLastRead({ path: readPath, label: `${current}-sahifa` })
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [number, current, readPath])

  /* «Orqaga» havolasidagi sura nomi bet almashganda miltillamasligi uchun ro'yxatdan bir marta olinadi */
  const hasContext = Boolean(contextSurah)
  useEffect(() => {
    if (!hasContext) return
    surahApi
      .list()
      .then((list) =>
        setSurahNames(
          Object.fromEntries((Array.isArray(list) ? list : []).map((s) => [s.number, s.nameUz])),
        ),
      )
      .catch(() => setSurahNames({}))
  }, [hasContext])

  if ((surahParam && !contextSurah) || (juzParam && !contextJuz)) {
    return <Navigate to={`/page/${current}`} replace />
  }

  const showArabic = textMode !== 'translation'
  const showTranslation = textMode !== 'arabic'
  const juz = page?.juz ?? page?.ayahs?.[0]?.juz ?? null
  const surahsOnPage = [
    ...new Map(
      (page?.ayahs ?? []).map((ayah) => [ayah.surah.number, ayah.surah]),
    ).values(),
  ]
  /* Shu betda boshlanadigan suralar (1-oyati shu betda) — ular haqida ma'lumot ko'rsatiladi */
  const startingSurahs = (page?.ayahs ?? [])
    .filter((ayah) => ayah.numberInSurah === 1)
    .map((ayah) => ayah.surah)

  return (
    <div className="mx-auto w-full" style={readingWidth(48)}>
      <div className="text-ink-faint mb-6 flex items-center justify-center gap-2 text-sm">
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" />
        </svg>
        <span className="text-ink font-semibold">{current}-sahifa</span>
        {juz ? <span>Juz {juz}</span> : null}
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          to={
            contextSurah
              ? `/surah/${contextSurah}/pages`
              : contextJuz
                ? `/juz/${contextJuz}/pages`
                : '/pages'
          }
          className="text-ink-faint hover:text-accent inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {contextSurah
            ? surahNames[contextSurah]
              ? `${surahNames[contextSurah]} sahifalari`
              : 'Sura sahifalari'
            : contextJuz
              ? `${contextJuz}-juz sahifalari`
              : 'Sahifalar'}
        </Link>

        <Segmented options={TEXT_MODES} value={textMode} onChange={setTextMode} />
      </div>

      {loading ? <Loader rows={3} /> : null}

      {error ? (
        <EmptyState
          title={`${current}-sahifa boʻyicha maʼlumot yoʻq`}
          hint="Bu sahifa maʼlumot fayllarida topilmadi."
        />
      ) : null}

      {page ? (
        <>
          {surahsOnPage.length > 0 ? (
            <div className="mb-5 flex flex-wrap justify-center gap-2">
              {surahsOnPage.map((surah) => (
                <Link key={surah.number} to={`/surah/${surah.number}`}>
                  <Badge tone="accent" className="hover:bg-accent/20 transition-colors">
                    {surah.number}. {surah.nameUz}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : null}

          {startingSurahs.length > 0 ? (
            <Card className="divide-line mb-5 divide-y">
              {startingSurahs.map((surah) => (
                <div key={surah.number} className="p-5 sm:p-6">
                  <SurahInfo surah={surah} as="h2" />
                </div>
              ))}
            </Card>
          ) : null}

          <Card className="px-5 py-8 sm:px-8 sm:py-10">
            <AyahHoverScope>
            {showArabic ? (
              page.textArabic ? (
                <p className="mushaf txt-arabic-flow text-ink whitespace-pre-wrap">
                  {page.textArabic}
                </p>
              ) : (
                <MushafPage
                  pageNumber={current}
                  fallback={
                    page.ayahs.length > 0 ? (
                      <MushafText ayahs={page.ayahs} />
                    ) : (
                      <p className="text-ink-faint text-center text-sm italic">
                        Bu sahifaning arabcha matni kiritilmagan
                      </p>
                    )
                  }
                />
              )
            ) : null}

            {showArabic && showTranslation ? (
              <div className="bg-line my-8 h-px" />
            ) : null}

            {showTranslation ? (
              page.translationUz ? (
                <p className="txt-uz text-ink-soft leading-[2] whitespace-pre-wrap">
                  {page.translationUz}
                </p>
              ) : page.ayahs.length > 0 ? (
                <PageTranslation ayahs={page.ayahs} />
              ) : (
                <p className="text-ink-faint text-center text-sm italic">
                  Bu sahifaning tarjimasi kiritilmagan
                </p>
              )
            ) : null}
            </AyahHoverScope>

            {page.note ? (
              <p className="border-line text-ink-faint txt-uz-sub mt-8 border-t pt-5 whitespace-pre-wrap">
                {page.note}
              </p>
            ) : null}
          </Card>

          <PageReadMark pageNumber={current} />
        </>
      ) : null}

      <ReaderPager
        keyboard
        label={`${current} / 604`}
        prev={current > 1 ? { label: 'Oldingi sahifa', to: pagePath(current - 1) } : null}
        next={
          current < 604 ? { label: 'Keyingi sahifa', to: pagePath(current + 1) } : null
        }
      />
    </div>
  )
}
