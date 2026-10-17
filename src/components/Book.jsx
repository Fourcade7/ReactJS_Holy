import { Link } from 'react-router-dom'
import { toggleBookItemRead } from '../lib/bookMarks.js'
import { itemLabel, itemPath } from '../lib/books.js'
import { formatReadAt } from '../lib/xatm.js'
import { ToggleButton } from './HadithReadToggle.jsx'
import TanwirText from './TanwirText.jsx'
import { Card, cn } from './Ui.jsx'

/* Hadis kitoblari sahifasi bilan bir xil to'r va «orqaga» havolasi */
export const BOOK_GRID = 'grid grid-cols-1 gap-3 sm:grid-cols-2 min-[75rem]:grid-cols-3'
export const BACK_LINK =
  'text-ink-faint hover:text-ink mb-4 inline-block text-sm font-semibold transition-colors'

/** O'qish sahifalari tepasidagi «‹ Kitob nomi» havolasi — hadis sahifasidagi kabi */
export function ReaderBackLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-ink-faint hover:text-accent mb-5 inline-flex min-w-0 items-center gap-1.5 text-[13px] font-semibold transition-colors"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 flex-none"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span className="truncate">{children}</span>
    </Link>
  )
}

/**
 * Matndagi «250-hikmatga qarang», «(99, 176–178-hikmatlar)», «30 va 31-hikmatlar» kabi
 * havolalarning har bir raqami o'sha bo'lakni ochadi. Raqam kitobda bo'lmasa — oddiy matn.
 */
export function LinkedText({ text, book }) {
  if (book.id === 'tanwir') {
    return <TanwirText text={text}>{(piece) => <ItemLinks text={piece} book={book} />}</TanwirText>
  }
  return <ItemLinks text={text} book={book} />
}

function ItemLinks({ text, book }) {
  const pattern = new RegExp(
    `\\d+(?:–\\d+)?(?:(?:,\\s*|\\s+va\\s+)\\d+(?:–\\d+)?)*(?=-${book.itemName})`,
    'g',
  )
  const parts = []
  let last = 0
  for (const match of text.matchAll(pattern)) {
    parts.push(text.slice(last, match.index))
    match[0].split(/(\d+)/).forEach((piece, index) => {
      const number = Number(piece)
      parts.push(
        index % 2 === 1 && number >= 1 && number <= book.totalItems ? (
          <Link
            key={`${match.index}:${index}`}
            to={itemPath(book.id, number)}
            className="text-accent font-semibold hover:underline"
          >
            {piece}
          </Link>
        ) : (
          piece
        ),
      )
    })
    last = match.index + match[0].length
  }
  parts.push(text.slice(last))
  return parts
}

/** Ro'yxat bandi: matn yoki { text, items } — ichki ro'yxati bor band */
function ListItem({ item, book }) {
  if (typeof item === 'string') {
    return (
      <li className="pl-1 whitespace-pre-line">
        <LinkedText text={item} book={book} />
      </li>
    )
  }
  return (
    <li className="pl-1">
      <LinkedText text={item.text} book={book} />
      <ul className="mt-1 list-[circle] space-y-1 pl-6">
        {item.items.map((text) => (
          <li key={text} className="pl-1">
            <LinkedText text={text} book={book} />
          </li>
        ))}
      </ul>
    </li>
  )
}

function Block({ block, book, Heading }) {
  switch (block.type) {
    case 'section':
      return (
        <h2 className="border-line text-accent mt-8 border-t pt-6 text-xs font-bold tracking-[0.12em] uppercase first:mt-0 first:border-t-0 first:pt-0">
          {block.text}
        </h2>
      )
    case 'h':
      return <Heading className="text-ink txt-uz-heading pt-3 font-bold tracking-tight">{block.text}</Heading>
    case 'quote':
      /* Sheʼr: har qator — alohida misra; sigʻmagan misraning davomi ichkariroqdan boshlanadi */
      return (
        <blockquote className="border-accent/60 txt-uz text-ink border-l-2 pl-4">
          {block.text.split('\n').map((line, index) => (
            <span key={index} className="block pl-5 -indent-5">
              <LinkedText text={line} book={book} />
            </span>
          ))}
        </blockquote>
      )
    case 'list': {
      const List = block.ordered ? 'ol' : 'ul'
      return (
        <List
          start={block.start}
          className={cn(
            'txt-uz text-ink-soft marker:text-ink-faint space-y-1 pl-6',
            block.ordered ? 'list-decimal' : 'list-disc',
          )}
        >
          {block.items.map((item, index) => (
            <ListItem key={index} item={item} book={book} />
          ))}
        </List>
      )
    }
    case 'terms':
      return (
        <Card className="overflow-hidden">
          <dl className="divide-line divide-y">
            {block.items.map(({ term, text }) => (
              <div key={term} className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4 sm:px-5">
                <dt className="text-ink font-bold">{term}</dt>
                <dd className="txt-uz-sub text-ink-soft">
                  <LinkedText text={text} book={book} />
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      )
    default:
      return (
        <p className="txt-uz text-ink-soft whitespace-pre-line">
          <LinkedText text={block.text} book={book} />
        </p>
      )
  }
}

/**
 * Kitob matni (Muqaddima, Atamalar lug'ati, bob): bloklar ketma-ketligi.
 * { type: "section" | "h" | "p" | "quote", text } — section: «Qisqacha mazmun», «Sharh» kabi asosiy qism;
 * { type: "list", ordered?, start?, items } — band matn yoki { text, items }; { type: "terms", items: [{ term, text }] }.
 * Matndagi "\n" — paragraf ichidagi yangi qator (PDF'dagi kabi), quote'da — sheʼr misrasi.
 */
export function BookBlocks({ blocks, book }) {
  /* Asosiy qismlar bo'lsa, ichidagi sarlavhalar bir daraja pastda */
  const Heading = blocks.some((block) => block.type === 'section') ? 'h3' : 'h2'
  return (
    <div className="space-y-4">
      {blocks.map((block, index) => (
        <Block key={index} block={block} book={book} Heading={Heading} />
      ))}
    </div>
  )
}

/** Bitta bo'lakni (hikmatni) o'qildi deb belgilash — hadislardagi doiracha */
export function BookItemReadToggle({ book, number, readAt, className }) {
  const done = Boolean(readAt)
  const label = itemLabel(book, number)

  return (
    <ToggleButton
      done={done}
      onToggle={() => toggleBookItemRead(book.id, number)}
      title={done ? `Oʻqildi · ${formatReadAt(readAt)} — belgini olib tashlash` : 'Oʻqildi deb belgilash'}
      label={done ? `${label} belgisini olib tashlash` : `${label}ni oʻqildi deb belgilash`}
      className={className}
    />
  )
}
