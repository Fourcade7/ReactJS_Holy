import { Button, Card, SectionTitle, cn } from '../../components/Ui.jsx'
import {
  DEFAULT_SCALE,
  MAX_SCALE,
  MIN_SCALE,
  STEP,
  useTextScale,
} from '../../lib/display.js'

const SAMPLE_ARABIC = 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ'
const SAMPLE_UZ = 'Hamd olamlarning Robbi — Allohgadir.'

function ScaleControl({ title, hint, value, onChange, children }) {
  const percent = Math.round(value * 100)

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionTitle>{title}</SectionTitle>
          <p className="text-ink-faint mt-1 text-[13px]">{hint}</p>
        </div>
        <span
          className={cn(
            'rounded-full px-3 py-1 text-sm font-bold',
            value === DEFAULT_SCALE
              ? 'bg-surface-2 text-ink-soft'
              : 'bg-accent/12 text-accent',
          )}
        >
          {percent}%
        </span>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Button
          size="icon"
          onClick={() => onChange(value - STEP)}
          disabled={value <= MIN_SCALE}
          aria-label="Kichraytirish"
        >
          <span className="text-lg leading-none">−</span>
        </Button>

        <input
          type="range"
          min={MIN_SCALE}
          max={MAX_SCALE}
          step={STEP}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="accent-accent h-1.5 flex-1 cursor-pointer"
          aria-label={title}
        />

        <Button
          size="icon"
          onClick={() => onChange(value + STEP)}
          disabled={value >= MAX_SCALE}
          aria-label="Kattalashtirish"
        >
          <span className="text-lg leading-none">+</span>
        </Button>
      </div>

      <div className="bg-surface-2 mt-5 rounded-xl px-5 py-4">{children}</div>
    </Card>
  )
}

export default function TextSettings() {
  const [arabicScale, setArabicScale] = useTextScale('arabic')
  const [uzScale, setUzScale] = useTextScale('uz')
  const isDefault = arabicScale === DEFAULT_SCALE && uzScale === DEFAULT_SCALE

  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button
          onClick={() => {
            setArabicScale(DEFAULT_SCALE)
            setUzScale(DEFAULT_SCALE)
          }}
          disabled={isDefault}
        >
          Standart holatga qaytarish
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ScaleControl
          title="Arabcha matn"
          hint="Oyatlar va mushaf sahifasidagi arabcha yozuv"
          value={arabicScale}
          onChange={setArabicScale}
        >
          <p className="arabic txt-arabic text-ink">{SAMPLE_ARABIC}</p>
        </ScaleControl>

        <ScaleControl
          title="Oʻzbekcha tarjima"
          hint="Tarjima, transkripsiya va tafsir matnlari"
          value={uzScale}
          onChange={setUzScale}
        >
          <p className="txt-uz text-ink-soft">{SAMPLE_UZ}</p>
          <p className="txt-uz-sub text-ink-faint mt-2 italic">
            Alhamdu lillahi Rabbil-ʿalamin
          </p>
        </ScaleControl>
      </div>

      <p className="text-ink-faint mt-6 text-[13px] leading-relaxed">
        Eslatma: arabcha matn kattalashtirilganda oʻqish ustuni ham kengayadi, shuning
        uchun mushaf satrlari chetga chiqib ketmaydi. Ekran kengligi yetmay qolganda matn
        oʻsishdan toʻxtaydi.
      </p>
    </>
  )
}
