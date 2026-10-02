import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Input, SectionTitle } from '../../components/Ui.jsx'
import {
  TOTAL_PAGES,
  formatReadAt,
  resetXatm,
  setXatmRange,
  useXatm,
  xatmStartedAt,
} from '../../lib/xatm.js'

/* Bir necha betni birdaniga belgilash: masalan, boshqa joyda o'qilgan 21–30-betlar */
function RangeMark() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [message, setMessage] = useState(null)

  function apply(read) {
    const a = Number(from)
    const b = Number(to || from)
    const valid = (n) => Number.isInteger(n) && n >= 1 && n <= TOTAL_PAGES
    if (!valid(a) || !valid(b)) {
      setMessage({ ok: false, text: `Sahifa raqami 1 dan ${TOTAL_PAGES} gacha boʻlishi kerak.` })
      return
    }
    const [start, end] = a <= b ? [a, b] : [b, a]
    setXatmRange(start, end, read)
    const label = start === end ? `${start}-sahifa` : `${start}–${end}-sahifalar`
    const count = end - start + 1
    setMessage({
      ok: true,
      text: read
        ? `${label} oʻqildi deb belgilandi (${count} ta).`
        : `${label} belgisi olib tashlandi (${count} ta).`,
    })
  }

  return (
    <Card className="p-6">
      <SectionTitle>Oraliqni belgilash</SectionTitle>
      <p className="text-ink-faint mt-2 text-sm leading-relaxed">
        Boshqa joyda oʻqigan sahifalaringizni birma-bir bosib oʻtirmasdan, oraliq bilan belgilang.
        Bitta sahifa uchun faqat birinchi maydonni toʻldirish kifoya.
      </p>

      <form
        className="mt-5 flex flex-wrap items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          apply(true)
        }}
      >
        <Input
          type="number"
          min="1"
          max={TOTAL_PAGES}
          placeholder="dan"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          className="w-24! text-center"
          aria-label="Boshlanish sahifasi"
        />
        <span className="text-ink-faint">–</span>
        <Input
          type="number"
          min="1"
          max={TOTAL_PAGES}
          placeholder="gacha"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          className="w-24! text-center"
          aria-label="Tugash sahifasi"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!from}
          className="border-emerald-500! bg-emerald-500! text-white! hover:bg-emerald-600!"
        >
          Oʻqildi deb belgilash
        </Button>
        <Button type="button" variant="ghost" size="sm" disabled={!from} onClick={() => apply(false)}>
          Belgini olib tashlash
        </Button>
      </form>

      {message ? (
        <p className={`mt-3 text-sm ${message.ok ? 'text-emerald-500' : 'text-red-500'}`}>
          {message.text}
        </p>
      ) : null}
    </Card>
  )
}

export default function XatmSettings() {
  const xatm = useXatm()
  const [confirming, setConfirming] = useState(false)

  const entries = Object.entries(xatm)
  const readCount = entries.length
  const startedAt = xatmStartedAt(xatm)
  const percent = Math.round((readCount / TOTAL_PAGES) * 1000) / 10
  /* Oraliq bilan belgilanganda vaqtlar bir xil bo'ladi — u holda eng katta bet oxirgisi */
  const last = entries.reduce(
    (best, entry) =>
      !best || entry[1] > best[1] || (entry[1] === best[1] && Number(entry[0]) > Number(best[0]))
        ? entry
        : best,
    null,
  )

  function onReset() {
    resetXatm()
    setConfirming(false)
  }

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <SectionTitle>Xatm holati</SectionTitle>

        <div className="mt-5 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-emerald-500 tabular-nums">{readCount}</span>
          <span className="text-ink-faint text-sm">/ {TOTAL_PAGES} sahifa oʻqildi</span>
          <span className="text-ink-soft ml-auto text-sm font-semibold tabular-nums">{percent}%</span>
        </div>

        <div className="bg-surface-2 mt-3 h-2.5 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
            style={{ width: `${Math.min(100, (readCount / TOTAL_PAGES) * 100)}%` }}
          />
        </div>

        <p className="text-ink-faint mt-4 text-sm">
          {last ? (
            <>
              Boshlangan vaqti:{' '}
              <span className="text-ink font-semibold">{formatReadAt(startedAt)}</span>
              <span className="text-line mx-2.5">|</span>
              Oxirgi belgilangan:{' '}
              <Link to={`/page/${last[0]}`} className="text-ink hover:text-accent font-semibold">
                {last[0]}-sahifa
              </Link>{' '}
              · {formatReadAt(last[1])}
            </>
          ) : (
            <>
              Hali birorta sahifa belgilanmagan. <Link to="/pages" className="text-accent font-semibold">Sahifalar</Link>{' '}
              boʻlimida sahifa burchagidagi belgini bosing.
            </>
          )}
        </p>
      </Card>

      <RangeMark />

      <Card className="p-6">
        <SectionTitle>Belgilarni tozalash</SectionTitle>
        <p className="text-ink-faint mt-2 text-sm leading-relaxed">
          Barcha «oʻqildi» belgilari va ularning sanalari oʻchiriladi. Yangi xatmni boshlash uchun
          ishlating. Belgilar faqat shu brauzerda saqlanadi.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {confirming ? (
            <>
              <span className="text-ink text-sm font-semibold">
                {readCount} ta belgi oʻchirilsinmi?
              </span>
              <Button variant="danger" size="sm" onClick={onReset}>
                Ha, tozalash
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                Bekor qilish
              </Button>
            </>
          ) : (
            <Button
              variant="danger"
              size="sm"
              disabled={readCount === 0}
              onClick={() => setConfirming(true)}
            >
              Barchasini tozalash
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
