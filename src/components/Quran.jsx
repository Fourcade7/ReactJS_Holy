import { createContext, useContext, useEffect, useId, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toArabicNumber } from '../lib/reading.js'
import { useReminders } from '../lib/reminders.js'
import { useAyahTafsir } from '../lib/tafsir.js'
import AyahPanel from './AyahPanel.jsx'
import MushafAyah from './MushafAyah.jsx'
import { Badge, cn } from './Ui.jsx'

/* Arabcha va o'zbekcha matnda bir xil oyat birga yoritilishi uchun */
const HoverContext = createContext(null)

export function AyahHoverScope({ children }) {
  const [hovered, setHovered] = useState(null)
  const value = useMemo(() => ({ hovered, setHovered }), [hovered])
  return <HoverContext.Provider value={value}>{children}</HoverContext.Provider>
}

export function useAyahHoverByKey(key) {
  const context = useContext(HoverContext)
  return {
    active: context?.hovered === key,
    onMouseEnter: () => context?.setHovered(key),
    onMouseLeave: () => context?.setHovered(null),
  }
}

/** Arabcha va tarjima bir xil kalit ishlatishi uchun: "2:255" */
export function verseKeyOf(ayah, surahNumber) {
  return `${ayah.surah?.number ?? surahNumber ?? '?'}:${ayah.numberInSurah}`
}

export function AyahMarker({ number }) {
  return (
    <span className="border-accent/50 text-accent mx-1 inline-flex h-7 w-7 items-center justify-center rounded-full border align-middle font-sans text-[11px] leading-none">
      {toArabicNumber(number)}
    </span>
  )
}

function HoverSpan({ hoverKey, className, children, ...rest }) {
  const { active, onMouseEnter, onMouseLeave } = useAyahHoverByKey(hoverKey)

  return (
    <span
      {...rest}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'box-decoration-clone rounded-md transition-colors duration-150',
        active ? 'bg-surface-2' : 'bg-transparent',
        className,
      )}
    >
      {children}
    </span>
  )
}

/* Har bir so'z alohida: sichqoncha ustida turgan so'z dastur rangiga o'tadi */
function HoverWords({ text }) {
  return text.split(/(\s+)/).map((part, index) =>
    index % 2 === 1 || !part ? (
      part
    ) : (
      <span key={index} className="hover:text-accent transition-colors duration-150">
        {part}
      </span>
    ),
  )
}

/* Quron beti kabi uzluksiz arabcha matn (mushaf tartibi yo'q bo'lsa ishlatiladi) */
export function MushafText({ ayahs, surahNumber, className }) {
  return (
    <p className={cn('mushaf txt-arabic-flow text-ink', className)}>
      {ayahs.map((ayah) => (
        <HoverSpan
          key={ayah.id}
          hoverKey={verseKeyOf(ayah, surahNumber)}
          className="px-1.5 py-1"
        >
          <HoverWords text={ayah.textArabic} /> <AyahMarker number={ayah.numberInSurah} />{' '}
        </HoverSpan>
      ))}
    </p>
  )
}

/* Bosiladigan oyat tarjimasi — ostidagi panelni ochadi */
const AYAH_TRIGGER =
  'cursor-pointer focus-visible:outline-accent focus-visible:outline-2 focus-visible:outline-offset-2'

/**
 * Oyat tarjimasi bosilganda ostidagi panel (eslatma, tafsir) ochiladi/yopiladi — klaviaturadan ham.
 * Matn sichqoncha bilan belgilanayotgan bo'lsa (nusxa olish uchun) panelga tegilmaydi.
 */
function useAyahPanel() {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  function toggle() {
    setOpen((value) => !value)
  }

  return {
    open,
    panelId,
    toggle,
    triggerProps: {
      role: 'button',
      tabIndex: 0,
      'aria-expanded': open,
      'aria-controls': panelId,
      onClick: () => {
        if (!window.getSelection()?.toString()) toggle()
      },
      onKeyDown: (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        toggle()
      },
    },
  }
}

