import { motion, AnimatePresence } from 'framer-motion'
import { AvailabilityBadge } from './States'

/**
 * A donor match card. No photographs of real people by design — a monogram
 * disc instead, which is also faster and avoids the stock-photo cliché.
 */
export default function DonorCard({ donor, index = 0, onRequest, reduced = false }) {
  return (
    <motion.li
      layout={reduced ? false : 'position'}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
      transition={{
        layout: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        delay: reduced ? 0 : Math.min(index, 8) * 0.045,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="card group relative flex flex-col rounded-2xl p-4 transition-colors duration-300 hover:border-crimson/30"
    >
      <div className="flex items-start gap-3">
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-crimson/8 font-display text-[13px] font-bold text-crimson dark:bg-crimson/20 dark:text-[#FF8FA0]"
          aria-hidden="true"
        >
          {donor.first_name.slice(0, 1)}
          {donor.last_initial.replace('.', '')}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-[15px] font-semibold leading-tight">{donor.display_name}</p>
            <span className="shrink-0 rounded-md bg-ink px-1.5 py-0.5 font-display text-[11px] font-bold leading-none text-bone dark:bg-bone dark:text-ink">
              {donor.blood_group}
            </span>
          </div>
          <p className="mt-1 truncate text-[12.5px] text-ink/55 dark:text-bone/55">
            {donor.area} · {donor.district_name}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] text-ink/55 dark:text-bone/55">
        <span className="inline-flex items-center gap-1">
          <PinIcon />
          {donor.distance_km} km
        </span>
        <span className="inline-flex items-center gap-1">
          <ClockIcon />
          ~{donor.response_minutes} min
        </span>
        <span className="inline-flex items-center gap-1">
          <DropIcon />
          {donor.total_donations} donations
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-current/5 pt-3">
        <AvailabilityBadge available={donor.is_available} verified={donor.is_verified} />
        <button
          type="button"
          onClick={() => onRequest?.(donor)}
          className="rounded-full px-3 py-1.5 text-[11.5px] font-semibold text-crimson transition-colors hover:bg-crimson/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson dark:text-[#FF8FA0] dark:hover:bg-crimson/20"
          aria-label={`Request contact with donor ${donor.display_name}, blood group ${donor.blood_group} in ${donor.district_name}`}
        >
          Request contact →
        </button>
      </div>
    </motion.li>
  )
}

const PinIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.4" />
  </svg>
)
const ClockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)
const DropIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 3c3.6 4.6 6 8.2 6 11a6 6 0 0 1-12 0c0-2.8 2.4-6.4 6-11Z" />
  </svg>
)
