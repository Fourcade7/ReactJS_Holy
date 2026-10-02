export function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

/* ---------------- Surface ---------------- */

export function Card({ className, children, ...rest }) {
  return (
    <div
      className={cn('bg-surface border-line rounded-md border', className)}
      {...rest}
    >
      {children}
    </div>
  )
}

export function SectionTitle({ className, children }) {
  return (
    <h2
      className={cn(
        'text-ink flex items-center gap-2 text-sm font-semibold tracking-tight',
        className,
      )}
    >
      {children}
    </h2>
  )
}

/* ---------------- Button ---------------- */

const BUTTON_VARIANTS = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  secondary: 'bg-surface-2 text-ink-soft hover:text-ink border border-line hover:bg-line',
  ghost: 'text-ink-soft hover:bg-surface-2 hover:text-ink',
  danger: 'text-red-500 hover:bg-red-500/10',
}

const BUTTON_SIZES = {
  sm: 'h-7 gap-1.5 px-2.5 text-xs',
  md: 'h-8 gap-1.5 px-3 text-[13px]',
  icon: 'h-8 w-8 justify-center',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  ...rest
}) {
  return (
    <button
      className={cn(
        'inline-flex cursor-pointer items-center rounded-md font-semibold transition-all duration-150',
        'focus-visible:outline-accent focus-visible:outline-2 focus-visible:outline-offset-2',
        'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        BUTTON_SIZES[size],
        BUTTON_VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

/* Ekrandagi «Arabic | Translation» kabi almashtirgich */
export function Segmented({ options, value, onChange, className }) {
  return (
    <div
      className={cn(
        'bg-surface-2 border-line inline-flex gap-0.5 rounded-md border p-0.5',
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'cursor-pointer rounded-md px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all duration-150',
            value === option.value
              ? 'bg-ink text-bg shadow-sm'
              : 'text-ink-soft hover:text-ink',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

/* Bo'lim tablari — Sozlamalar va bosh sahifada bir xil ko'rinish */
export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div
      className={cn('bg-surface-2 border-line inline-flex rounded-md border p-0.5', className)}
    >
      {tabs.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={cn(
            'cursor-pointer rounded-md px-3 py-1 text-[13px] font-semibold transition-all duration-150',
            value === item.id ? 'bg-ink text-bg' : 'text-ink-soft hover:text-ink',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

/* ---------------- Form controls ---------------- */

const CONTROL_BASE =
  'w-full rounded-md border border-line bg-surface-2 px-3.5 text-sm text-ink transition-all duration-150 placeholder:text-ink-faint focus:border-accent focus:ring-4 focus:ring-accent/15 focus:outline-none'

export function Input({ className, ...rest }) {
  return <input className={cn(CONTROL_BASE, 'h-8', className)} {...rest} />
}

export function Textarea({ className, ...rest }) {
  return (
    <textarea
      className={cn(CONTROL_BASE, 'resize-y py-2.5 leading-relaxed', className)}
      {...rest}
    />
  )
}

export function ArabicTextarea({ className, ...rest }) {
  return (
    <textarea
      className={cn(CONTROL_BASE, 'arabic resize-y py-2.5 text-2xl leading-[2.4]', className)}
      {...rest}
    />
  )
}

export function Select({ className, children, ...rest }) {
  return (
    <select className={cn(CONTROL_BASE, 'h-8 cursor-pointer pr-9', className)} {...rest}>
      {children}
    </select>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-ink-soft text-[13px] font-semibold">{label}</span>
      {children}
      {hint ? <span className="text-ink-faint text-xs">{hint}</span> : null}
    </label>
  )
}

/* ---------------- Feedback ---------------- */

const BADGE_TONES = {
  neutral: 'bg-surface-2 text-ink-soft',
  accent: 'bg-accent/12 text-accent',
}

export function Badge({ tone = 'neutral', className, children, ...rest }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-semibold',
        BADGE_TONES[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  )
}

export function Progress({ value, total, className }) {
  const percent = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0
  return (
    <div
      className={cn('bg-surface-2 h-1.5 w-full overflow-hidden rounded-full', className)}
      title={`${value} / ${total}`}
    >
      <div
        className="bg-accent h-full rounded-full transition-[width] duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export function Alert({ tone = 'error', children }) {
  if (!children) return null
  return (
    <div
      className={cn(
        'animate-fade rounded-md px-3.5 py-2.5 text-sm font-medium',
        tone === 'error'
          ? 'bg-red-500/10 text-red-500'
          : 'bg-accent/12 text-accent',
      )}
    >
      {children}
    </div>
  )
}

export function Skeleton({ className }) {
  return <div className={cn('bg-surface-2 animate-pulse rounded-md', className)} />
}

export function Loader({ rows = 3 }) {
  return (
    <div className="space-y-3 p-2">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-20 w-full" />
      ))}
    </div>
  )
}

export function EmptyState({ icon = '۞', title, hint, action }) {
  return (
    <div className="border-line flex flex-col items-center rounded-md border border-dashed px-6 py-14 text-center">
      <div className="bg-surface-2 text-ink-faint mb-3 flex h-11 w-11 items-center justify-center rounded-md text-lg">
        {icon}
      </div>
      <p className="text-ink font-semibold">{title}</p>
      {hint ? <p className="text-ink-faint mt-1 max-w-sm text-sm">{hint}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

/* Sura raqami uchun romb belgisi */
export function Diamond({ children, className }) {
  return (
    <span
      className={cn(
        'bg-surface-2 flex h-11 w-11 flex-none rotate-45 items-center justify-center rounded-md transition-colors',
        className,
      )}
    >
      <span className="text-ink -rotate-45 text-[13px] font-bold">{children}</span>
    </span>
  )
}

/* ---------------- Page header ---------------- */

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-ink text-3xl tracking-tight">{title}</h1>
        {subtitle ? <p className="text-ink-faint mt-1.5 text-sm">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  )
}
