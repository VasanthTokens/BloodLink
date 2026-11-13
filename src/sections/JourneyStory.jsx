import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Picture from '../components/Picture'
import { BloodBag, BloodDrop } from '../components/BloodDrop'
import { usePrefersReducedMotion } from '../hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

const EASE = [0.22, 1, 0.36, 1]

/** The four stages are the plot of the page, not a feature list. */
const STAGES = [
  {
    key: 'donate',
    n: '01',
    title: 'Donate',
    ta: 'நன்கொடை',
    image: 'journey-donor',
    alt: 'A young man reclines in a donation chair with a squeezy ball in his hand, tubing and a blood bag beside him, warm daylight across the room.',
    line: 'A volunteer sits down in Coimbatore on a Tuesday morning. Nine minutes, one unit, no cost.',
    detail: '450 ml · 8–12 minutes · single-use kit',
    stat: [['1 unit', 'per donation'], ['~10 min', 'chair time']],
  },
  {
    key: 'test',
    n: '02',
    title: 'Test',
    ta: 'பரிசோதனை',
    image: 'journey-lab',
    alt: 'A lab technician in a light blue coat holds a rack of labelled sample tubes up to the window light in a blood bank laboratory.',
    line: 'Every unit is screened before it is allowed to travel: group, Rh, HIV, HBV, HCV, syphilis, malaria.',
    detail: 'ABO + Rh typing · 5 infection screens · NAT where available',
    stat: [['6', 'screens per unit'], ['0', 'units skipped']],
  },
  {
    key: 'store',
    n: '03',
    title: 'Store',
    ta: 'சேமிப்பு',
    image: 'journey-store',
    alt: 'Rows of sealed blood bags on metal shelves inside a lit blood bank refrigerator, condensation on the glass.',
    line: 'Separated into red cells, plasma and platelets. Cold chain held at 2–6 °C, logged every hour.',
    detail: 'RBC 42 days · plasma 12 months · platelets 5 days',
    stat: [['2–6 °C', 'red cells'], ['5 days', 'platelets']],
  },
  {
    key: 'deliver',
    n: '04',
    title: 'Deliver',
    ta: 'வழங்கல்',
    image: 'journey-deliver',
    alt: 'A nurse in scrubs walks briskly down a hospital corridor carrying a small insulated cool box, warm light at the far end.',
    line: 'A request fires in Madurai. The nearest matching bank is 6 km away. The box leaves in four minutes.',
    detail: 'Cross-match → issue → ward',
    stat: [['< 1 hr', 'request to ward'], ['4 min', 'box dispatch']],
  },
]

