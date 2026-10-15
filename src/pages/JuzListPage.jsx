import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { surahApi } from '../api/client.js'
import { Card, PageHeader, cn } from '../components/Ui.jsx'
import { LIST_BOX, rowClass, useListView, ViewToggle } from '../components/ViewToggle.jsx'
import { JUZ_RANGES } from '../lib/juz.js'

const JUZ_LIST = Array.from({ length: 30 }, (_, index) => index + 1)

/** Jadval uslubidagi juzlar ro'yxati: raqam · suralar va oyatlar oralig'i · bet oralig'i · oyatlar soni */
function JuzList({ surahNames }) {
  return (
    <div className={LIST_BOX}>
      {JUZ_LIST.map((juz, index) => {
        const [fromSurah, fromAyah, toSurah, toAyah, fromPage, toPage, total] = JUZ_RANGES[juz]
        const names = [surahNames[fromSurah], surahNames[toSurah]].filter(Boolean)

        return (
          <Link
            key={juz}
            to={`/juz/${juz}`}
            className={cn(
              rowClass(index),
              'grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5',
              'sm:grid-cols-[2.5rem_minmax(0,1fr)_7rem_4.5rem]',
            )}
          >
            <span className="text-ink-faint text-sm font-semibold tabular-nums">{juz}</span>

            <span className="min-w-0">
              <span className="text-ink group-hover:text-accent block truncate text-[15px] font-semibold transition-colors">
                {names.length > 0
                  ? fromSurah === toSurah
                    ? names[0]
                    : names.join(' — ')
                  : `${juz}-juz`}
              </span>
              <span className="text-ink-faint block truncate text-xs tabular-nums">
                {fromSurah}:{fromAyah} – {toSurah}:{toAyah}
                <span className="sm:hidden">
                  {' '}
                  · {fromPage}–{toPage}-bet
                </span>
              </span>
            </span>

            <span className="hidden sm:block">
              <span className="bg-accent/10 text-accent rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums">
                {fromPage}–{toPage}-bet
              </span>
            </span>

            <span className="text-ink-faint text-right text-xs tabular-nums">{total} oyat</span>
          </Link>
        )
      })}
    </div>
  )
}

export default function JuzListPage() {
  const [surahNames, setSurahNames] = useState({})
  const [view, changeView] = useListView()

  useEffect(() => {
    surahApi
      .list()
      .then((list) =>
        setSurahNames(
          Object.fromEntries((Array.isArray(list) ? list : []).map((s) => [s.number, s.nameUz])),
        ),
      )
      .catch(() => setSurahNames({}))
  }, [])

  return (
    <>
      <PageHeader
        title="Juzlar"
        subtitle="Qurʼonning 30 juzi — har biri qaysi suralar, oyatlar va betlarni oʻz ichiga oladi."
      >
        <ViewToggle view={view} onChange={changeView} />
      </PageHeader>

      {view === 'list' ? (
        <JuzList surahNames={surahNames} />
      ) : (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {JUZ_LIST.map((juz) => {
          const [fromSurah, fromAyah, toSurah, toAyah, fromPage, toPage, total] = JUZ_RANGES[juz]
          const names = [surahNames[fromSurah], surahNames[toSurah]].filter(Boolean)

          return (
            <Link key={juz} to={`/juz/${juz}`}>
              <Card className="group hover:border-accent/50 flex h-full flex-col items-center justify-center gap-1 p-4 text-center transition-colors">
                <span className="text-ink group-hover:text-accent text-xl font-extrabold transition-colors">
                  {juz}
                </span>
                {names.length > 0 ? (
                  <span className="text-ink-soft max-w-full truncate text-[12px] font-semibold">
                    {fromSurah === toSurah ? names[0] : names.join(' — ')}
                  </span>
                ) : null}
                <span className="text-ink-faint text-[11px] tabular-nums">
                  {fromSurah}:{fromAyah} – {toSurah}:{toAyah}
                </span>
                <span className="bg-accent/10 text-accent mt-0.5 rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums">
                  {fromPage}–{toPage}-bet
                </span>
                <span className="text-ink-faint text-[11px]">
                  {total} oyat
                </span>
              </Card>
            </Link>
          )
        })}
      </div>
      )}
    </>
  )
}
