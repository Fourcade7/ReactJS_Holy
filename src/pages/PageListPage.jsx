import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { errorMessage, pageApi } from '../api/client.js'
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Skeleton,
} from '../components/Ui.jsx'

export default function PageListPage() {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [jump, setJump] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    pageApi
      .list()
      .then(setPages)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

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
        <form className="flex items-center gap-2" onSubmit={onJump}>
          <Input
            type="number"
            min="1"
            max="604"
            placeholder="Sahifa №"
            value={jump}
            onChange={(event) => setJump(event.target.value)}
            className="w-32 rounded-full text-center"
          />
          <Button variant="primary" type="submit">
            O'tish
          </Button>
        </form>
      </PageHeader>

      <Alert>{error}</Alert>

      {loading ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
          {Array.from({ length: 14 }).map((_, index) => (
            <Skeleton key={index} className="h-[74px]" />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <EmptyState
          icon="۩"
          title="Hozircha sahifa maʼlumoti yoʻq"
          hint="Oyat qoʻshayotganda sahifa raqamini koʻrsating yoki Sozlamalar → Sahifalar boʻlimidan tarjima kiriting."
        />
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
          {pages.map((page, index) => (
            <Link
              key={page.number}
              to={`/page/${page.number}`}
              className="animate-rise"
              style={{ animationDelay: `${Math.min(index, 20) * 20}ms` }}
            >
              <Card className="group hover:border-accent/50 flex h-full flex-col items-center justify-center gap-1 p-3.5 text-center transition-colors">
                <span className="text-ink group-hover:text-accent text-xl font-bold transition-colors">
                  {page.number}
                </span>
                <span className="text-ink-faint text-[11px]">{page.ayahCount} oyat</span>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${page.hasTranslation ? 'bg-accent' : 'bg-line'}`}
                  title={page.hasTranslation ? 'Tarjima kiritilgan' : 'Tarjima yoʻq'}
                />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
