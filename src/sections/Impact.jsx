import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { api } from '../services/api'
import Reveal, { SectionHeading } from '../components/Reveal'
import { useCountUp } from '../hooks/useCountUp'
import { ErrorState, SampleTag } from '../components/States'
import Picture from '../components/Picture'

const EASE = [0.22, 1, 0.36, 1]

/**
 * OUR IMPACT
 * Counters climb once, on entry. Beneath them, the "one donation reaches three
 * lives" idea is shown literally: three silhouettes light up in sequence, each
 * labelled with the component it came from. Then the district chart and the
 * sample testimonial carousel.
 */
export default function Impact() {
  const reduced = useReducedMotion()
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const countersRef = useRef(null)
  const inView = useInView(countersRef, { once: true, amount: 0.4 })

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: s.data ? 'ready' : 'loading' }))
    try {
      const res = await api.getImpact()
      setState({ status: 'ready', data: res.data, error: null })
    } catch (err) {
      setState({ status: 'error', data: null, error: err })
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <section
      id="impact"
      aria-labelledby="impact-title"
      className="relative overflow-hidden bg-ink py-20 text-bone sm:py-28 dark:bg-[#100A0C]"
    >
      {/* soft radial pressure — a vignette, not a gradient blob */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(70% 55% at 50% 0%, rgba(179,18,43,0.28) 0%, transparent 65%)',
        }}
      />

      <div className="shell relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            dark
            id="impact-title"
            eyebrow="Our impact · sample figures"
            title={
              <>
                Numbers that end
                <br />
                in a person.
              </>
            }
            intro="Every figure below is synthetic, generated for this prototype. They are shaped exactly like the analytics our production service returns."
          />
          <SampleTag className="!border-bone/25 !text-bone/50">Totals are illustrative</SampleTag>
        </div>

        {state.status === 'error' && (
          <div className="mt-10">
            <ErrorState onRetry={load} message={state.error?.message} />
          </div>
        )}

        {state.status === 'ready' && (
          <>
            {/* ------------------------------------------------------ counters */}
            <div ref={countersRef} className="mt-12 grid grid-cols-2 gap-x-5 gap-y-8 border-y border-bone/12 py-8 sm:grid-cols-3 lg:grid-cols-6">
              <Counter value={state.data.counters.donors_registered} label="donors registered" start={inView} />
              <Counter value={state.data.counters.units_collected_ytd} label="units collected this year" start={inView} />
              <Counter value={state.data.counters.lives_reached} label="lives reached" start={inView} suffix="+" />
              <Counter value={state.data.counters.hospitals_onboarded} label="hospitals onboard" start={inView} />
              <Counter value={state.data.counters.banks_onboarded} label="blood banks verified" start={inView} />
              <Counter value={state.data.counters.avg_match_minutes} label="median match time (min)" start={inView} />
            </div>

            {/* -------------------------------------------------- three lives */}
            <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16">
              <div>
                <p className="eyebrow !text-[#FF8FA0]">One donation, three lives</p>
                <h3 className="mt-3 text-[clamp(1.7rem,4.4vw,2.6rem)] leading-[1] text-bone">
                  A single unit is
                  <br />
                  separated into three.
                </h3>
                <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-bone/65">
                  Red cells carry oxygen for up to 42 days. Plasma supports clotting for a year.
                  Platelets keep a chemotherapy patient from bleeding out — and last only five days.
                  That is why one donor can appear on three different wards within a week.
                </p>
                <ul className="mt-6 space-y-2">
                  {THREE.map((c, i) => (
                    <motion.li
                      key={c.name}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.15 + i * 0.16, duration: 0.6, ease: EASE }}
                      className="flex items-center gap-3 text-[12.5px] text-bone/60"
                    >
                      <span className={`h-2 w-2 rounded-full ${c.dot}`} aria-hidden="true" />
                      <span className="w-24 shrink-0 font-medium text-bone/85">{c.name}</span>
                      {c.uses}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <ThreeLives />
            </div>

            {/* -------------------------------------------- chart + testimonial */}
            <div className="mt-16 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
              <div className="rounded-4xl border border-bone/12 p-5 sm:p-7">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[17px] text-bone">Donations by district</h3>
                  <span className="text-[10.5px] uppercase tracking-[0.14em] text-bone/40">YTD · sample</span>
                </div>
                <DistrictChart data={state.data.district_totals} reduced={reduced} />
              </div>

              <TestimonialCarousel stories={state.data.stories} reduced={reduced} />
            </div>

            <p className="mt-8 text-[10.5px] uppercase tracking-[0.16em] text-bone/30">
              Generated {new Date(state.data.generated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · all values synthetic
            </p>
          </>
        )}

        {state.status === 'loading' && (
          <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="skeleton h-9 w-24 rounded-md opacity-20" />
                <div className="skeleton h-2.5 w-20 rounded-full opacity-20" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

const THREE = [
  { name: 'Red cells', uses: 'surgery, trauma, anaemia', dot: 'bg-crimson' },
  { name: 'Plasma', uses: 'burns, clotting disorders', dot: 'bg-[#C9A227]' },
  { name: 'Platelets', uses: 'chemotherapy, dengue', dot: 'bg-teal' },
]

function Counter({ value, label, start, suffix = '' }) {
  const display = useCountUp(value, { start, duration: 1700 })
  return (
    <div>
      <p className="font-display text-[clamp(1.55rem,3.4vw,2.3rem)] font-bold leading-none tracking-tightest tabular-nums text-bone">
        {display.toLocaleString('en-IN')}
        {suffix}
      </p>
      <p className="mt-2 text-[11px] leading-tight text-bone/45">{label}</p>
    </div>
  )
}

/** Three silhouettes, revealed one after another as the block enters. */
function ThreeLives() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.35 })
  const reduced = useReducedMotion()

  return (
    <div ref={ref} className="relative">
      <div className="grid grid-cols-3 gap-3">
        {THREE.map((c, i) => (
          <motion.div
            key={c.name}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ delay: reduced ? 0 : 0.25 + i * 0.34, duration: 0.75, ease: EASE }}
            className="relative overflow-hidden rounded-3xl border border-bone/12 bg-bone/[0.03] p-4"
          >
            {/* the silhouette */}
            <svg viewBox="0 0 64 96" className="mx-auto h-24 w-auto" aria-hidden="true">
              <motion.g
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: reduced ? 0 : 0.3 + i * 0.34, duration: 0.6 }}
              >
                <circle cx="32" cy="22" r="12" fill="currentColor" className="text-bone/22" />
                <path
                  d="M8 96c0-16 10.7-27 24-27s24 11 24 27H8Z"
                  fill="currentColor"
                  className="text-bone/22"
                />
              </motion.g>
              {/* the drop that fills the figure */}
              <motion.rect
                x="0"
                y="96"
                width="64"
                height="96"
                fill="currentColor"
                className={c.name === 'Red cells' ? 'text-crimson/70' : c.name === 'Plasma' ? 'text-[#C9A227]/60' : 'text-teal/60'}
                initial={{ y: 96 }}
                animate={inView ? { y: 34 } : {}}
                transition={{ delay: reduced ? 0 : 0.5 + i * 0.34, duration: 1.1, ease: EASE }}
                style={{ mixBlendMode: 'screen' }}
              />
            </svg>
            <p className="mt-3 text-center text-[11px] font-semibold text-bone/85">{c.name}</p>
            <p className="mt-0.5 text-center text-[9.5px] uppercase tracking-[0.1em] text-bone/35">
              {c.name === 'Red cells' ? '42 days' : c.name === 'Plasma' ? '12 months' : '5 days'}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-[11px] text-bone/40">
        <span className="h-px flex-1 bg-bone/15" aria-hidden="true" />
        <span>one donor → three recipients</span>
        <span className="h-px flex-1 bg-bone/15" aria-hidden="true" />
      </div>
    </div>
  )
}

function DistrictChart({ data, reduced }) {
  const [mounted, setMounted] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  useEffect(() => {
    if (inView) setMounted(true)
  }, [inView])

  const max = Math.max(...data.map((d) => d.donations_ytd))

  return (
    <div ref={ref}>
      <ul className="mt-5 space-y-2.5">
        {data.map((d, i) => (
          <li key={d.district_slug} className="group grid grid-cols-[88px_1fr_42px] items-center gap-3">
            <span className="truncate text-[11.5px] text-bone/55">{d.district_name}</span>
            <span
              className="relative h-2 overflow-hidden rounded-full bg-bone/8"
              role="presentation"
            >
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-crimson to-[#E4536B]"
                initial={{ width: 0 }}
                animate={{ width: mounted ? `${(d.donations_ytd / max) * 100}%` : 0 }}
                transition={{ delay: reduced ? 0 : 0.1 + i * 0.055, duration: 0.9, ease: EASE }}
              />
            </span>
            <span className="text-right font-display text-[11.5px] font-bold tabular-nums text-bone/70">
              {d.donations_ytd}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-bone/10 pt-3 text-[10.5px] text-bone/35">
        Units collected year-to-date. Bar length is relative to the highest district.
      </p>
    </div>
  )
}

function TestimonialCarousel({ stories, reduced }) {
  const [index, setIndex] = useState(0)
  const story = stories[index]

  useEffect(() => {
    if (reduced) return undefined
    const t = setInterval(() => setIndex((i) => (i + 1) % stories.length), 7200)
    return () => clearInterval(t)
  }, [stories.length, reduced])

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-4xl border border-bone/12 bg-bone/[0.03] p-5 sm:p-7">
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow !text-[#FF8FA0]">Donor stories</p>
          <SampleTag className="!border-bone/25 !text-bone/50">Synthetic samples</SampleTag>
        </div>

        <div className="mt-5 min-h-[168px]">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={story.story_id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              <p className="font-display text-[clamp(1.05rem,2.4vw,1.35rem)] font-medium leading-[1.35] text-bone/90">
                “{story.quote}”
              </p>
              <footer className="mt-5 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-crimson/25 font-display text-[11px] font-bold text-[#FF8FA0]">
                  {story.blood_group}
                </span>
                <div>
                  <p className="text-[12.5px] font-semibold text-bone">{story.attribution}</p>
                  <p className="text-[10.5px] text-bone/45">{story.role}</p>
                </div>
                <span className="ml-auto text-[10.5px] text-bone/40">{story.donations} donations</span>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        {stories.map((s, i) => (
          <button
            key={s.story_id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show story ${i + 1} of ${stories.length}`}
            aria-current={i === index}
            className="group relative h-6 flex-1"
          >
            <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-bone/15" />
            <motion.span
              className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-[#FF8FA0]"
              animate={{ width: i === index ? '100%' : '0%' }}
              transition={{ duration: i === index && !reduced ? 7.2 : 0.3, ease: 'linear' }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
