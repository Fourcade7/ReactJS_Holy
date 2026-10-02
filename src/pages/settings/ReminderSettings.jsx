import { useState } from 'react'
import { ReminderText } from '../../components/TodayReminder.jsx'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  SectionTitle,
  Segmented,
  Textarea,
} from '../../components/Ui.jsx'
import {
  REMINDER_TYPES,
  addReminder,
  deleteReminder,
  reminderTypeLabel,
  useReminders,
} from '../../lib/reminders.js'
import { formatReadAt } from '../../lib/xatm.js'

function ReminderForm({ onDone }) {
  const [type, setType] = useState('ayah')
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const canSave = Boolean(title.trim() && text.trim())

  function onSubmit(event) {
    event.preventDefault()
    if (!canSave) return
    addReminder({ type, title, text })
    onDone()
  }

  return (
    <Card className="animate-fade p-6">
      <SectionTitle>Yangi eslatma</SectionTitle>

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <div className="flex flex-col gap-1.5">
          <span className="text-ink-soft text-[13px] font-semibold">Turi</span>
          <Segmented
            options={REMINDER_TYPES}
            value={type}
            onChange={setType}
            className="self-start"
          />
        </div>

        <Field label="Sarlavha">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={type === 'ayah' ? 'Masalan: Baqara surasi, 286-oyat' : 'Masalan: Sabr haqida'}
            autoFocus
          />
        </Field>

        <Field label="Matn" hint="Arabcha satrlar avtomatik ravishda arabcha shriftda koʻrsatiladi.">
          <Textarea
            rows={6}
            dir="auto"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Oyat yoki hikmat matnini shu yerga yozing yoki joylang"
          />
        </Field>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="primary" disabled={!canSave}>
            Saqlash
          </Button>
          <Button type="button" variant="ghost" onClick={onDone}>
            Bekor qilish
          </Button>
        </div>
      </form>
    </Card>
  )
}

function ReminderItem({ reminder }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge tone={reminder.type === 'ayah' ? 'accent' : 'neutral'}>
              {reminderTypeLabel(reminder.type)}
            </Badge>
            <span className="text-ink-faint text-xs tabular-nums">
              {formatReadAt(reminder.createdAt)}
            </span>
          </div>
          <p className="text-ink mt-2 font-bold">{reminder.title}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {confirming ? (
            <>
              <span className="text-ink text-[13px] font-semibold">Oʻchirilsinmi?</span>
              <Button variant="danger" size="sm" onClick={() => deleteReminder(reminder.id)}>
                Ha, oʻchirish
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                Bekor qilish
              </Button>
            </>
          ) : (
            <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
              Oʻchirish
            </Button>
          )}
        </div>
      </div>

      <ReminderText text={reminder.text} verses={reminder.verses} compact className="mt-3" />
    </Card>
  )
}

export default function ReminderSettings() {
  const reminders = useReminders()
  const [adding, setAdding] = useState(false)

  return (
    <div className="max-w-3xl space-y-5">
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <SectionTitle>
              Eslatmalar
              <Badge>{reminders.length}</Badge>
            </SectionTitle>
            <p className="text-ink-faint mt-1 text-[13px] leading-relaxed">
              Dastur har ochilganda ulardan biri bosh sahifadagi «Bugungi eslatma» tabida
              tasodifiy chiqadi. Eslatmalar shu qurilmada saqlanadi.
            </p>
          </div>
          {adding ? null : (
            <Button variant="primary" onClick={() => setAdding(true)}>
              + Eslatma qoʻshish
            </Button>
          )}
        </div>
      </Card>

      {adding ? <ReminderForm onDone={() => setAdding(false)} /> : null}

      {reminders.length === 0 && !adding ? (
        <EmptyState
          title="Hali eslatma yoʻq"
          hint="Yoqqan oyat yoki hikmatingizni nusxalab, «Eslatma qoʻshish» orqali saqlang."
        />
      ) : null}

      {reminders.map((reminder) => (
        <ReminderItem key={reminder.id} reminder={reminder} />
      ))}
    </div>
  )
}