export default function JourneyStory() {
  const reduced = useReducedMotion()
  const pinRef = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (reduced) return undefined
    const el = pinRef.current
    if (!el) return undefined

    /**
     * The "pin" is CSS `position: sticky`, not ScrollTrigger's scrub-pin.
     * Sticky costs the compositor almost nothing and never fights Lenis;
     * ScrollTrigger is used for what it is genuinely best at here — mapping
     * scroll progress to the stage index and the bag's fill level.
     */
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => setProgress(self.progress),
      invalidateOnRefresh: true,
    })

    // Hero didn't exist in the layout when this mounted? Recalc once fonts land.
    const t = setTimeout(() => ScrollTrigger.refresh(), 400)

    return () => {
      clearTimeout(t)
      trigger.kill()
    }
  }, [reduced])

  const p = Math.max(0, Math.min(1, progress))
  const active = Math.min(STAGES.length - 1, Math.floor(p * STAGES.length + 0.0001))
  const stage = STAGES[active]
  // bag fill: each stage owns 25% of the scroll, and the drop advances through it
  const fill = p

  if (reduced) return <JourneyStatic />

  return (
    <section id="journey" className="relative isolate bg-[#140D0F] text-bone">
      <div ref={pinRef} className="relative h-[380svh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* ---------------------------------------------- photograph stack */}
        {/* Only the active frame is mounted, with the outgoing one cross-fading
            behind it. Mounting all four full-bleed photographs at once costs
            ~4x the decoded-image memory for pixels nobody can see. */}
        <div className="absolute inset-0">
          <AnimatePresence initial={false}>
            <motion.div
              key={stage.key}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.75, ease: EASE }}
              aria-hidden="true"
            >
              <Picture
                name={stage.image}
                alt={stage.alt}
                aspect="auto"
                sizes="100vw"
                reveal={false}
                className="!aspect-none absolute inset-0"
                overlayClassName=""
                overlay={
                  <>
                    <div className="absolute inset-0 bg-[#5C0A17]/55 mix-blend-multiply" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#140D0F] via-[#140D0F]/55 to-[#140D0F]/75" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#140D0F]/85 via-transparent to-[#140D0F]/40" aria-hidden="true" />
                  </>
                }
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ------------------------------------------------------ content */}
        <div className="shell relative flex h-full flex-col justify-between py-10 sm:py-12">
          <header className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow !text-[#FF8FA0]">
                <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
                The journey of a drop
              </p>
              <p className="mt-2 max-w-xs text-[12.5px] leading-relaxed text-bone/55">
                One donation, four rooms, and a person on the other side who never learns your name.
              </p>
            </div>
            <div className="hidden shrink-0 items-center gap-3 rounded-full border border-bone/15 bg-bone/5 px-4 py-2 backdrop-blur sm:flex">
              <BloodDrop className="h-4 w-4 text-[#FF8FA0]" />
              <span className="font-display text-[12px] font-bold tabular-nums tracking-tight">
                {String(Math.round(p * 100)).padStart(3, '0')}%
              </span>
              <span className="text-[10px] uppercase tracking-[0.16em] text-bone/45">of the journey</span>
            </div>
          </header>

          <div className="grid flex-1 items-end gap-8 pb-2 pt-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16">
            {/* ------------------------------------------ stage copy stack */}
            <div className="relative min-h-[290px] sm:min-h-[260px] lg:min-h-[300px]">
              {STAGES.map((s, i) => {
                const isActive = active === i
                return (
                  <motion.div
                    key={s.key}
                    className={`max-w-xl ${isActive ? 'relative' : 'pointer-events-none absolute inset-0'}`}
                    initial={false}
                    /* No blur() here: animating a filter over a full-width
                       headline forces a full repaint every frame on mid-range
                       Android. Position + opacity reads just as cinematic. */
                    animate={{
                      opacity: isActive ? 1 : 0,
                      y: isActive ? 0 : 22,
                    }}
                    transition={{ duration: 0.65, ease: EASE }}
                    aria-hidden={!isActive}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-display text-[12px] font-bold tracking-[0.2em] text-[#FF8FA0]">
                        {s.n}
                      </span>
                      <span className="h-px w-8 bg-bone/25" aria-hidden="true" />
                      <span lang="ta" className="text-[12px] text-bone/50">
                        {s.ta}
                      </span>
                    </div>

                    <h2 className="mt-3 font-display text-[clamp(2.6rem,8vw,4.6rem)] leading-[0.92] tracking-tightest">
                      {s.title}
                    </h2>

                    <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-bone/75 sm:text-[15.5px]">
                      {s.line}
                    </p>

                    <dl className="mt-5 flex flex-wrap items-start gap-x-6 gap-y-2">
                      {s.stat.map(([value, label], k) => (
                        <div key={label} className={k === 0 ? '' : 'border-l border-bone/20 pl-6'}>
                          <dd className="font-display text-[17px] font-bold leading-none text-bone">{value}</dd>
                          <dt className="mt-1.5 text-[10.5px] uppercase tracking-[0.12em] text-bone/40">
                            {label}
                          </dt>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-3 text-[11.5px] text-bone/40">{s.detail}</p>
                  </motion.div>
                )
              })}
            </div>

            {/* --------------------------------------------- bag + rail */}
            <div className="flex items-end gap-5 sm:gap-8 lg:flex-col lg:items-center lg:gap-6">
              <div className="relative">
                {/* soft halo so the bag reads against photography */}
                <div
                  className="absolute -inset-8 rounded-full bg-[#B3122B]/20 blur-2xl"
                  aria-hidden="true"
                />
                <BloodBag
                  fill={fill}
                  className="relative h-[190px] w-auto text-bone/70 sm:h-[230px]"
                  label={`Blood bag filling: ${Math.round(fill * 100)} percent complete, stage ${active + 1} of 4, ${stage.title}`}
                />
              </div>

              <ol className="flex gap-4 sm:gap-5 lg:flex-row" aria-label="Journey stages">
                {STAGES.map((s, i) => {
                  const done = i <= active
                  return (
                    <li key={s.key} className="flex flex-col items-center gap-2">
                      <span
                        className={`grid h-6 w-6 place-items-center rounded-full border text-[9px] font-bold transition-all duration-500 ease-calm ${
                          done
                            ? 'border-[#FF8FA0] bg-[#B3122B] text-white'
                            : 'border-bone/25 text-bone/40'
                        }`}
                        aria-hidden="true"
                      >
                        {s.n}
                      </span>
                      <span
                        className={`hidden text-[10px] uppercase tracking-[0.12em] transition-colors duration-500 sm:block ${
                          i === active ? 'text-bone' : 'text-bone/35'
                        }`}
                      >
                        {s.title}
                      </span>
                      <span className="sr-only">
                        {s.title} — {i === active ? 'current stage' : done ? 'completed' : 'upcoming'}
                      </span>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>

          {/* progress hairline — the literal thread of the story */}
          <div className="relative h-[2px] w-full overflow-hidden bg-bone/12" aria-hidden="true">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#B3122B] to-[#FF8FA0]"
              style={{ width: `${p * 100}%` }}
            />
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}

/** Reduced-motion version: the same four stages, stacked, no pinning. */
function JourneyStatic() {
  return (
    <section id="journey" className="bg-[#140D0F] py-20 text-bone">
      <div className="shell">
        <p className="eyebrow !text-[#FF8FA0]">The journey of a drop</p>
        <h2 className="mt-4 max-w-2xl text-[clamp(2rem,5.2vw,3.4rem)] leading-[0.98]">
          Four rooms between a donor and a patient.
        </h2>
        <ul className="mt-12 space-y-14">
          {STAGES.map((s) => (
            <li key={s.key} className="grid gap-6 sm:grid-cols-[1fr_1.1fr] sm:items-center">
              <Picture
                name={s.image}
                alt={s.alt}
                className="rounded-3xl"
                sizes="(max-width: 640px) 100vw, 45vw"
                parallax={0}
              />
              <div>
                <p className="font-display text-[12px] font-bold tracking-[0.2em] text-[#FF8FA0]">{s.n}</p>
                <h3 className="mt-2 text-3xl">{s.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-bone/70">{s.line}</p>
                <p className="mt-3 text-[12px] text-bone/40">{s.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
