import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

/**
 * TamilNaduMap
 * ---------------------------------------------------------------------------
 * The district outline arrives as `geometry` from the service layer and is
 * projected into SVG space at render time (equirectangular, longitude scaled by cos(lat)) so the
 * outline keeps its true aspect ratio at any width. No embedded screenshot.
 *
 * Markers pulse when their district has a matching donor or a verified bank.
 * `activeSlug` (hover or selection from the directory) lifts that district's
 * marker, thickens its halo, and dims the rest.
 */

const PAD = 10
const W = 460

function useProjection(outlineIn) {
  return useMemo(() => {
    const pts = outlineIn?.length ? outlineIn : [[77.5, 12.9], [80.3, 13.0], [79.8, 8.1], [77.0, 8.8]]
    const labelOffset = {}
    const lons = pts.map((p) => p[0])
    const lats = pts.map((p) => p[1])
    const minLon = Math.min(...lons)
    const maxLon = Math.max(...lons)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const midLat = (minLat + maxLat) / 2
    const kx = Math.cos((midLat * Math.PI) / 180)

    const spanX = (maxLon - minLon) * kx
    const spanY = maxLat - minLat
    const scale = (W - PAD * 2) / spanX
    const H = spanY * scale + PAD * 2

    const project = ([lon, lat]) => [
      PAD + (lon - minLon) * kx * scale,
      // flip latitude: north is up
      PAD + (maxLat - lat) * scale,
    ]

    return {
      project,
      H,
      outline: pts.map(project),
    }
  }, [outlineIn])
}

export default function TamilNaduMap({
  districts = [],
  geometry,
  activeSlug,
  onSelect,
  className = '',
}) {
  const { project, H, outline } = useProjection(geometry?.outline)
  const labelOffset = geometry?.label_offset ?? {}
  const reduced = useReducedMotion()
  const [hover, setHover] = useState(null)

  const path = useMemo(() => {
    const d = outline.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
    return `${d} Z`
  }, [outline])

  const active = hover ?? activeSlug

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto h-auto w-full max-h-[560px] overflow-visible"
        role="img"
        aria-label="Stylised map of Tamil Nadu with blood-bank and donor network coverage markers. District buttons beside the map provide the same information as a list."
      >
        <defs>
          <linearGradient id="tn-land" x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
          </linearGradient>
          <filter id="marker-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* land */}
        <path
          d={path}
          fill="url(#tn-land)"
          stroke="currentColor"
          strokeOpacity="0.32"
          strokeWidth="1.4"
          strokeLinejoin="round"
          className="text-ink dark:text-bone"
        />

        {/* dot grid inside the outline for a plotted-data feel */}
        <g aria-hidden="true" clipPath="url(#tn-clip)">
          <clipPath id="tn-clip">
            <path d={path} />
          </clipPath>
          {Array.from({ length: 13 }).map((_, row) =>
            Array.from({ length: 11 }).map((_, col) => (
              <circle
                key={`${row}-${col}`}
                cx={PAD + col * ((W - PAD * 2) / 10)}
                cy={PAD + row * ((H - PAD * 2) / 12)}
                r="0.9"
                className="fill-current text-ink/12 dark:text-bone/12"
              />
            )),
          )}
        </g>

        {/* markers */}
        {districts.map((d) => {
          const [x, y] = project([d.lon, d.lat])
          const isActive = active === d.slug
          const hasBank = d.has_bank
          const hasDonor = d.has_donor
          const pulsing = hasBank || hasDonor

          return (
            <g
              key={d.slug}
              tabIndex={0}
              role="button"
              aria-label={`${d.name}: ${d.donors ?? 0} donors, ${d.banks ?? 0} blood banks${hasBank ? ', stock available' : ''}`}
              aria-pressed={activeSlug === d.slug}
              onClick={() => onSelect?.(d.slug)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelect?.(d.slug)
                }
              }}
              onMouseEnter={() => setHover(d.slug)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(d.slug)}
              onBlur={() => setHover(null)}
              className="cursor-pointer outline-none"
              style={{ opacity: active && !isActive ? 0.45 : 1, transition: 'opacity .4s cubic-bezier(.22,1,.36,1)' }}
            >
              {/* generous invisible hit area for touch */}
              <circle cx={x} cy={y} r="16" fill="transparent" />

              {pulsing && !reduced && (
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 11 : 7}
                  className={hasBank ? 'fill-teal' : 'fill-crimson'}
                  opacity="0.18"
                >
                  <animate
                    attributeName="r"
                    values={isActive ? '7;16;7' : '5;12;5'}
                    dur={isActive ? '2.4s' : '3.8s'}
                    repeatCount="indefinite"
                  />
                  <animate attributeName="opacity" values="0.26;0;0.26" dur={isActive ? '2.4s' : '3.8s'} repeatCount="indefinite" />
                </circle>
              )}

              {/* Plain <circle> + CSS transition: a motion component here
                  writes an undefined `r` on first paint in some browsers. */}
              <circle
                cx={x}
                cy={y}
                r={isActive ? 6.5 : 4.6}
                className={`transition-[r] duration-300 ease-calm ${
                  hasBank
                    ? 'fill-teal'
                    : hasDonor
                      ? 'fill-crimson'
                      : 'fill-ink/35 dark:fill-bone/40'
                }`}
                stroke="var(--bone)"
                strokeWidth="1.4"
                style={{ filter: isActive ? 'url(#marker-glow)' : undefined }}
              />

              <circle cx={x} cy={y} r={isActive ? 10 : 0} fill="none" className="stroke-current text-bone" strokeOpacity="0.5" strokeWidth="1" />

              <text
                x={x + (labelOffset[d.slug]?.[0] ?? 8)}
                y={y + (labelOffset[d.slug]?.[1] ?? -8)}
                className={`select-none transition-all duration-300 ${
                  isActive ? 'fill-current text-ink dark:text-bone' : 'fill-current text-ink/55 dark:text-bone/55'
                }`}
                style={{ fontSize: isActive ? 11 : 9.5, fontWeight: isActive ? 700 : 500 }}
                textAnchor={labelOffset[d.slug]?.[0] < 0 ? 'end' : 'start'}
              >
                {d.name}
              </text>
            </g>
          )
        })}
      </svg>

      {/* selected district caption */}
      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-1 left-1 rounded-full border border-ink/10 bg-bone/95 px-3 py-1.5 text-[11px] backdrop-blur dark:border-bone/15 dark:bg-[#1F1418]/95"
          >
            {(() => {
              const d = districts.find((x) => x.slug === active)
              if (!d) return null
              return (
                <span className="inline-flex items-center gap-2">
                  <span className="font-semibold">{d.name}</span>
                  <span className="text-ink/40 dark:text-bone/40">·</span>
                  <span className="text-ink/60 dark:text-bone/60">
                    {d.banks ?? 0} bank{d.banks === 1 ? '' : 's'}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 ${d.has_bank ? 'text-teal' : 'text-ink/45 dark:text-bone/45'}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${d.has_bank ? 'bg-teal' : 'bg-current opacity-50'}`}
                      aria-hidden="true"
                    />
                    {d.has_bank ? 'in stock' : 'no stock data'}
                  </span>
                </span>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
