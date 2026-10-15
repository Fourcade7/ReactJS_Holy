import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { errorMessage, pageApi, surahApi } from '../api/client.js'
import PageTiles, {
  PageTilesSkeleton,
  useDayColors,
  useSurahsByPage,
} from '../components/PageTiles.jsx'
import SurahInfo from '../components/SurahInfo.jsx'
import { Alert, Button, Card, EmptyState, Skeleton } from '../components/Ui.jsx'
import { useListView, ViewToggle } from '../components/ViewToggle.jsx'
import { surahPageRange, useXatm } from '../lib/xatm.js'

/**
 * Suralar bo'limida sura bosilganda: sura haqida ma'lumot va u joylashgan betlar
 * (Sahifalar bo'limidagi kabi). O'quvchi betni o'zi tanlab kiradi.
 */
export default function SurahPagesPage() {
  const { number } = useParams()
  const surahNumber = Number(number)
  const [surahs, setSurahs] = useState([])
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, changeView] = useListView()
  const xatm = useXatm()
  const dayColors = useDayColors(xatm)
  const surahsByPage = useSurahsByPage(surahs)

  useEffect(() => {
    Promise.all([surahApi.list(), pageApi.list()])
      .then(([surahList, pageList]) => {
        setSurahs(Array.isArray(surahList) ? surahList : [])
        setPages(Array.isArray(pageList) ? pageList : [])
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const surah = surahs.find((item) => item.number === surahNumber)
  const range = surahPageRange(surahNumber)
  const surahPages = useMemo(
    () => (range ? pages.filter((page) => page.number >= range[0] && page.number <= range[1]) : []),
    [pages, range],
  )

  return (
    <>
      <Link
        to="/"
        className="text-ink-faint hover:text-accent mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Suralar
      </Link>

      <Alert>{error}</Alert>

      {loading ? (
        <>
          <Skeleton className="mb-6 h-[190px]" />
          <PageTilesSkeleton view={view} />
        </>
      ) : error ? null : !surah || !range ? (
        <EmptyState
          title={`${number}-sura topilmadi`}
          hint="Bunday raqamli sura maʼlumot fayllarida yoʻq."
        />
      ) : (
        <>
          <Card className="mb-6 p-5 sm:p-6">
            <SurahInfo surah={surah} />

            <div className="border-line mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <p className="text-ink-faint text-[13px]">
                Oʻqishni boshlash uchun sahifani tanlang ·{' '}
                <span className="text-ink font-semibold tabular-nums">
                  {range[0] === range[1] ? `${range[0]}-bet` : `${range[0]}–${range[1]}-betlar`}
                </span>
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <ViewToggle view={view} onChange={changeView} />
                <Link to={`/surah/${surah.number}`}>
                  <Button size="sm">Surani toʻliq oʻqish</Button>
                </Link>
              </div>
            </div>
          </Card>

          {surahPages.length === 0 ? (
            <EmptyState
              icon="۩"
              title="Bu suraning sahifalari topilmadi"
              hint="public/data/pages.json fayli topilmadi yoki boʻsh."
            />
          ) : (
            <PageTiles
              view={view}
              pages={surahPages}
              surahsByPage={surahsByPage}
              xatm={xatm}
              dayColors={dayColors}
              pageHref={(page) => `/surah/${surah.number}/page/${page}`}
            />
          )}
        </>
      )}
    </>
  )
}
