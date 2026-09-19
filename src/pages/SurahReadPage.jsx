import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { errorMessage, surahApi } from '../api/client.js'
import {
  AyahHoverScope,
  AyahRow,
  MushafText,
  ReaderPager,
  TranslationFlow,
} from '../components/Quran.jsx'
import MushafPage from '../components/MushafPage.jsx'
import PageReadMark from '../components/PageReadMark.jsx'
import PageTranslation from '../components/PageTranslation.jsx'
import { Alert, Badge, Card, EmptyState, Loader, Segmented } from '../components/Ui.jsx'
import { saveLastRead } from '../lib/lastRead.js'
import { surahXatmStatus, useXatm } from '../lib/xatm.js'
import { TEXT_MODES, VIEW_MODES, groupByPage, usePref } from '../lib/reading.js'

const AYAHS_PER_VIEW = 10

export default function SurahReadPage() {
  const { number } = useParams()
  const [surah, setSurah] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = usePref('view-mode', 'ayah')
  const [textMode, setTextMode] = usePref('text-mode', 'both')
  const [cursor, setCursor] = useState(0)
  const xatm = useXatm()
  const { hash } = useLocation()
  const readerRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    surahApi
      .get(number)
      .then(setSurah)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [number])

  const pageGroups = useMemo(() => (surah ? groupByPage(surah.ayahs) : []), [surah])
  const totalChunks = surah ? Math.ceil(surah.ayahs.length / AYAHS_PER_VIEW) : 0

  useEffect(() => {
    setCursor(0)
  }, [number, viewMode])

  /* Ctrl+K orqali tanlangan oyat qaysi bo'lakda bo'lsa, o'sha bo'lakni ochamiz */
  useEffect(() => {
    if (!surah || !hash) return
    const target = Number(hash.replace('#ayah-', ''))
    if (!target) return

    if (viewMode === 'ayah') {
      const index = surah.ayahs.findIndex((ayah) => ayah.numberInSurah === target)
      if (index >= 0) setCursor(Math.floor(index / AYAHS_PER_VIEW))
    } else {
      const index = pageGroups.findIndex((group) =>
        group.ayahs.some((ayah) => ayah.numberInSurah === target),
      )
      if (index >= 0) setCursor(index)
    }
  }, [surah, hash, viewMode, pageGroups])

  /* Oxirgi o'qilgan joy: qaysi oyatdan davom etishni eslab qolamiz */
  useEffect(() => {
    if (!surah || surah.ayahs.length === 0) return
    const first =
      viewMode === 'ayah'
        ? surah.ayahs[cursor * AYAHS_PER_VIEW]
        : pageGroups[cursor]?.ayahs[0]
    if (!first) return

    saveLastRead({
      path: `/surah/${surah.number}#ayah-${first.numberInSurah}`,
      label: `${surah.nameUz} ${surah.number}:${first.numberInSurah}`,
    })
  }, [surah, viewMode, cursor, pageGroups])

  useEffect(() => {
    if (!surah || !hash) return
    const timer = setTimeout(() => {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
    return () => clearTimeout(timer)
  }, [surah, hash, cursor])

  function move(delta) {
    setCursor((prev) => prev + delta)
    readerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (loading) return <Loader rows={4} />
  if (error) return <Alert>{error}</Alert>

  const showArabic = textMode !== 'translation'
  const showTranslation = textMode !== 'arabic'
  const surahNumber = surah.number
  const xatmStatus = surahXatmStatus(xatm, surahNumber)

  const visibleAyahs =
    viewMode === 'ayah'
      ? surah.ayahs.slice(cursor * AYAHS_PER_VIEW, (cursor + 1) * AYAHS_PER_VIEW)
      : []
  const group = viewMode === 'page' ? pageGroups[cursor] : null

  const pager =
    viewMode === 'ayah'
      ? {
          label: visibleAyahs.length
            ? `${visibleAyahs[0].numberInSurah}–${visibleAyahs.at(-1).numberInSurah} / ${surah.ayahs.length} oyat`
            : null,
          prev:
            cursor > 0
              ? { label: 'Oldingi oyatlar', onClick: () => move(-1) }
              : surahNumber > 1
                ? { label: 'Oldingi sura', to: `/surah/${surahNumber - 1}` }
                : null,
          next:
            cursor < totalChunks - 1
              ? { label: 'Keyingi oyatlar', onClick: () => move(1) }
              : surahNumber < 114
                ? { label: 'Keyingi sura', to: `/surah/${surahNumber + 1}` }
                : null,
        }
      : {
          label: group?.pageNumber ? `${group.pageNumber}-sahifa` : null,
          prev:
            cursor > 0
              ? { label: 'Oldingi sahifa', onClick: () => move(-1) }
              : group?.pageNumber > 1
                ? { label: 'Oldingi sahifa', to: `/page/${group.pageNumber - 1}` }
                : null,
          next:
            cursor < pageGroups.length - 1
              ? { label: 'Keyingi sahifa', onClick: () => move(1) }
              : group?.pageNumber && group.pageNumber < 604
                ? { label: 'Keyingi sahifa', to: `/page/${group.pageNumber + 1}` }
                : null,
        }

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

      <Card className="mb-6 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="bg-surface-2 hidden h-16 w-16 flex-none items-center justify-center rounded-xl sm:flex">
            <span className="arabic text-accent text-2xl leading-none">
              {surah.nameArabic}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-ink text-2xl font-extrabold tracking-tight">
              {surah.number}. {surah.nameUz}
            </h1>
            {surah.meaningUz ? (
              <p className="text-accent mt-0.5 text-lg font-semibold">{surah.meaningUz}</p>
            ) : null}
            <p className="text-ink-faint mt-2 text-[13px] leading-relaxed">
              {surah.nameUz} surasini arabcha matni va oʻzbekcha tarjimasi bilan oʻqing.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {surah.revelationPlace ? (
                <Badge>{surah.revelationPlace === 'makka' ? 'Makkiy' : 'Madaniy'}</Badge>
              ) : null}
              <Badge tone="accent">
                {surah.ayahs.length}
                {surah.totalAyahs ? ` / ${surah.totalAyahs}` : ''} oyat
              </Badge>
              {surah.startPage ? <Badge>{surah.startPage}-sahifadan</Badge> : null}
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

        <div className="border-line mt-5 flex flex-wrap items-center gap-2 border-t pt-4">
          <Segmented options={VIEW_MODES} value={viewMode} onChange={setViewMode} />
          <Segmented options={TEXT_MODES} value={textMode} onChange={setTextMode} />
        </div>
      </Card>

      <div ref={readerRef} className="scroll-mt-24">
        {surah.ayahs.length === 0 ? (
          <EmptyState
            title="Bu surada hali oyat yo'q"
            hint="Bu suraning oyatlari maʼlumot fayllarida topilmadi."
          />
        ) : viewMode === 'ayah' ? (
          <Card className="divide-line divide-y overflow-hidden">
            {visibleAyahs.map((ayah) => (
              <AyahRow key={ayah.id} ayah={ayah} textMode={textMode} />
            ))}
          </Card>
        ) : group ? (
          <Card className="overflow-hidden px-5 py-7 sm:px-8 sm:py-9">
            <p className="text-ink-faint mb-6 text-center text-[13px] font-semibold">
              {group.pageNumber ? `${group.pageNumber}-sahifa` : 'sahifasiz'}
              {group.ayahs[0]?.juz ? ` · ${group.ayahs[0].juz}-juz` : ''}
            </p>

            <AyahHoverScope>
              {showArabic ? (
                group.pageNumber ? (
                  <MushafPage
                    pageNumber={group.pageNumber}
                    fallback={
                      <MushafText ayahs={group.ayahs} surahNumber={surahNumber} />
                    }
                  />
                ) : (
                  <MushafText ayahs={group.ayahs} surahNumber={surahNumber} />
                )
              ) : null}
              {showArabic && showTranslation ? (
                <div className="bg-line my-7 h-px" />
              ) : null}
              {showTranslation ? (
                group.pageNumber ? (
                  <PageTranslation
                    pageNumber={group.pageNumber}
                    ayahs={group.ayahs}
                    surahNumber={surahNumber}
                  />
                ) : (
                  <TranslationFlow ayahs={group.ayahs} surahNumber={surahNumber} />
                )
              ) : null}
            </AyahHoverScope>
          </Card>
        ) : null}

        {viewMode === 'page' && group?.pageNumber ? (
          <PageReadMark pageNumber={group.pageNumber} />
        ) : null}
      </div>

      {surah.ayahs.length > 0 ? <ReaderPager {...pager} /> : null}
    </>
  )
}
