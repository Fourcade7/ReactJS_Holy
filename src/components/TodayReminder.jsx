import { useNavigate } from 'react-router-dom'
import { pickSessionReminder, reminderTypeLabel } from '../lib/reminders.js'
import MushafAyah from './MushafAyah.jsx'
import { Badge, Button, Card, cn } from './Ui.jsx'

const ARABIC_LETTER = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g
const LATIN_LETTER = /[A-Za-z]/g
/* Mushaf glifi o'zi baland — eslatmada satrlar bir-biridan uzoqlashib ketmasligi uchun */
const REMINDER_VERSE_LINE_HEIGHT = 1.8

/* Arabcha harflari ko'p satr arabcha shriftda, o'ngdan chapga chiqadi */
function isArabicLine(line) {
  return (line.match(ARABIC_LETTER)?.length ?? 0) > (line.match(LATIN_LETTER)?.length ?? 0)
}

/**
 * Eslatma matni: har bir satr alohida — arabcha oyat va tarjimasi aralash bo'lishi mumkin.
 * `verses` berilsa ({ surah, ayah, page }), oyatlar sahifalardagi mushaf shriftida chiqadi.
 */
export function ReminderText({ text, verses = [], compact = false, className }) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  return (
    <div className={cn(compact ? 'space-y-1.5' : 'space-y-3', className)}>
      {verses.map((verse) => (
        <MushafAyah
          key={`${verse.surah}:${verse.ayah}`}
          surahNumber={verse.surah}
          ayahNumber={verse.ayah}
          pageNumber={verse.page}
          lineHeight={REMINDER_VERSE_LINE_HEIGHT}
        />
      ))}
      {lines.map((line, index) =>
        isArabicLine(line) ? (
          <p key={index} className={cn('arabic text-ink', compact ? 'text-2xl' : 'txt-arabic')}>
            {line}
          </p>
        ) : (
          <p
            key={index}
            className={compact ? 'text-ink-soft text-sm leading-relaxed' : 'txt-uz text-ink-soft'}
          >
            {line}
          </p>
        ),
      )}
    </div>
  )
}

export default function TodayReminder({ reminders, className }) {
  const navigate = useNavigate()
  const reminder = pickSessionReminder(reminders)

  if (!reminder) {
    return (
      <Card
        className={cn(
          'animate-fade flex flex-wrap items-center justify-between gap-3 px-4 py-3',
          className,
        )}
      >
        <p className="text-ink-faint text-[13px]">
          Hali eslatma yoʻq — oʻzingiz tanlagan oyat yoki hikmatni qoʻshing, dastur har
          ochilganda ulardan biri shu yerda chiqadi.
        </p>
        <Button variant="primary" size="sm" onClick={() => navigate('/settings?tab=reminders')}>
          Eslatma qoʻshish
        </Button>
      </Card>
    )
  }

  return (
    <Card className={cn('animate-fade px-4 py-3.5 sm:px-5', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={reminder.type === 'ayah' ? 'accent' : 'neutral'}>
          {reminderTypeLabel(reminder.type)}
        </Badge>
        {reminders.length > 1 ? (
          <span className="text-ink-faint text-xs">{reminders.length} ta eslatmadan biri</span>
        ) : null}
      </div>
      {reminder.title ? (
        <h2 className="font-display text-ink mt-2 text-xl tracking-tight">{reminder.title}</h2>
      ) : null}
      <ReminderText text={reminder.text} verses={reminder.verses} className="mt-2" />
    </Card>
  )
}
