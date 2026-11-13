import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { api } from '../services/api'
import DonorCard from './DonorCard'
import { EmptyState, ErrorState, SkeletonGrid, SampleTag } from './States'
import { BloodDrop } from './BloodDrop'

const ALL = 'all'
const PAGE = 6

/**
 * Find a Donor — the product, above the fold.
 *
 * Everything here talks to src/services/api.js only. Choosing a blood group
 * morphs the drop (the page's protagonist) and re-orders matches with a
 * staggered layout transition, so the interface feels like it is *live*.
 */
export default function FindDonorTool({ onOpenRegister }) {
  const reduced = useReducedMotion()
  const [reference, setReference] = useState({ groups: [], districts: [] })
  const [group, setGroup] = useState('O+')
  const [district, setDistrict] = useState(ALL)
  const [availableOnly, setAvailableOnly] = useState(true)
  const [limit, setLimit] = useState(PAGE)
  const [state, setState] = useState({ status: 'loading', donors: [], meta: null, error: null })
  const [toast, setToast] = useState(null)
  const abortRef = useRef(null)

  useEffect(() => {
    let alive = true
    api.getReference().then(({ data }) => {
      if (alive) setReference({ groups: data.blood_groups, districts: data.districts })
    })
    return () => {
      alive = false
    }
  }, [])

  const load = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setState((s) => ({ ...s, status: s.donors.length ? 'refreshing' : 'loading', error: null }))
    try {
      const res = await api.getDonors(
        {
          group: group === ALL ? undefined : group,
          district: district === ALL ? undefined : district,
          availableOnly,
        },
        { signal: controller.signal },
      )
      setState({ status: 'ready', donors: res.data, meta: res.meta, error: null })
    } catch (err) {
      if (err.name === 'AbortError') return
      setState({ status: 'error', donors: [], meta: null, error: err })
    }
  }, [group, district, availableOnly])

  useEffect(() => {
    load()
    return () => abortRef.current?.abort()
  }, [load])

  useEffect(() => setLimit(PAGE), [group, district, availableOnly])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(null), 4200)
    return () => clearTimeout(t)
  }, [toast])

  const visible = state.donors.slice(0, limit)
  const districtLabel = useMemo(
    () => (district === ALL ? 'across Tamil Nadu' : reference.districts.find((d) => d.slug === district)?.name ?? ''),
    [district, reference.districts],
  )

  const handleRequest = (donor) => {
    setToast({
      title: `A coordinator will bridge you to ${donor.display_name}`,
      body: 'Prototype only — no message is actually sent. Contact sharing needs donor consent.',
    })
  }

  const resetAll = () => {
    setGroup(ALL)
    setDistrict(ALL)
    setAvailableOnly(false)
  }

  const isLoading = state.status === 'loading'

  return (
    <div className="relative">
      {/* ---------------------------------------------------------- controls */}
      <div className="card rounded-4xl p-5 shadow-lift sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl">Find a donor</h2>
            <p className="mt-1 text-[13px] text-ink/55 dark:text-bone/55">
              Verified voluntary donors {districtLabel}.
            </p>
          </div>
          <SampleTag>Prototype network</SampleTag>
        </div>

        {/* blood group chips */}
        <fieldset className="mt-5">
          <legend className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink/45 dark:text-bone/45">
            Blood group
          </legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select a blood group">
            <Chip active={group === ALL} onClick={() => setGroup(ALL)} label="Any" />
            {(reference.groups.length
              ? reference.groups
              : Array.from({ length: 8 }, (_, i) => ({ code: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'][i] }))
            ).map((g) => (
              <Chip
                key={g.code}
                active={group === g.code}
                onClick={() => setGroup(g.code)}
                label={g.code}
                rare={g.is_negative}
                reduced={reduced}
              />
            ))}
          </div>
        </fieldset>

        {/* district + toggle */}
        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label
              htmlFor="district-select"
              className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-ink/45 dark:text-bone/45"
            >
              District
            </label>
            <div className="relative">
              <select
                id="district-select"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-ink/12 bg-transparent px-4 py-3 pr-10 text-sm font-medium text-ink transition-colors hover:border-crimson/35 focus:border-crimson focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson dark:border-bone/15 dark:text-bone dark:hover:border-crimson/50 dark:focus:border-crimson"
              >
                <option value={ALL}>All districts</option>
                {reference.districts.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.name}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink/40 dark:text-bone/40"
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-ink/12 px-4 py-3 text-sm transition-colors hover:border-crimson/35 dark:border-bone/15 sm:justify-start">
            <span className="font-medium">Available now</span>
            <span className="relative inline-flex shrink-0">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="peer sr-only"
              />
              <span
                className="h-6 w-11 rounded-full bg-ink/15 transition-colors duration-300 peer-checked:bg-teal peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-crimson dark:bg-bone/20"
                aria-hidden="true"
              />
              <span
                className="absolute left-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-white shadow-sm transition-transform duration-300 ease-calm peer-checked:translate-x-5"
                aria-hidden="true"
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0F6B66" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 transition-opacity peer-checked:opacity-100">
                  <path d="m5 13 4 4L19 7" />
                </svg>
              </span>
            </span>
          </label>
        </div>
      </div>

      {/* ------------------------------------------------------- results head */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* the morphing drop: same mark as the hero, now carrying a label */}
          <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-crimson/8 text-crimson dark:bg-crimson/20 dark:text-[#FF8FA0]">
            <BloodDrop className="h-9 w-9 drop-shadow-sm" />
            <AnimatePresence initial={false}>
              <motion.span
                key={group}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.8 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, y: 2, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.8 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-bone px-1.5 py-[1px] font-display text-[10px] font-bold leading-tight text-crimson shadow-sm dark:bg-[#2A1B1E] dark:text-[#FF8FA0]"
              >
                {group === ALL ? 'Any' : group}
              </motion.span>
            </AnimatePresence>
          </div>
          <div>
            <p className="text-sm font-semibold" aria-live="polite">
              {isLoading
                ? 'Searching the network…'
                : `${state.donors.length} donor${state.donors.length === 1 ? '' : 's'} match`}
            </p>
            <p className="text-[12px] text-ink/50 dark:text-bone/50">
              {state.meta?.latency_ms ? `Matched in ${(state.meta.latency_ms / 1000).toFixed(2)}s` : 'Live network query'}
              {' · '}sorted by verified &amp; fastest
            </p>
          </div>
        </div>

        {state.status === 'refreshing' && (
          <span className="inline-flex items-center gap-2 text-[12px] text-ink/45 dark:text-bone/45">
            <motion.span
              animate={reduced ? undefined : { rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
              className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent"
              aria-hidden="true"
            />
            Updating
          </span>
        )}
      </div>

      {/* ------------------------------------------------------------ results */}
      <div className="mt-4 min-h-[280px]">
        {isLoading ? (
          <SkeletonGrid count={4} className="grid gap-3 sm:grid-cols-2" />
        ) : state.status === 'error' ? (
          <ErrorState
            message={state.error?.message}
            onRetry={load}
          />
        ) : visible.length === 0 ? (
          <EmptyState
            icon="search"
            title="No donors match yet"
            body={`No ${
              group === ALL ? '' : `${group} `
            }donors are currently available in ${districtLabel}. Matching donors every week — try neighbouring districts or switch off the availability filter.`}
            action="Widen the search"
            onAction={resetAll}
          />
        ) : (
          <motion.ul layout={!reduced} className="grid list-none gap-3 p-0 sm:grid-cols-2">
            <AnimatePresence initial={false}>
              {visible.map((donor, i) => (
                <DonorCard key={donor.donor_id} donor={donor} index={i} onRequest={handleRequest} reduced={reduced} />
              ))}
            </AnimatePresence>
          </motion.ul>
        )}

        {!isLoading && state.status !== 'error' && state.donors.length > limit && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setLimit((l) => l + PAGE)}
              className="rounded-full border border-ink/12 px-5 py-2.5 text-[13px] font-medium transition-colors hover:border-crimson/40 hover:text-crimson dark:border-bone/15 dark:hover:text-[#FF8FA0]"
            >
              Show {Math.min(PAGE, state.donors.length - limit)} more
            </button>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------- CTA */}
      <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-3xl bg-ink px-5 py-4 text-bone sm:flex-row sm:items-center sm:px-6">
        <p className="text-[13.5px] leading-snug text-bone/80">
          <span className="font-semibold text-bone">Not listed yet?</span> A donor record takes
          under two minutes and stays private until you consent.
        </p>
        <button
          type="button"
          onClick={onOpenRegister}
          className="shrink-0 rounded-full bg-crimson px-5 py-2.5 text-[13px] font-semibold text-white transition-transform duration-300 ease-calm hover:scale-[1.03] hover:bg-crimson-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Become a donor
        </button>
      </div>

      {/* ------------------------------------------------------------ toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-5 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl bg-ink px-4 py-3.5 text-bone shadow-lift sm:bottom-7"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-teal/20 text-teal">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m5 13 4 4L19 7" />
                </svg>
              </span>
              <div>
                <p className="text-[13px] font-semibold leading-tight">{toast.title}</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-bone/60">{toast.body}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Chip({ active, onClick, label, rare, reduced }) {
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={active}
      /* The "rare" superscript is decoration — keep the accessible name clean. */
      aria-label={rare ? `Blood group ${label}, rare` : `Blood group ${label}`}
      onClick={onClick}
      layout={!reduced}
      whileTap={reduced ? undefined : { scale: 0.93 }}
      transition={{ layout: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }, duration: 0.18 }}
      className={`relative rounded-full border px-3.5 py-2 font-display text-[13.5px] font-bold tracking-tight transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson ${
        active
          ? 'border-crimson bg-crimson text-white'
          : 'border-ink/12 text-ink/70 hover:border-crimson/40 hover:text-crimson dark:border-bone/15 dark:text-bone/70 dark:hover:border-crimson/60 dark:hover:text-[#FF8FA0]'
      }`}
    >
      {label}
      {rare && (
        <span
          className={`ml-1 align-super text-[8px] font-semibold uppercase tracking-wider ${
            active ? 'text-white/70' : 'text-crimson/60 dark:text-[#FF8FA0]/60'
          }`}
          aria-hidden="true"
        >
          rare
        </span>
      )}
    </motion.button>
  )
}
