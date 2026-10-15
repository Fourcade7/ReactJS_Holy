import { TAFSIR_AUTHOR } from '../lib/tafsir.js'
import AyahReminderButton from './AyahReminderButton.jsx'
import { Collapse } from './Ui.jsx'

/**
 * Oyat tarjimasi bosilganda ostida ochiladigan panel: eslatmaga saqlash va (bo'lsa) tafsir.
 * `tafsir` — useAyahTafsir natijasi: oyat uni oldindan biladi va tafsirli ekanini belgilaydi.
 * `className` — Collapse ichidagi oraliq: u ham animatsiya bilan ochiladi.
 */
export default function AyahPanel({ id, open, surahNumber, ayahNumber, text, tafsir, className }) {
  return (
    <Collapse id={id} open={open}>
      <div className={className}>
        <div className="border-accent bg-surface-2 text-ink-soft txt-uz-sub rounded-r-md border-l-[3px] px-4 py-2.5">
          <AyahReminderButton surahNumber={surahNumber} ayahNumber={ayahNumber} text={text} />
          {tafsir ? (
            <div className="border-line mt-2.5 border-t pt-2.5">
              <p className="text-ink-faint mb-1 text-[11px] font-semibold">
                Tafsir · {TAFSIR_AUTHOR}
              </p>
              <p className="whitespace-pre-line">{tafsir}</p>
            </div>
          ) : null}
        </div>
      </div>
    </Collapse>
  )
}
