import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { errorMessage, pageApi, surahApi } from '../api/client.js'
import PageTiles, {
  PageTilesSkeleton,
  useDayColors,
  useSurahsByPage,
} from '../components/PageTiles.jsx'
import { Alert, Badge, Button, Card, EmptyState, Skeleton } from '../components/Ui.jsx'
import { useListView, ViewToggle } from '../components/ViewToggle.jsx'
import { JUZ_RANGES, juzPageRange } from '../lib/juz.js'
import { pageRangeXatmStatus, useXatm } from '../lib/xatm.js'

/** Juz sarlavhasi: raqami, qaysi suralardan iborati, oyatlar oralig'i va o'qilgan betlar */
function JuzInfo({ juz, surahNames, xatm }) {
  const [fromSurah, fromAyah, toSurah, toAyah, fromPage, toPage, total] = JUZ_RANGES[juz]
  const names = [surahNames[fromSurah], surahNames[toSurah]].filter(Boolean)
  const xatmStatus = pageRangeXatmStatus(xatm, [fromPage, toPage])

  return (
    <div className="flex items-start gap-4">
      <div className="bg-surface-2 text-accent hidden h-16 min-w-16 flex-none items-center justify-center rounded-md px-2 text-[28px] font-extrabold tabular-nums sm:flex">
        {juz}
      </div>

      <div className="min-w-0 flex-1">
        <h1 className="text-ink text-2xl font-extrabold tracking-tight">{juz}-juz</h1>
        {names.length > 0 ? (
          <p className="text-accent mt-0.5 text-lg font-semibold">
            {fromSurah === toSurah ? names[0] : names.join(' — ')}
          </p>
        ) : null}
        <p className="text-ink-faint mt-2 text-[13px] leading-relaxed">
          {fromSurah}:{fromAyah} – {toSurah}:{toAyah} oyatlarni oʻz ichiga oladi, {total} oyatdan
          iborat. Mushafning {fromPage}–{toPage}-sahifalarida ({toPage - fromPage + 1} bet)
          joylashgan.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="accent">{total} oyat</Badge>
          <Badge>{fromPage}-sahifadan</Badge>
          {xatmStatus ? (
            <Badge
              className="bg-emerald-500/10! text-emerald-500! tabular-nums"
              title={`${xatmStatus.from}–${xatmStatus.to}-betlar`}
            >
              {xatmStatus.done
                ? `✓ Toʻliq oʻqildi · ${xatmStatus.total} bet`
                : `${xatmStatus.read}/${xatmStatus.total} bet oʻqildi · ${xatmStatus.total - xatmStatus.read} ta qoldi`}
            </Badge>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/**
 * Juzlar bo'limida juz bosilganda: juz haqida ma'lumot va u joylashgan betlar
 * (sura betlari kabi). O'quvchi betni o'zi tanlab kiradi.
 */
export default function JuzPagesPage() {
  const { number } = useParams()
  const juzNumber = Number(number)
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

  const surahNames = useMemo(
    () => Object.fromEntries(surahs.map((surah) => [surah.number, surah.nameUz])),
    [surahs],
  )
  const range = juzPageRange(juzNumber)
  const juzPages = useMemo(
    () => (range ? pages.filter((page) => page.number >= range[0] && page.number <= range[1]) : []),
    [pages, range],
  )

  return (
    <>
      <Link
        to="/juz"
        className="text-ink-faint hover:text-accent mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Juzlar
      </Link>

      <Alert>{error}</Alert>

      {loading ? (
        <>
          <Skeleton className="mb-6 h-[190px]" />
          <PageTilesSkeleton view={view} />
        </>
      ) : error ? null : !range ? (
        <EmptyState
          title={`${number}-juz topilmadi`}
          hint="Qurʼon 30 juzdan iborat — 1 dan 30 gacha raqam tanlang."
        />
      ) : (
        <>
          <Card className="mb-6 p-5 sm:p-6">
            <JuzInfo juz={juzNumber} surahNames={surahNames} xatm={xatm} />

            <div className="border-line mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <p className="text-ink-faint text-[13px]">
                Oʻqishni boshlash uchun sahifani tanlang ·{' '}
                <span className="text-ink font-semibold tabular-nums">
                  {range[0]}–{range[1]}-betlar
                </span>
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <ViewToggle view={view} onChange={changeView} />
                <Link to={`/juz/${juzNumber}`}>
                  <Button size="sm">Juzni toʻliq oʻqish</Button>
                </Link>
              </div>
            </div>
          </Card>

          {juzPages.length === 0 ? (
            <EmptyState
              icon="۩"
              title="Bu juzning sahifalari topilmadi"
              hint="public/data/pages.json fayli topilmadi yoki boʻsh."
            />
          ) : (
            <PageTiles
              view={view}
              pages={juzPages}
              surahsByPage={surahsByPage}
              xatm={xatm}
              dayColors={dayColors}
              pageHref={(page) => `/juz/${juzNumber}/page/${page}`}
            />
          )}
        </>
      )}
    </>
  )
}
