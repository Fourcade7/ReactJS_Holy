import { Badge, Button, Card, Segmented, SectionTitle, cn } from '../../components/Ui.jsx'
import {
  ACCENTS,
  CARD_STYLES,
  DEFAULTS,
  PATTERN_GROUPS,
  PATTERNS,
  RADII,
  SIZES,
  STRENGTHS,
  THEMES,
  accentColor,
  colorVars,
  findPattern,
  glowCss,
  isDefaultAppearance,
  patternVars,
  toStyle,
  useAppearance,
} from '../../lib/appearance.js'
import { useColorMode, useIsDark } from '../../lib/colorMode.js'

const ICON = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-[18px] w-[18px]',
}

const MODES = [
  {
    value: 'light',
    title: 'Yorugʻ',
    hint: 'Och fon, toʻq matn',
    icon: (
      <svg {...ICON}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    ),
  },
  {
    value: 'dark',
    title: 'Qorongʻi',
    hint: 'Koʻzni kamroq charchatadi',
    icon: (
      <svg {...ICON}>
        <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
      </svg>
    ),
  },
  {
    value: 'system',
    title: 'Tizim',
    hint: 'Kompyuter sozlamasiga qarab',
    icon: (
      <svg {...ICON}>
        <rect x="2" y="4" width="20" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
]

function CheckMark({ className }) {
  return (
    <span
      className={cn(
        'bg-accent flex h-5 w-5 items-center justify-center rounded-full text-white shadow-sm',
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  )
}

/* Tanlanadigan katak — tanlangani asosiy rangli chegara va burchakdagi belgi bilan */
function Option({ selected, onClick, className, children, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={label}
      className={cn(
        'relative cursor-pointer rounded-md border text-left transition-colors',
        selected
          ? 'border-accent bg-accent/8 ring-accent/25 ring-2'
          : 'border-line hover:border-accent/50',
        className,
      )}
    >
      {children}
      {selected ? <CheckMark className="absolute -top-2 -right-2" /> : null}
    </button>
  )
}

function Section({ title, hint, aside, children }) {
  return (
    <Card className="p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionTitle>{title}</SectionTitle>
          <p className="text-ink-faint mt-1 text-[13px]">{hint}</p>
        </div>
        {aside}
      </div>
      {children}
    </Card>
  )
}

/* Mavzuning kichik namunasi: yon panel, sarlavha, ikki kartochka va tugma — o'z ranglarida */
function ThemePreview({ vars }) {
  return (
    <div style={vars} className="bg-bg border-line overflow-hidden rounded-md border">
      <div className="flex h-[76px]">
        <div className="border-line flex w-6 flex-col items-center gap-1.5 border-r pt-2.5">
          <span className="bg-accent h-1.5 w-3 rounded-full" />
          <span className="bg-ink-faint/40 h-1 w-3 rounded-full" />
          <span className="bg-ink-faint/40 h-1 w-3 rounded-full" />
        </div>
        <div className="flex-1 space-y-1.5 p-2">
          <span className="bg-ink block h-1.5 w-12 rounded-full" />
          <div className="grid grid-cols-2 gap-1.5">
            <span className="bg-surface border-line flex h-7 flex-col justify-center gap-1 rounded-sm border px-1.5">
              <span className="bg-ink-soft/60 block h-1 w-full rounded-full" />
              <span className="bg-ink-faint/50 block h-1 w-2/3 rounded-full" />
            </span>
            <span className="bg-surface border-line flex h-7 flex-col justify-center gap-1 rounded-sm border px-1.5">
              <span className="bg-ink-soft/60 block h-1 w-full rounded-full" />
              <span className="bg-ink-faint/50 block h-1 w-1/2 rounded-full" />
            </span>
          </div>
          <span className="bg-accent block h-2 w-9 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/* Orqa fon namunasi — joriy mavzu ranglarida, tanlangan kuch, o'lcham va rangda */
function BackgroundPreview({ css, appearance }) {
  return (
    <div className="bg-bg border-line relative h-16 overflow-hidden rounded-md border">
      {appearance.glow ? (
        <span className="absolute inset-0" style={toStyle(glowCss(appearance.strength))} />
      ) : null}
      <span className="absolute inset-0" style={toStyle({ ...patternVars(appearance), ...css })} />
    </div>
  )
}

/* Kartochka uslubi namunasi: naqshli fon ustida bitta kartochka */
function CardPreview({ style, appearance }) {
  return (
    <div className="bg-bg border-line relative h-20 overflow-hidden rounded-md border p-3">
      <span
        className="absolute inset-0"
        style={toStyle({ ...patternVars(appearance), ...findPattern('lines').css })}
      />
      <span
        className="relative flex h-full flex-col justify-center gap-1.5 rounded-md border px-3"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-line)',
          ...toStyle(style),
        }}
      >
        <span className="bg-ink-soft/60 block h-1.5 w-3/4 rounded-full" />
        <span className="bg-ink-faint/50 block h-1.5 w-1/2 rounded-full" />
      </span>
    </div>
  )
}

/* Nomli boshqaruv: «Kuchi: [Past | O'rta | Kuchli]» */
function Control({ label, children }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="text-ink-faint text-xs font-semibold">{label}</span>
      {children}
    </span>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="text-ink-soft hover:text-ink inline-flex cursor-pointer items-center gap-2.5 text-[13px] font-semibold"
    >
      <span
        className={cn(
          'relative h-5 w-9 rounded-full transition-colors',
          checked ? 'bg-accent' : 'bg-surface-2 border-line border',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
            checked ? 'left-[18px]' : 'left-0.5',
          )}
        />
      </span>
      {label}
    </button>
  )
}

export default function ThemeSettings() {
  const [appearance, update] = useAppearance()
  const [mode, setMode] = useColorMode()
  const dark = useIsDark()
  const activeTheme = THEMES.find((item) => item.id === appearance.theme) ?? THEMES[0]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-ink-faint flex items-center gap-2 text-[13px]">
          <Badge tone="accent">Sinov</Badge>
          Oʻzgarishlar darhol butun saytga qoʻllanadi va shu brauzerda saqlanadi.
        </p>
        <Button onClick={() => update(DEFAULTS)} disabled={isDefaultAppearance(appearance)}>
          Standart holatga qaytarish
        </Button>
      </div>

      <Section title="Rejim" hint="Tepadagi oy / quyosh tugmasi bilan ham almashtiriladi">
        <div className="grid gap-3 sm:grid-cols-3">
          {MODES.map((item) => (
            <Option
              key={item.value}
              selected={mode === item.value}
              onClick={() => setMode(item.value)}
              className="flex items-center gap-3 p-3.5"
            >
              <span
                className={cn(
                  'flex h-9 w-9 flex-none items-center justify-center rounded-full',
                  mode === item.value ? 'bg-accent text-white' : 'bg-surface-2 text-ink-soft',
                )}
              >
                {item.icon}
              </span>
              <span>
                <span className="text-ink block text-sm font-semibold">{item.title}</span>
                <span className="text-ink-faint block text-xs">{item.hint}</span>
              </span>
            </Option>
          ))}
        </div>
      </Section>

      <Section
        title="Mavzu"
        hint="Fon, kartochkalar, matn va asosiy rang — butun sayt ranglari"
        aside={<span className="text-accent text-[13px] font-semibold">{activeTheme.name}</span>}
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {THEMES.map((theme) => (
            <Option
              key={theme.id}
              selected={appearance.theme === theme.id}
              onClick={() => update({ theme: theme.id })}
              className="p-2"
            >
              <ThemePreview vars={colorVars({ ...appearance, theme: theme.id }, dark)} />
              <span className="mt-2 flex items-center justify-between gap-2 px-0.5">
                <span className="min-w-0">
                  <span className="text-ink block truncate text-[13px] font-semibold">{theme.name}</span>
                  <span className="text-ink-faint block truncate text-[11px]">{theme.hint}</span>
                </span>
                {/* Yorug' va qorong'i variantlari */}
                <span className="flex flex-none -space-x-1">
                  <span
                    className="border-surface h-3.5 w-3.5 rounded-full border-2"
                    style={{ backgroundColor: theme.light.bg }}
                    title="Yorugʻ"
                  />
                  <span
                    className="border-surface h-3.5 w-3.5 rounded-full border-2"
                    style={{ backgroundColor: theme.dark.bg }}
                    title="Qorongʻi"
                  />
                </span>
              </span>
            </Option>
          ))}
        </div>
      </Section>

      <Section
        title="Asosiy rang"
        hint="Tugmalar, havolalar, belgilar va faol boʻlim rangi — mavzudagidan boshqasini tanlash mumkin"
        aside={
          <span className="text-accent text-[13px] font-semibold">
            {ACCENTS.find((item) => item.id === appearance.accent)?.name}
          </span>
        }
      >
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {ACCENTS.map((accent) => {
            const selected = appearance.accent === accent.id
            return (
              <button
                key={accent.id}
                type="button"
                onClick={() => update({ accent: accent.id })}
                aria-pressed={selected}
                className={cn(
                  'flex cursor-pointer flex-col items-center gap-1.5 rounded-md border px-1 py-2.5 transition-colors',
                  selected ? 'border-accent bg-accent/8' : 'hover:bg-surface-2 border-transparent',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-white',
                    accent.id === 'theme' && 'ring-line ring-2 ring-offset-2 ring-offset-[var(--color-surface)]',
                  )}
                  style={{ backgroundColor: accentColor(appearance, accent.id, dark) }}
                >
                  {selected ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  ) : null}
                </span>
                <span
                  className={cn(
                    'text-[11px] font-medium',
                    selected ? 'text-accent' : 'text-ink-soft',
                  )}
                >
                  {accent.name}
                </span>
              </button>
            )
          })}
        </div>
      </Section>

      <Section
        title="Orqa fon"
        hint={`Sahifa ortidagi naqsh — ${PATTERNS.length - 1} xil, rangi mavzuga moslashadi`}
        aside={
          <span className="text-accent text-[13px] font-semibold">
            {findPattern(appearance.pattern).name}
          </span>
        }
      >
        <div className="border-line mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-b pb-5">
          <Control label="Kuchi">
            <Segmented
              options={STRENGTHS}
              value={appearance.strength}
              onChange={(strength) => update({ strength })}
            />
          </Control>
          <Control label="Oʻlchami">
            <Segmented options={SIZES} value={appearance.size} onChange={(size) => update({ size })} />
          </Control>
          <Toggle
            checked={appearance.tint}
            onChange={(tint) => update({ tint })}
            label="Asosiy rangda"
          />
          <Toggle
            checked={appearance.glow}
            onChange={(glow) => update({ glow })}
            label="Rangli yogʻdu"
          />
        </div>

        <div className="space-y-6">
          {PATTERN_GROUPS.map((group) => {
            const patterns = PATTERNS.filter((pattern) => pattern.group === group.id)
            return (
              <div key={group.id}>
                <p className="text-ink-faint mb-3 text-[11px] font-bold tracking-[0.12em] uppercase">
                  {group.title} · {patterns.length}
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6 min-[90rem]:grid-cols-8">
                  {patterns.map((pattern) => (
                    <Option
                      key={pattern.id}
                      selected={appearance.pattern === pattern.id}
                      onClick={() => update({ pattern: pattern.id })}
                      className="p-2"
                    >
                      <BackgroundPreview css={pattern.css} appearance={appearance} />
                      <span className="text-ink mt-2 block truncate px-0.5 text-[13px] font-semibold">
                        {pattern.name}
                      </span>
                    </Option>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section
        title="Kartochkalar"
        hint="Suralar, sahifalar, hadislar va sozlamalardagi bloklar koʻrinishi"
        aside={
          <Segmented
            options={RADII}
            value={appearance.radius}
            onChange={(radius) => update({ radius })}
          />
        }
      >
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CARD_STYLES.map((cardStyle) => (
            <Option
              key={cardStyle.id}
              selected={appearance.cards === cardStyle.id}
              onClick={() => update({ cards: cardStyle.id })}
              className="p-2"
            >
              <CardPreview
                style={dark ? cardStyle.dark : cardStyle.light}
                appearance={appearance}
              />
              <span className="mt-2 block px-0.5">
                <span className="text-ink block text-[13px] font-semibold">{cardStyle.name}</span>
                <span className="text-ink-faint block text-[11px]">{cardStyle.hint}</span>
              </span>
            </Option>
          ))}
        </div>
        <p className="text-ink-faint mt-4 text-xs">
          Oʻngdagi tanlov — burchaklar: tugmalar, kartochkalar va maydonlar hammasi birga oʻzgaradi.
        </p>
      </Section>
    </div>
  )
}