/* Eslatmalarga saqlangan oyat ("2:255") — tarjimasi dastur rangida turadi */
function useAyahSaved(surahNumber, ayahNumber) {
  const source = `${surahNumber}:${ayahNumber}`
  return useReminders().some((item) => item.source === source)
}

/**
 * Sahifa tarjimasi: raqamlar matn ichida qalin holda. Dastur rangida: tafsiri bor oyatning
 * raqami, eslatmalarga saqlangan oyatning matni. Oyat bosilsa, panel shu oyatdan keyin ochiladi.
 */
export function TranslationFlow({ ayahs, surahNumber, className }) {
  return (
    <div className={cn('txt-uz text-ink-soft leading-[2]', className)}>
      {ayahs.map((ayah) => (
        <FlowAyah
          key={ayah.id}
          ayah={ayah}
          surahNumber={ayah.surah?.number ?? surahNumber ?? ayah.surahId}
        />
      ))}
    </div>
  )
}

function FlowAyah({ ayah, surahNumber }) {
  const { open, panelId, triggerProps } = useAyahPanel()
  const tafsir = useAyahTafsir(surahNumber, ayah.numberInSurah)
  const saved = useAyahSaved(surahNumber, ayah.numberInSurah)
  const hasText = Boolean(ayah.translationUz)

  return (
    <>
      <HoverSpan
        hoverKey={verseKeyOf(ayah, surahNumber)}
        className={cn(
          'hover:text-accent px-1.5 py-0.5',
          hasText && AYAH_TRIGGER,
          saved && 'text-accent',
        )}
        {...(hasText ? triggerProps : {})}
      >
        <b className={tafsir ? 'text-accent' : 'text-ink'} title={tafsir ? 'Tafsiri bor' : undefined}>
          {ayah.numberInSurah}.
        </b>
        {tafsir ? <span className="sr-only">(tafsiri bor)</span> : null}
        {saved ? <span className="sr-only">(eslatmalarda saqlangan)</span> : null}{' '}
        {ayah.translationUz || (
          <span className="text-ink-faint italic">tarjima kiritilmagan</span>
        )}{' '}
      </HoverSpan>
      {hasText ? (
        <AyahPanel
          id={panelId}
          open={open}
          surahNumber={surahNumber}
          ayahNumber={ayah.numberInSurah}
          text={ayah.translationUz}
          tafsir={tafsir}
          className="pt-1 pb-3"
        />
      ) : null}
    </>
  )
}

