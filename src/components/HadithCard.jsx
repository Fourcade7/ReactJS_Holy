import { GRADES } from '../lib/hadith.js'
import { Badge, Card, Diamond, cn } from './Ui.jsx'

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

/**
 * Bitta hadis. mode — TEXT_MODES dagi qiymat: "both" | "arabic" | "translation".
 * "both" da keng ekranda arabcha (o'ngda) va o'zbekcha (chapda) yonma-yon, o'rtada ingichka chiziq;
 * tor ekranda arabcha tepada, o'zbekcha pastda, orasida gorizontal chiziq.
 */
export default function HadithCard({ hadith, mode }) {
  const showArabic = mode !== 'translation'
  const showUz = mode !== 'arabic'
  const parallel = showArabic && showUz

  return (
    <Card className="animate-rise p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <Diamond>{hadith.number}</Diamond>
        {/* Manbada bir nechta raqamga bo'lingan rivoyat bitta matn bo'lib keladi (Buxoriy 299–301) */}
        {hadith.numberTo != null ? (
          <span className="text-ink-faint text-[13px] font-semibold tabular-nums">
            {hadith.number}–{hadith.numberTo}
          </span>
        ) : null}
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          {showUz && hadith.translation === 'ai' ? (
            <Badge title="Tarjima sunʼiy intellekt yordamida qilingan va hali mutaxassis tomonidan tekshirilmagan">
              Sunʼiy intellekt tarjimasi
            </Badge>
          ) : null}
          {hadith.grade ? <Badge tone="accent">{GRADES[hadith.grade]}</Badge> : null}
        </div>
      </div>

      <div
        className={cn(
          'mt-5 grid gap-5',
          parallel && 'md:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] md:gap-x-7',
        )}
      >
        {showArabic ? (
          <p lang="ar" className="arabic-hadith txt-arabic text-ink md:order-3">
            <HoverWords text={hadith.textArabic} />
          </p>
        ) : null}

        {parallel ? <span className="bg-line h-px w-full md:order-2 md:h-auto md:w-px" /> : null}

        {showUz ? (
          <div className="md:order-1">
            {/* Ba'zi to'plamlarda isnod va manba keltirilmagan — bo'sh qatorlar chiqmaydi */}
            {hadith.narratorUz ? (
              <p className="text-ink-faint txt-uz-sub mb-2 font-medium">{hadith.narratorUz}</p>
            ) : null}
            {hadith.textUz ? (
              <p className="txt-uz text-ink-soft hover:text-accent transition-colors duration-150">
                {hadith.textUz}
              </p>
            ) : (
              <p className="txt-uz-sub text-ink-faint italic">Tarjima hali kiritilmagan</p>
            )}
            {hadith.sourceUz ? (
              <p className="text-ink-faint txt-uz-sub mt-3">{hadith.sourceUz}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </Card>
  )
}
