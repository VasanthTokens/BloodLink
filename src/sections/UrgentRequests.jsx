import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { api } from '../services/api'
import { SectionHeading, staggerChild, staggerParent } from '../components/Reveal'
import { ErrorState, SkeletonCard, UrgencyPill, SampleTag } from '../components/States'
import Picture from '../components/Picture'

const EASE = [0.22, 1, 0.36, 1]

/**
 * URGENT REQUESTS
 * Hospital-verified cards. Critical ones carry a slow pulsing edge — a held
 * breath, not a siren. Pledging animates the unit bar and resolves into a
 * quiet acknowledgement (no confetti; this is somebody's emergency).
 *
 * The section also tells the page-level ECG to quicken (`onPulse`).
 */
export default function UrgentRequests({ onPulse }) {
  const reduced = useReducedMotion()
  const [state, setState] = useState({ status: 'loading', requests: [], error: null })
  const [pledging, setPledging] = useState({})
  const [thanked, setThanked] = useState({})
  const sectionRef = useRef(null)

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: s.requests.length ? 'ready' : 'loading', error: null }))
    try {
      const res = await api.getRequests()
      setState({ status: 'ready', requests: res.data, error: null })
    } catch (err) {
      setState({ status: 'error', requests: [], error: err })
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  /* Tell the ECG to quicken while this section holds the viewport. */
  useEffect(() => {
    const el = sectionRef.current
    if (!el || !onPulse) return undefined
    const io = new IntersectionObserver(
      ([entry]) => onPulse(entry.isIntersecting && entry.intersectionRatio > 0.35),
      { threshold: [0, 0.35, 0.6, 1] },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [onPulse])

  const pledge = async (request) => {
    if (pledging[request.request_id] || request.units_pledged >= request.units_needed) return
    setPledging((p) => ({ ...p, [request.request_id]: true }))
    try {
      const res = await api.pledgeRequest(request.request_id)
      setState((s) => ({
        ...s,
        requests: s.requests.map((r) => (r.request_id === request.request_id ? res.data : r)),
      }))
      setThanked((t) => ({ ...t, [request.request_id]: true }))
      setTimeout(() => setThanked((t) => ({ ...t, [request.request_id]: false })), 5200)
    } catch (err) {
      setThanked((t) => ({ ...t, [request.request_id]: err.message }))
      setTimeout(() => setThanked((t) => ({ ...t, [request.request_id]: false })), 4200)
    } finally {
      setPledging((p) => ({ ...p, [request.request_id]: false }))
    }
  }

  const critical = state.requests.filter((r) => r.urgency === 'critical').length

  return (
    <section
      id="urgent"
      ref={sectionRef}
      aria-labelledby="urgent-title"
      className="relative overflow-hidden bg-bone py-20 sm:py-28 dark:bg-[#140D0F]"
    >
      {/* a faint crimson thread along the left edge — the page is tense here */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-crimson/30 to-transparent"
        aria-hidden="true"
      />

      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            id="urgent-title"
            eyebrow="Live requests · hospital verified"
            title={
              <>
                Somebody is
                <br />
                waiting right now.
              </>
            }
            intro="Each request below is raised by a hospital blood bank coordinator and verified before it appears. Pledging means you intend to donate — a coordinator then calls you to confirm eligibility and timing."
          />
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <SampleTag>Sample requests · synthetic hospitals</SampleTag>
            {state.status === 'ready' && (
              <p className="flex items-center gap-2 rounded-full border border-crimson/25 bg-crimson/6 px-3.5 py-2 text-[12px] font-medium text-crimson dark:text-[#FF8FA0]">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-crimson opacity-60 dark:bg-[#FF8FA0]" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-crimson dark:bg-[#FF8FA0]" />
                </span>
                {critical} critical · {state.requests.length} open
              </p>
            )}
          </div>
        </div>

        <div className="mt-12">
          {state.status === 'loading' && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4" aria-busy="true" aria-live="polite">
              <span className="sr-only">Loading urgent requests…</span>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} lines={4} />
              ))}
            </div>
          )}

          {state.status === 'error' && <ErrorState onRetry={load} message={state.error?.message} />}

          {state.status === 'ready' && (
            <motion.ul
              variants={reduced ? undefined : staggerParent}
              initial={reduced ? undefined : 'hidden'}
              whileInView={reduced ? undefined : 'show'}
              viewport={{ once: true, amount: 0.15 }}
              className="grid list-none gap-5 p-0 md:grid-cols-2 xl:grid-cols-4"
            >
              {state.requests.map((r) => {
                const pct = Math.round((r.units_pledged / r.units_needed) * 100)
                const full = r.units_pledged >= r.units_needed
                return (
                  <motion.li
                    key={r.request_id}
                    variants={reduced ? undefined : staggerChild}
                    className={`card relative flex flex-col overflow-hidden rounded-3xl ${
                      r.urgency === 'critical' ? 'border-crimson/40' : ''
                    }`}
                  >
                    {/* pulsing edge on critical cards */}
                    {r.urgency === 'critical' && !reduced && (
                      <motion.span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-crimson/50"
                        animate={{ opacity: [0.15, 0.75, 0.15] }}
                        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}

                    <div className="flex items-start justify-between gap-3 p-5 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="relative grid h-11 w-11 place-items-center rounded-2xl bg-crimson text-white">
                          <span className="font-display text-[14px] font-bold leading-none">{r.blood_group}</span>
                        </span>
                        <div>
                          <UrgencyPill urgency={r.urgency} />
                          <p className="mt-1.5 text-[11px] text-ink/50 dark:text-bone/50">
                            Needed by {new Date(r.needed_by).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <span className="text-right text-[10.5px] leading-tight text-ink/40 dark:text-bone/40">
                        {r.units_needed} unit{r.units_needed > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex-1 px-5">
                      <h3 className="text-[16.5px] leading-tight">{r.hospital_name}</h3>
                      <p className="mt-1 text-[12px] text-ink/55 dark:text-bone/55">
                        {r.area} · {r.district_name}
                      </p>
                      <p className="mt-3 border-l-2 border-crimson/25 pl-3 text-[12.5px] leading-relaxed text-ink/70 dark:text-bone/65">
                        {r.patient_context}
                      </p>
                    </div>

                    <div className="mt-5 px-5">
                      <div className="flex items-baseline justify-between text-[11px]">
                        <span className="font-medium text-ink/60 dark:text-bone/60">
                          {full ? 'Fully pledged' : `${Math.max(0, r.units_needed - r.units_pledged)} unit${r.units_needed - r.units_pledged === 1 ? '' : 's'} still needed`}
                        </span>
                        <span className="tabular-nums text-ink/45 dark:text-bone/45">
                          {r.units_pledged} / {r.units_needed}
                        </span>
                      </div>
                      <div
                        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/8 dark:bg-bone/12"
                        role="progressbar"
                        aria-valuenow={r.units_pledged}
                        aria-valuemin={0}
                        aria-valuemax={r.units_needed}
                        aria-label={`Pledged units for ${r.hospital_name}`}
                      >
                        <motion.div
                          className={`h-full rounded-full ${full ? 'bg-teal' : 'bg-crimson'}`}
                          initial={false}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.9, ease: EASE }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 p-5 pt-0">
                      <button
                        type="button"
                        disabled={full || pledging[r.request_id]}
                        onClick={() => pledge(r)}
                        className={`relative w-full overflow-hidden rounded-full px-4 py-2.5 text-[12.5px] font-semibold transition-all duration-300 ease-calm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson ${
                          full
                            ? 'cursor-default bg-teal/12 text-teal'
                            : 'bg-ink text-bone hover:bg-oxblood disabled:opacity-70 dark:bg-bone dark:text-ink dark:hover:bg-white'
                        }`}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {full ? (
                            <motion.span
                              key="full"
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              className="inline-flex items-center gap-1.5"
                            >
                              <CheckMark /> Request covered
                            </motion.span>
                          ) : thanked[r.request_id] === true ? (
                            <motion.span
                              key="thanks"
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              className="inline-flex items-center gap-1.5"
                            >
                              <CheckMark /> Thank you — coordinator will call
                            </motion.span>
                          ) : typeof thanked[r.request_id] === 'string' ? (
                            <motion.span key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                              {thanked[r.request_id]}
                            </motion.span>
                          ) : (
                            <motion.span
                              key="pledge"
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              className="inline-flex items-center gap-1.5"
                            >
                              {pledging[r.request_id] ? 'Recording…' : 'Pledge 1 unit'}
                              {!pledging[r.request_id] && <span aria-hidden="true">→</span>}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                      <p className="mt-2 text-center text-[10px] text-ink/35 dark:text-bone/35">
                        Verified {new Date(r.verified_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {r.verified_by}
                      </p>
                    </div>
                  </motion.li>
                )
              })}
            </motion.ul>
          )}
        </div>

        {/* the human note beside the data */}
        <div className="mt-12 grid gap-6 overflow-hidden rounded-4xl bg-ink text-bone sm:grid-cols-[1.15fr_1fr] sm:items-center dark:bg-[#1F1418]">
          <div className="p-7 sm:p-10">
            <p className="eyebrow !text-[#FF8FA0]">Why verification matters</p>
            <h3 className="mt-3 text-[clamp(1.5rem,3.6vw,2.15rem)] leading-[1.05]">
              Every card is confirmed by a human at the hospital.
            </h3>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-bone/65">
              Unverified appeals are the fastest way to exhaust a donor network. A coordinator at the
              requesting blood bank confirms the group, the units and the window before a request goes
              live — and closes it the moment it is covered.
            </p>
            <ul className="mt-5 space-y-2 text-[13px] text-bone/70">
              {['Group and Rh confirmed against the case sheet', 'No request stays open past its window', 'Donor contact is shared only with consent'].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-teal/25 text-teal">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <Picture
            name="family-waiting"
            alt="Three members of a family sit together on a bench in a hospital waiting area, looking toward a doorway, under warm light against a teal wall."
            className="h-full min-h-[240px] sm:rounded-l-none"
            rounded="sm:rounded-none"
            aspect="auto"
            sizes="(max-width: 640px) 100vw, 40vw"
            parallax={16}
            overlayClassName="bg-oxblood/20"
          />
        </div>
      </div>
    </section>
  )
}

function CheckMark() {
  return (
    <motion.svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
    >
      <motion.path
        d="m4 12.5 5 5L20 6.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.svg>
  )
}