export function AyahRow({ ayah, textMode = 'both', surahLink = false }) {
  const showArabic = textMode !== 'translation'
  const showTranslation = textMode !== 'arabic'
  const surahNumber = ayah.surah?.number ?? ayah.surahId
  const { open, panelId, toggle, triggerProps } = useAyahPanel()
  /* faqat arabcha ko'rsatilganda tafsir yuklanmaydi */
  const tafsir = useAyahTafsir(showTranslation ? surahNumber : null, ayah.numberInSurah)
  const saved = useAyahSaved(surahNumber, ayah.numberInSurah)

  return (
    <article
      id={`ayah-${ayah.numberInSurah}`}
      className="hover:bg-surface-2/50 scroll-mt-24 px-5 py-7 transition-colors sm:px-7"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="bg-surface-2 text-ink-soft flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-[11px] font-bold">
          {surahLink ? `${ayah.surah.number}:${ayah.numberInSurah}` : ayah.numberInSurah}
        </span>
        {surahLink ? (
          <Link to={`/surah/${ayah.surah.number}`}>
            <Badge className="hover:bg-line transition-colors">{ayah.surah.nameUz}</Badge>
          </Link>
        ) : null}
        {ayah.pageNumber && !surahLink ? (
          <Link to={`/page/${ayah.pageNumber}`}>
            <Badge className="hover:bg-line transition-colors">
              {ayah.pageNumber}-sahifa
            </Badge>
          </Link>
        ) : null}
        {ayah.juz ? <Badge>{ayah.juz}-juz</Badge> : null}
        {/* tafsiri bor oyat belgisi — bosilsa, tarjimani bosgandek panel ochiladi */}
        {tafsir ? (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls={panelId}
            className={cn('rounded-md', AYAH_TRIGGER)}
          >
            <Badge tone="accent" className="hover:bg-accent/20 transition-colors">
              Tafsir
            </Badge>
          </button>
        ) : null}
      </div>

      {showArabic ? (
        <MushafAyah
          surahNumber={surahNumber}
          ayahNumber={ayah.numberInSurah}
          pageNumber={ayah.pageNumber}
          fitToPage
          fallback={
            <p className="arabic txt-arabic text-ink">
              <HoverWords text={ayah.textArabic} />
            </p>
          }
        />
      ) : null}

      {showTranslation && ayah.transcription ? (
        <p className="txt-uz-sub text-ink-faint mt-4 italic">{ayah.transcription}</p>
      ) : null}

      {showTranslation ? (
        ayah.translationUz ? (
          <p
            {...triggerProps}
            className={cn(
              'txt-uz hover:text-accent mt-4 rounded-md transition-colors duration-150',
              /* eslatmalarga saqlangan oyat matni dastur rangida */
              saved ? 'text-accent' : 'text-ink-soft',
              AYAH_TRIGGER,
            )}
          >
            {saved ? <span className="sr-only">(eslatmalarda saqlangan)</span> : null}
            {ayah.translationUz}
          </p>
        ) : (
          <p className="txt-uz-sub text-ink-faint mt-4 italic">
            Tarjima hali kiritilmagan
          </p>
        )
      ) : null}

      {showTranslation && ayah.translationUz ? (
        <AyahPanel
          id={panelId}
          open={open}
          surahNumber={surahNumber}
          ayahNumber={ayah.numberInSurah}
          text={ayah.translationUz}
          tafsir={tafsir}
          className="pt-4"
        />
      ) : null}
    </article>
  )
}

function PagerButton({ action, children }) {
  const className =
    'border-line bg-surface text-ink-soft hover:border-accent/50 hover:text-ink inline-flex cursor-pointer items-center gap-2 rounded-md border px-3.5 py-1.5 text-[13px] font-semibold transition-colors disabled:pointer-events-none disabled:opacity-40'

  if (!action) return <span className="w-[130px]" />
  if (action.to) {
    return (
      <Link to={action.to} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" onClick={action.onClick} className={className}>
      {children}
    </button>
  )
}

/* Matn yozilayotgan joyda strelkalar o'z vazifasini bajarsin */
function isTypingTarget(target) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || Boolean(target.closest('input, textarea, select')))
  )
}

/**
 * O'qish rejimiga mos «oldingi / keyingi» navigatsiyasi.
 * `keyboard` berilsa (sahifa rejimi), ← oldingi, → keyingi tugmani bosadi — xuddi ekrandagidek.
 */
export function ReaderPager({ prev, next, label, keyboard = false }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!keyboard) return
    function onKeyDown(event) {
      if (event.repeat || event.defaultPrevented) return
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (isTypingTarget(event.target)) return
      const action = event.key === 'ArrowLeft' ? prev : event.key === 'ArrowRight' ? next : null
      if (!action) return
      event.preventDefault()
      if (action.onClick) action.onClick()
      else if (action.to) navigate(action.to)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [keyboard, prev, next, navigate])

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <PagerButton action={prev}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        {prev?.label}
      </PagerButton>

      {label ? (
        <span className="text-ink-faint min-w-[120px] text-center text-[13px] font-semibold">
          {label}
        </span>
      ) : null}

      <PagerButton action={next}>
        {next?.label}
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </PagerButton>
    </div>
  )
}

/* Sahifa ajratgichi — ekrandagi «3» raqami kabi */
export function PageDivider({ number, to }) {
  const content = (
    <span className="text-ink-faint hover:text-accent bg-bg px-4 text-[13px] font-semibold transition-colors">
      {number ? `${number}-sahifa` : 'sahifasiz'}
    </span>
  )

  return (
    <div className="relative my-2 flex items-center justify-center py-3">
      <span className="bg-line absolute inset-x-6 h-px" />
      <span className="relative">{to && number ? <Link to={to}>{content}</Link> : content}</span>
    </div>
  )
}
