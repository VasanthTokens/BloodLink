import { motion, useReducedMotion } from 'framer-motion'

/**
 * The drop is the page's protagonist. One path, reused everywhere, so the
 * "journey of a drop" is literally the same mark moving through the story.
 */
export const DROP_PATH =
  'M32 4c9.7 12.4 17.4 22.2 17.4 31.1C49.4 45.4 41.6 52 32 52s-17.4-6.6-17.4-16.9C14.6 26.2 22.3 16.4 32 4Z'

export function BloodDrop({ className = '', filled = true, label, animate = false }) {
  const reduced = useReducedMotion()
  return (
    <svg
      viewBox="0 0 64 56"
      className={className}
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
      fill="none"
    >
      {animate && !reduced ? (
        <motion.path
          d={DROP_PATH}
          fill={filled ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={filled ? 0 : 2}
          initial={{ scale: 0.92 }}
          animate={{ scale: [0.94, 1.04, 1] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originY: '80%', originX: '50%' }}
        />
      ) : (
        <path
          d={DROP_PATH}
          fill={filled ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={filled ? 0 : 2}
        />
      )}
    </svg>
  )
}

/**
 * A blood bag whose fill is driven by scroll (0 → 1).
 * Used by the pinned "journey of a drop" sequence.
 */
export function BloodBag({ fill = 0, className = '', label }) {
  const clamped = Math.max(0, Math.min(1, fill))
  const innerTop = 34
  const innerBottom = 132
  const height = (innerBottom - innerTop) * clamped

  return (
    <svg
      viewBox="0 0 120 168"
      className={className}
      role="img"
      aria-label={label ?? `Blood bag ${Math.round(clamped * 100)} percent filled`}
      fill="none"
    >
      <defs>
        <clipPath id="bag-clip">
          <path d="M18 30h84a8 8 0 0 1 8 8v104a12 12 0 0 1-12 12H22a12 12 0 0 1-12-12V38a8 8 0 0 1 8-8Z" />
        </clipPath>
        <linearGradient id="bag-blood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B3122B" />
          <stop offset="100%" stopColor="#5C0A17" />
        </linearGradient>
      </defs>

      {/* hanger */}
      <path d="M60 6v14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 20h20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

      {/* bag outline */}
      <path
        d="M18 30h84a8 8 0 0 1 8 8v104a12 12 0 0 1-12 12H22a12 12 0 0 1-12-12V38a8 8 0 0 1 8-8Z"
        stroke="currentColor"
        strokeWidth="2"
        className="text-current"
      />

      {/* fill */}
      <g clipPath="url(#bag-clip)">
        <rect
          x="10"
          y={innerBottom - height}
          width="100"
          height={height}
          fill="url(#bag-blood)"
          opacity="0.92"
        />
        {/* meniscus */}
        <ellipse
          cx="60"
          cy={innerBottom - height}
          rx="42"
          ry="4"
          fill="#B3122B"
          opacity={clamped > 0.02 ? 0.55 : 0}
        />
        {/* labels printed on the bag */}
        <rect x="28" y="48" width="44" height="3" rx="1.5" fill="currentColor" opacity="0.22" />
        <rect x="28" y="58" width="30" height="3" rx="1.5" fill="currentColor" opacity="0.16" />
      </g>

      {/* tube */}
      <path
        d="M60 150v10c0 4 -3 6 -6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  )
}

export default BloodDrop
