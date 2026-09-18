import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { errorMessage, pageApi } from '../api/client.js'
import MushafPage from '../components/MushafPage.jsx'
import {
  AyahHoverScope,
  MushafText,
  ReaderPager,
  TranslationFlow,
} from '../components/Quran.jsx'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Loader,
  Segmented,
} from '../components/Ui.jsx'
import { readingWidth } from '../lib/display.js'
import { saveLastRead } from '../lib/lastRead.js'
import { TEXT_MODES, usePref } from '../lib/reading.js'

export default function PageReadPage() {
  const { number } = useParams()
  const current = Number(number)
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [textMode, setTextMode] = usePref('text-mode', 'both')

  useEffect(() => {
    setLoading(true)
    setError('')
    setPage(null)
    pageApi
      .get(number)
      .then((data) => {
        setPage(data)
        saveLastRead({ path: `/page/${current}`, label: `${current}-sahifa` })
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [number, current])

  const showArabic = textMode !== 'translation'
  const showTranslation = textMode !== 'arabic'
  const juz = page?.juz ?? page?.ayahs?.[0]?.juz ?? null
  const surahsOnPage = [
    ...new Map(
      (page?.ayahs ?? []).map((ayah) => [ayah.surah.number, ayah.surah]),
    ).values(),
  ]

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
          to="/pages"
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
          Sahifalar
        </Link>

        <Segmented options={TEXT_MODES} value={textMode} onChange={setTextMode} />
      </div>

      {loading ? <Loader rows={3} /> : null}

      {error ? (
        <EmptyState
          title={`${current}-sahifa boʻyicha maʼlumot yoʻq`}
          hint="Bu sahifa bazada topilmadi."
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
                <TranslationFlow ayahs={page.ayahs} />
              ) : (
                <p className="text-ink-faint text-center text-sm italic">
                  Bu sahifaning tarjimasi kiritilmagan
                </p>
              )
            ) : null}
            </AyahHoverScope>

            {page.note ? (
              <p className="border-line text-ink-faint mt-8 border-t pt-5 text-sm leading-relaxed whitespace-pre-wrap">
                {page.note}
              </p>
            ) : null}
          </Card>
        </>
      ) : null}

      <ReaderPager
        label={`${current} / 604`}
        prev={current > 1 ? { label: 'Oldingi sahifa', to: `/page/${current - 1}` } : null}
        next={
          current < 604 ? { label: 'Keyingi sahifa', to: `/page/${current + 1}` } : null
        }
      />
    </div>
  )
}
