import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { api } from '../services/api'
import { SectionHeading } from '../components/Reveal'
import TamilNaduMap from '../components/TamilNaduMap'

/* Leaflet + its CSS (~150 kB) is code-split and only fetched when the reader
   actually reaches the network section, so the hero stays light. */
const TamilNaduLeafletMap = lazy(() => import('../components/TamilNaduLeafletMap'))
import Picture from '../components/Picture'
import { ErrorState, SkeletonCard, StockChip, SampleTag } from '../components/States'

const GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

/**
 * BLOOD BANK NETWORK
 * The map and the directory share one selection, so hovering a district on the
 * map filters the directory and choosing a bank highlights its district. This
 * is the section where the network stops being a list and becomes a place.
 */
export default function BloodBankNetwork() {
  const reduced = useReducedMotion()
  const [state, setState] = useState({ status: 'loading', banks: [], error: null })
  const [district, setDistrict] = useState(null)
  /* 'live' → real Leaflet/OSM tiles. 'outline' → the vector diagram. The live
     map only takes over once a tile has genuinely painted; until then (or if
     tiles are blocked) the diagram stays on screen. */
  const [mapMode, setMapMode] = useState('live')
  const [tilesReady, setTilesReady] = useState(false)
  const [mapFailed, setMapFailed] = useState(false)
  const [group, setGroup] = useState('O+')
  const [selectedBank, setSelectedBank] = useState(null)

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: s.banks.length ? 'ready' : 'loading', error: null }))
    try {
      const res = await api.getBanks({ district: district ?? undefined, group })
      setState({ status: 'ready', banks: res.data, error: null })
    } catch (err) {
      setState({ status: 'error', banks: [], error: err })
    }
  }, [district, group])

  useEffect(() => {
    load()
  }, [load])

  /* The map needs all districts regardless of the current filter, so derive
     its markers from the unfiltered snapshot once. */
  const [allBanks, setAllBanks] = useState([])
  useEffect(() => {
    let alive = true
    api.getBanks({ group }).then((res) => {
      if (alive) setAllBanks(res.data)
    })
    return () => {
      alive = false
    }
  }, [group])

  const markers = useMemo(() => {
    const byDistrict = new Map()
    for (const b of allBanks) {
      const entry = byDistrict.get(b.district_slug) ?? {
        slug: b.district_slug,
        name: b.district_name,
        banks: 0,
        has_bank: false,
      }
      entry.banks += 1
      entry.has_bank = entry.has_bank || (b.stock_units[group] ?? 0) >= 5
      byDistrict.set(b.district_slug, entry)
    }
    return [...byDistrict.values()].map((d) => ({ ...d, lat: 0, lon: 0 }))
  }, [allBanks, group])

  /* Merge lat/lon from the reference endpoint (map data is geography, not mock
     records — but it still arrives through a service, not an import). */
  const [districts, setDistricts] = useState([])
  const [geometry, setGeometry] = useState(null)
  useEffect(() => {
    let alive = true
    api.getReference().then(({ data }) => alive && setDistricts(data.districts))
    api.getMapGeometry().then(({ data }) => alive && setGeometry(data))
    return () => {
      alive = false
    }
  }, [])

  const mergedMarkers = useMemo(
    () =>
      markers
        .map((m) => {
          const geo = districts.find((d) => d.slug === m.slug)
          return geo ? { ...m, lat: geo.lat, lon: geo.lon } : null
        })
        .filter(Boolean),
    [markers, districts],
  )

  const totalUnits = state.banks.reduce((a, b) => a + (b.stock_units[group] ?? 0), 0)
  const openBanks = state.banks.filter((b) => (b.stock_units[group] ?? 0) > 0).length

  return (
    <section
      id="network"
      aria-labelledby="network-title"
      className="relative overflow-hidden bg-[var(--surface-sunk)] py-20 sm:py-28"
    >
      <div className="shell">
        <SectionHeading
          id="network-title"
          eyebrow="Blood bank network"
          title={
            <>
              Where the units
              <br />
              actually are.
            </>
          }
          intro="Eight licensed centres and hospital blood banks, 338 km apart at their furthest. Choose a group to see live stock, or a district to narrow the map."
        >
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <SampleTag>Sample stock levels</SampleTag>
            <span className="text-[11px] text-ink/45 dark:text-bone/45">
              Stock is indicative and refreshes hourly in production
            </span>
          </div>
        </SectionHeading>

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10">
          {/* ------------------------------------------------------- map card */}
          <div className="card relative self-start rounded-4xl p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink/45 dark:text-bone/45">
                Coverage · Tamil Nadu
              </p>
              <div className="flex items-center gap-3 text-[10.5px] text-ink/50 dark:text-bone/50">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-teal" aria-hidden="true" /> stock available
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-crimson" aria-hidden="true" /> donors only
                </span>
              </div>
            </div>

            {/* ------------------------------------------------- map stack */}
            <div className="relative mt-3 h-[300px] overflow-hidden rounded-3xl sm:h-[420px]">
              {mapMode === 'live' && !mapFailed && (
                <Suspense fallback={null}>
                  <TamilNaduLeafletMap
                    districts={mergedMarkers}
                    geometry={geometry}
                    activeSlug={district ?? selectedBank?.district_slug}
                    onSelect={(slug) => {
                      setDistrict(slug)
                      setSelectedBank(null)
                    }}
                    onReady={() => {
                      setTilesReady(true)
                      setMapFailed(false)
                    }}
                    onUnavailable={() => {
                      setMapFailed(true)
                      setTilesReady(false)
                    }}
                    className={`absolute inset-0 transition-opacity duration-700 ease-calm ${
                      tilesReady ? 'opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                  />
                </Suspense>
              )}

              {/* Vector fallback: also the explicit "diagram" view. */}
              {((!tilesReady && !mapFailed) || mapMode === 'outline' || mapFailed) && (
                <div
                  className={`absolute inset-0 grid place-items-center bg-[var(--surface)] px-2 transition-opacity duration-500 ${
                    mapMode === 'outline' ? 'opacity-100' : 'opacity-100'
                  }`}
                >
                  <TamilNaduMap
                    districts={mergedMarkers}
                    geometry={geometry}
                    activeSlug={district ?? selectedBank?.district_slug}
                    className="w-full text-ink dark:text-bone"
                    onSelect={(slug) => {
                      setDistrict((d) => (d === slug ? null : slug))
                      setSelectedBank(null)
                    }}
                  />
                </div>
              )}
            </div>

            {/* view switch */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div
                className="inline-flex rounded-full border border-ink/12 p-0.5 dark:border-bone/15"
                role="group"
                aria-label="Map style"
              >
                {[
                  ['live', 'Live map'],
                  ['outline', 'Outline'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setMapMode(value)
                      if (value === 'live' && mapFailed) {
                        setMapFailed(false)
                        setTilesReady(false)
                      }
                    }}
                    aria-pressed={mapMode === value}
                    className={`rounded-full px-3 py-1.5 text-[11.5px] font-medium transition-colors duration-300 ${
                      mapMode === value
                        ? 'bg-ink text-bone dark:bg-bone dark:text-ink'
                        : 'text-ink/55 hover:text-ink dark:text-bone/55 dark:hover:text-bone'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-[10.5px] text-ink/40 dark:text-bone/40">
                {mapMode === 'outline'
                  ? 'Stylised outline'
                  : mapFailed
                    ? 'Tiles unreachable — showing outline'
                    : tilesReady
                      ? 'Leaflet · OpenStreetMap'
                      : 'Loading tiles — showing outline'}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-current/10 pt-4">
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setDistrict(null)}
                  className={`rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-colors ${
                    !district
                      ? 'border-crimson bg-crimson text-white'
                      : 'border-ink/12 text-ink/60 hover:border-crimson/40 dark:border-bone/15 dark:text-bone/60'
                  }`}
                >
                  All districts
                </button>
                {mergedMarkers.slice(0, 4).map((d) => (
                  <button
                    key={d.slug}
                    type="button"
                    onClick={() => setDistrict((cur) => (cur === d.slug ? null : d.slug))}
                    className={`rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-colors ${
                      district === d.slug
                        ? 'border-crimson bg-crimson text-white'
                        : 'border-ink/12 text-ink/60 hover:border-crimson/40 dark:border-bone/15 dark:text-bone/60'
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-ink/40 dark:text-bone/40">Tap a marker to filter</p>
            </div>
          </div>

          {/* ------------------------------------------------- directory side */}
          <div>
            {/* group chooser drives the stock chips */}
            <div className="card rounded-3xl p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink/45 dark:text-bone/45">
                  Stock for
                </p>
                <div className="flex items-center gap-4 text-[12px]">
                  <span className="text-ink/60 dark:text-bone/60">
                    <strong className="font-display text-[15px] font-bold text-ink dark:text-bone">
                      {state.status === 'ready' ? totalUnits : '—'}
                    </strong>{' '}
                    units
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-teal">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden="true" />
                    {openBanks}/{state.banks.length} open
                  </span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Blood group for stock view">
                {GROUPS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    role="radio"
                    aria-checked={group === g}
                    onClick={() => setGroup(g)}
                    className={`min-w-[2.85rem] rounded-lg border px-2 py-1.5 font-display text-[12px] font-bold transition-all duration-300 ease-calm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson ${
                      group === g
                        ? 'border-ink bg-ink text-bone dark:border-bone dark:bg-bone dark:text-ink'
                        : 'border-ink/12 text-ink/65 hover:border-crimson/40 hover:text-crimson dark:border-bone/15 dark:text-bone/65'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              {state.status === 'loading' && (
                <div className="space-y-3" aria-busy="true" aria-live="polite">
                  <span className="sr-only">Loading blood banks…</span>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} lines={2} />
                  ))}
                </div>
              )}

              {state.status === 'error' && <ErrorState onRetry={load} message={state.error?.message} />}

              {state.status === 'ready' && state.banks.length === 0 && (
                <div className="card rounded-3xl p-8 text-center">
                  <p className="text-[15px] font-semibold">No banks in this district yet</p>
                  <p className="mt-2 text-[13px] text-ink/55 dark:text-bone/55">
                    The nearest verified centres are listed when you widen the filter.
                  </p>
                  <button
                    type="button"
                    onClick={() => setDistrict(null)}
                    className="mt-4 rounded-full border border-ink/15 px-4 py-2 text-[12.5px] font-medium dark:border-bone/20"
                  >
                    Show all districts
                  </button>
                </div>
              )}

              <ul className="list-none space-y-3 p-0">
                <AnimatePresence initial={false}>
                  {state.banks.map((b, i) => (
                    <motion.li
                      key={b.bank_id}
                      layout={!reduced}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ delay: reduced ? 0 : i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className={`card group rounded-3xl p-4 transition-colors duration-300 sm:p-5 ${
                        selectedBank?.bank_id === b.bank_id ? 'border-crimson/45' : 'hover:border-crimson/25'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBank((s) => (s?.bank_id === b.bank_id ? null : b))
                          setDistrict(b.district_slug)
                        }}
                        aria-expanded={selectedBank?.bank_id === b.bank_id}
                        className="w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-crimson"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-[15px] leading-tight">{b.name}</h3>
                            <p className="mt-1 text-[12px] text-ink/55 dark:text-bone/55">
                              {b.area} · {b.district_name}
                            </p>
                          </div>
                          <span className="flex shrink-0 flex-col items-end gap-1">
                            <span className="inline-flex items-center gap-1 rounded-full border border-teal/25 bg-teal/10 px-2 py-0.5 text-[10px] font-medium text-teal">
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="m5 13 4 4L19 7" />
                              </svg>
                              Verified
                            </span>
                            <span className="text-[10px] text-ink/40 dark:text-bone/40">{b.open_hours}</span>
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {GROUPS.map((g) => (
                            <StockChip
                              key={g}
                              group={g}
                              units={b.stock_units[g] ?? 0}
                              status={b.stock_status[g]}
                              selected={g === group}
                            />
                          ))}
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {selectedBank?.bank_id === b.bank_id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-current/10 pt-4 text-[11.5px]">
                              <div>
                                <dt className="text-ink/45 dark:text-bone/45">Type</dt>
                                <dd className="mt-0.5 font-medium">{b.type}</dd>
                              </div>
                              <div>
                                <dt className="text-ink/45 dark:text-bone/45">Component separation</dt>
                                <dd className="mt-0.5 font-medium">{b.component_separation ? 'Yes' : 'No'}</dd>
                              </div>
                              <div>
                                <dt className="text-ink/45 dark:text-bone/45">Cold chain</dt>
                                <dd className="mt-0.5 font-medium text-teal">
                                  {b.cold_chain_ok ? 'Continuous, logged' : 'Not logged'}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-ink/45 dark:text-bone/45">Last updated</dt>
                                <dd className="mt-0.5 font-medium">{b.last_updated}</dd>
                              </div>
                            </dl>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------- photographic break */}
        <div className="mt-16 grid items-center gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <Picture
            name="bank-fridge"
            alt="A gloved hand reaches into a lit blood bank refrigerator holding rows of sealed blood bags on wire shelves, a temperature display glowing blue."
            className="rounded-4xl"
            rounded="rounded-4xl"
            sizes="(max-width: 1024px) 100vw, 55vw"
            parallax={26}
          />
          <div>
            <p className="eyebrow">Cold chain, unglamorous and vital</p>
            <h3 className="mt-3 text-[clamp(1.6rem,3.6vw,2.4rem)] leading-[1.02]">
              A unit is only useful if it is still alive when it arrives.
            </h3>
            <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-ink/65 dark:text-bone/65">
              Blood is not a warehouse good. Red cells need 2–6 °C, platelets need constant gentle
              agitation, plasma needs −30 °C. BloodLink surfaces cold-chain status for every centre so a
              coordinator can decide in seconds whether a unit is worth the trip.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ['2–6 °C', 'Red cell storage, continuously logged'],
                ['−30 °C', 'Fresh frozen plasma, 12 months'],
                ['5 days', 'Platelet shelf life, agitated'],
                ['100%', 'Units screened before release'],
              ].map(([v, l]) => (
                <li key={v} className="rounded-2xl border border-current/10 px-4 py-3">
                  <p className="font-display text-[17px] font-bold leading-none">{v}</p>
                  <p className="mt-1.5 text-[11.5px] leading-tight text-ink/50 dark:text-bone/50">{l}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
