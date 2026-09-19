import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ayahApi, errorMessage } from '../api/client.js'
import {
  AyahHoverScope,
  AyahRow,
  MushafText,
  ReaderPager,
  TranslationFlow,
} from '../components/Quran.jsx'
import MushafPage from '../components/MushafPage.jsx'
import PageTranslation from '../components/PageTranslation.jsx'
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Loader,
  Segmented,
} from '../components/Ui.jsx'
import { saveLastRead } from '../lib/lastRead.js'
import { TEXT_MODES, VIEW_MODES, groupByPage, usePref } from '../lib/reading.js'

const AYAHS_PER_VIEW = 10

export default function JuzReadPage() {
  const { number } = useParams()
  const current = Number(number)
  const [ayahs, setAyahs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = usePref('view-mode', 'ayah')
  const [textMode, setTextMode] = usePref('text-mode', 'both')
  const [cursor, setCursor] = useState(0)
  const readerRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    ayahApi
      .list({ juz: number })
      .then(setAyahs)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [number])

  useEffect(() => {
    setCursor(0)
  }, [number, viewMode])

  useEffect(() => {
    if (ayahs.length === 0) return
    saveLastRead({ path: `/juz/${current}`, label: `${current}-juz` })
  }, [ayahs, current])

  const pageGroups = useMemo(() => groupByPage(ayahs), [ayahs])
  const totalChunks = Math.ceil(ayahs.length / AYAHS_PER_VIEW)
  const showArabic = textMode !== 'translation'
  const showTranslation = textMode !== 'arabic'

  function move(delta) {
    setCursor((prev) => prev + delta)
    readerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const visibleAyahs =
    viewMode === 'ayah'
      ? ayahs.slice(cursor * AYAHS_PER_VIEW, (cursor + 1) * AYAHS_PER_VIEW)
      : []
  const group = viewMode === 'page' ? pageGroups[cursor] : null

  const pager =
    viewMode === 'ayah'
      ? {
          label: visibleAyahs.length
            ? `${cursor * AYAHS_PER_VIEW + 1}–${cursor * AYAHS_PER_VIEW + visibleAyahs.length} / ${ayahs.length} oyat`
            : null,
          prev:
            cursor > 0
              ? { label: 'Oldingi oyatlar', onClick: () => move(-1) }
              : current > 1
                ? { label: 'Oldingi juz', to: `/juz/${current - 1}` }
                : null,
          next:
            cursor < totalChunks - 1
              ? { label: 'Keyingi oyatlar', onClick: () => move(1) }
              : current < 30
                ? { label: 'Keyingi juz', to: `/juz/${current + 1}` }
                : null,
        }
      : {
          label: group?.pageNumber ? `${group.pageNumber}-sahifa` : null,
          prev:
            cursor > 0
              ? { label: 'Oldingi sahifa', onClick: () => move(-1) }
              : current > 1
                ? { label: 'Oldingi juz', to: `/juz/${current - 1}` }
                : null,
          next:
            cursor < pageGroups.length - 1
              ? { label: 'Keyingi sahifa', onClick: () => move(1) }
              : current < 30
                ? { label: 'Keyingi juz', to: `/juz/${current + 1}` }
                : null,
        }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-ink text-2xl font-extrabold tracking-tight">
            {current}-juz
          </h1>
          <p className="text-ink-faint mt-1 text-sm">
            {loading ? 'Yuklanmoqda…' : `${ayahs.length} ta oyat`}
          </p>
        </div>
        <Link to="/juz">
          <Button size="sm">Barcha juzlar</Button>
        </Link>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Segmented options={VIEW_MODES} value={viewMode} onChange={setViewMode} />
        <Segmented options={TEXT_MODES} value={textMode} onChange={setTextMode} />
      </div>

      <Alert>{error}</Alert>

      <div ref={readerRef} className="scroll-mt-24">
        {loading ? (
          <Loader rows={3} />
        ) : ayahs.length === 0 ? (
          <EmptyState
            title={`${current}-juzda oyat topilmadi`}
            hint="Bu juz boʻyicha maʼlumot fayllarda topilmadi."
          />
        ) : viewMode === 'ayah' ? (
          <Card className="divide-line divide-y overflow-hidden">
            {visibleAyahs.map((ayah) => (
              <AyahRow key={ayah.id} ayah={ayah} textMode={textMode} surahLink />
            ))}
          </Card>
        ) : group ? (
          <Card className="overflow-hidden px-5 py-7 sm:px-8 sm:py-9">
            <p className="text-ink-faint mb-6 text-center text-[13px] font-semibold">
              {group.pageNumber ? `${group.pageNumber}-sahifa` : 'sahifasiz'} ·{' '}
              {current}-juz
            </p>

            <AyahHoverScope>
              {showArabic ? (
                group.pageNumber ? (
                  <MushafPage
                    pageNumber={group.pageNumber}
                    fallback={<MushafText ayahs={group.ayahs} />}
                  />
                ) : (
                  <MushafText ayahs={group.ayahs} />
                )
              ) : null}
              {showArabic && showTranslation ? (
                <div className="bg-line my-7 h-px" />
              ) : null}
              {showTranslation ? (
                group.pageNumber ? (
                  <PageTranslation pageNumber={group.pageNumber} ayahs={group.ayahs} />
                ) : (
                  <TranslationFlow ayahs={group.ayahs} />
                )
              ) : null}
            </AyahHoverScope>
          </Card>
        ) : null}
      </div>

      {!loading && ayahs.length > 0 ? <ReaderPager {...pager} /> : null}
    </>
  )
}
