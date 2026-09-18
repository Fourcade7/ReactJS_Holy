import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ayahApi, errorMessage } from '../api/client.js'
import { Alert, Card, PageHeader, Skeleton } from '../components/Ui.jsx'

const JUZ_LIST = Array.from({ length: 30 }, (_, index) => index + 1)

export default function JuzListPage() {
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ayahApi
      .list({})
      .then((ayahs) => {
        const totals = {}
        for (const ayah of ayahs) {
          if (ayah.juz) totals[ayah.juz] = (totals[ayah.juz] ?? 0) + 1
        }
        setCounts(totals)
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageHeader
        title="Juzlar"
        subtitle="Qur'onning 30 juzi — oyat qo'shayotganda juz raqamini ko'rsatsangiz, shu yerda to'planadi."
      />

      <Alert>{error}</Alert>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-[74px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {JUZ_LIST.map((juz) => (
            <Link key={juz} to={`/juz/${juz}`}>
              <Card className="group hover:border-accent/50 flex h-full flex-col items-center justify-center gap-1 p-4 text-center transition-colors">
                <span className="text-ink group-hover:text-accent text-xl font-extrabold transition-colors">
                  {juz}
                </span>
                <span className="text-ink-faint text-[11px]">
                  {counts[juz] ? `${counts[juz]} oyat` : "bo'sh"}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
