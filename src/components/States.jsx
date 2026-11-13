import { motion } from 'framer-motion'
import { MagneticButton, buttonStyles } from './MagneticButton'

/* ------------------------------------------------------------------ skeleton */
export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`card rounded-3xl p-5 ${className}`} aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className="skeleton h-11 w-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-2/5 rounded-full" />
          <div className="skeleton h-3 w-1/4 rounded-full" />
        </div>
        <div className="skeleton h-8 w-14 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="skeleton h-2.5 rounded-full" style={{ width: `${88 - i * 16}%` }} />
        ))}
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6, className = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' }) {
  return (
    <div className={className} role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading donor matches…</span>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------- empty */
export function EmptyState({ title, body, action, onAction, icon = 'drop' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="card flex flex-col items-center justify-center rounded-3xl px-6 py-14 text-center"
    >
      <div className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-crimson/8 text-crimson dark:bg-crimson/20 dark:text-[#FF8FA0]">
        <EmptyIcon name={icon} />
      </div>
      <h3 className="text-xl">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/60 dark:text-bone/60">{body}</p>
      {action && (
        <MagneticButton onClick={onAction} className={`${buttonStyles.ghost} mt-6`}>
          {action}
        </MagneticButton>
      )}
    </motion.div>
  )
}

function EmptyIcon({ name }) {
  const common = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  if (name === 'search')
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.6-3.6" />
      </svg>
    )
  if (name === 'map')
    return (
      <svg {...common}>
        <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
        <path d="M9 4v14M15 6v14" />
      </svg>
    )
  return (
    <svg {...common}>
      <path d="M12 3c3.6 4.6 6 8.2 6 11a6 6 0 0 1-12 0c0-2.8 2.4-6.4 6-11Z" />
    </svg>
  )
}

/* -------------------------------------------------------------------- error */
export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div
      role="alert"
      className="card flex flex-col items-center rounded-3xl border-crimson/25 px-6 py-14 text-center"
    >
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-crimson/10 text-crimson dark:text-[#FF8FA0]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
          <path d="M12 8v5M12 16.5h.01" />
          <path d="M10.3 3.9 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        </svg>
      </div>
      <h3 className="text-lg">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/60 dark:text-bone/60">
        {message ?? 'We could not reach the network. Check your connection and try again.'}
      </p>
      {onRetry && (
        <button type="button" onClick={onRetry} className={`${buttonStyles.ghost} mt-6`}>
          Try again
        </button>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------- badges */
export function AvailabilityBadge({ available, verified }) {
  const tone = available
    ? 'bg-teal/10 text-teal border-teal/25'
    : 'bg-ink/5 text-ink/55 border-ink/10 dark:bg-bone/10 dark:text-bone/55 dark:border-bone/15'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${tone}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          available ? 'bg-teal' : 'bg-current opacity-50'
        }`}
        aria-hidden="true"
      />
      {available ? 'Available now' : 'Cooldown'}
      {verified ? (
        <span className="ml-0.5 inline-flex items-center gap-1 border-l border-current/20 pl-1.5" title="Verified by a coordinator">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m5 13 4 4L19 7" />
          </svg>
          Verified
        </span>
      ) : null}
    </span>
  )
}

export function UrgencyPill({ urgency }) {
  const map = {
    critical: 'bg-crimson text-white',
    urgent: 'bg-crimson/12 text-crimson dark:bg-crimson/25 dark:text-[#FF8FA0]',
    standard: 'bg-ink/6 text-ink/60 dark:bg-bone/10 dark:text-bone/60',
  }
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${map[urgency] ?? map.standard}`}>
      {urgency}
    </span>
  )
}

export function StockChip({ group, units, status, selected = false }) {
  const tone =
    status === 'available'
      ? 'border-teal/30 bg-teal/8 text-teal'
      : status === 'low'
        ? 'border-[#C98A18]/35 bg-[#C98A18]/10 text-[#8A5E08] dark:text-[#F0B84B]'
        : 'border-ink/10 bg-ink/4 text-ink/40 dark:border-bone/10 dark:bg-bone/5 dark:text-bone/35'
  return (
    <span
      className={`inline-flex min-w-[3.4rem] flex-col items-center rounded-xl border px-2 py-1.5 leading-none ${tone} ${
        selected ? 'ring-1 ring-current' : ''
      }`}
      title={`${group}: ${units} units`}
    >
      <span className="text-[11px] font-semibold tracking-tight">{group}</span>
      <span className="mt-1 font-display text-[13px] font-bold tabular-nums">{units}</span>
    </span>
  )
}

export function SampleTag({ children = 'Sample data', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-dashed border-ink/20 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-ink/45 dark:border-bone/25 dark:text-bone/40 ${className}`}
    >
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
      </svg>
      {children}
    </span>
  )
}
