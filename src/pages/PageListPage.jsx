import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { errorMessage, pageApi, surahApi } from '../api/client.js'
import { usePref } from '../lib/reading.js'
import { lastXatmMark, useXatm } from '../lib/xatm.js'
import PageTiles, {
  PageTilesSkeleton,
  useDayColors,
  useSurahsByPage,
} from '../components/PageTiles.jsx'
import { Alert, Button, EmptyState, Input, PageHeader } from '../components/Ui.jsx'
import { useListView, ViewToggle } from '../components/ViewToggle.jsx'

export default function PageListPage() {
  const [view, changeView] = useListView()
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [jump, setJump] = useState('')
  const navigate = useNavigate()
  const xatm = useXatm()
  const dayColors = useDayColors(xatm)
  const [order, setOrder] = usePref('page-order', 'asc')

  useEffect(() => {
    pageApi
      .list()
      .then(setPages)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  /* Bo'limga kirganda oxirgi belgilangan bet ekran o'rtasiga keladi — faqat bir marta,
     shunda bet ichida belgi qo'yib/olganda sahifa sakramaydi.
     Kartochka faqat ro'yxat ichidan qidiriladi: navbardagi «Davom etish» ham shu betga
     olib borishi mumkin (/page/N) */
  const gridRef = useRef(null)
  const scrolledToLastRef = useRef(false)
  useEffect(() => {
    if (loading || pages.length === 0 || scrolledToLastRef.current) return
    scrolledToLastRef.current = true
    const last = lastXatmMark(xatm)
    if (!last) return
    requestAnimationFrame(() => {
      gridRef.current
        /* HashRouter'da havola «#/page/N» bo'ladi — oxiri bo'yicha qidiriladi */
        ?.querySelector(`a[href$="/page/${last[0]}"]`)
        ?.scrollIntoView({ block: 'center', behavior: 'instant' })
    })
  }, [loading, pages, xatm])

  const [surahs, setSurahs] = useState([])
  useEffect(() => {
    surahApi
      .list()
      .then((list) => setSurahs(Array.isArray(list) ? list : []))
      .catch(() => setSurahs([]))
  }, [])

  const surahsByPage = useSurahsByPage(surahs)

  const visiblePages = useMemo(
    () =>
      [...pages].sort((a, b) => (order === 'asc' ? a.number - b.number : b.number - a.number)),
    [pages, order],
  )

  function onJump(event) {
    event.preventDefault()
    const target = Number(jump)
    if (target >= 1 && target <= 604) navigate(`/page/${target}`)
  }

  return (
    <>
      <PageHeader
        title="Sahifalar"
        subtitle={
          loading
            ? 'Yuklanmoqda…'
            : `${pages.length} ta sahifada maʼlumot bor · mushaf boʻyicha 1–604`
        }
      >
        <div className="flex flex-wrap items-center gap-5">
          {/* Suralar bo'limidagi kabi tartib almashtirgich */}
          <button
            onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
            className="text-ink-faint hover:text-ink flex cursor-pointer items-center gap-1.5 text-xs font-semibold tracking-wider uppercase transition-colors"
          >
            Tartib:
            <span className="text-ink">{order === 'asc' ? 'Oʻsish' : 'Kamayish'}</span>
            <svg
              viewBox="0 0 24 24"
              className={`h-3.5 w-3.5 transition-transform duration-200 ${order === 'asc' ? '' : 'rotate-180'}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>

          <ViewToggle view={view} onChange={changeView} />

          <form className="flex items-center gap-2" onSubmit={onJump}>
            <Input
              type="number"
              min="1"
              max="604"
              placeholder="Sahifa №"
              value={jump}
              onChange={(event) => setJump(event.target.value)}
              className="w-40! text-center"
            />
            <Button variant="primary" type="submit">
              O'tish
            </Button>
          </form>
        </div>
      </PageHeader>

      <Alert>{error}</Alert>

      {loading ? (
        <PageTilesSkeleton view={view} />
      ) : pages.length === 0 ? (
        <EmptyState
          icon="۩"
          title="Hozircha sahifa maʼlumoti yoʻq"
          hint="public/data/pages.json fayli topilmadi yoki boʻsh."
        />
      ) : (
        <PageTiles
          view={view}
          pages={visiblePages}
          surahsByPage={surahsByPage}
          xatm={xatm}
          dayColors={dayColors}
          listRef={gridRef}
        />
      )}
    </>
  )
}
