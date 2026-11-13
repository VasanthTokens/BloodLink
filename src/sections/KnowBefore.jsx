import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Reveal, { SectionHeading } from '../components/Reveal'
import Picture from '../components/Picture'
import { check, close } from '../components/icons'

const EASE = [0.22, 1, 0.36, 1]

const ELIGIBILITY = {
  yes: [
    'Aged 18–65, weighing at least 50 kg',
    'Haemoglobin 12.5 g/dL or above',
    'At least 90 days since your last whole-blood donation',
    'Feeling well on the day — no fever in the past week',
    'No tattoo, piercing or major surgery in the last 6 months',
    'Not pregnant, and at least 6 months post-delivery',
  ],
  no: [
    'Active infection or antibiotics in the last 7 days',
    'On insulin for diabetes, or uncontrolled hypertension',
    'History of hepatitis B/C, HIV or syphilis',
    'Cancer treatment (most cases — a doctor decides)',
    'Alcohol within 24 hours of donating',
    'Donated platelets in the last 14 days',
  ],
}

const TIMELINE = [
  { t: '0 min', title: 'Register & screen', body: 'A short form, a finger-prick haemoglobin check and a private conversation about your health. About 15 minutes total.' },
  { t: '20 min', title: 'The donation', body: 'One needle, one single-use kit. 350–450 ml, roughly 8–12 minutes. Most donors read or talk through it.' },
  { t: '35 min', title: 'Rest & refreshment', body: 'Ten minutes seated, juice and a snack, and a bandage that comes off in four hours. No driving a two-wheeler for 30 minutes.' },
  { t: 'Day 2', title: 'Your unit is screened', body: 'Group, Rh and five infection screens. You are contacted only if something needs follow-up.' },
  { t: 'Day 3+', title: 'Someone receives it', body: 'Red cells, plasma and platelets can reach three different patients. You will never know their names — that is the point.' },
]

const MYTHS = [
  {
    myth: 'Donating blood makes you weak.',
    fact: 'Your body replaces the plasma volume within 24 hours and the red cells within a few weeks. Most donors go back to work the same day, having eaten normally.',
    image: 'camp-college',
    alt: 'Students queue beside folding beds at a college blood donation camp in a sunlit hall with ceiling fans.',
  },
  {
    myth: 'It hurts a lot.',
    fact: 'You feel the initial pinch of the needle — comparable to a vaccination — and nothing after that. The needle is removed before you notice it.',
    image: 'journey-donor',
    alt: 'A donor reclines in a chair holding a squeezy ball, relaxed, with tubing running to a blood bag beside him.',
  },
  {
    myth: 'I am too old to start.',
    fact: 'If you are between 18 and 65 and healthy, you can start at any age. Regular donors above 60 simply need a physician’s clearance.',
    image: 'volunteers-refresh',
    alt: 'Volunteers in aprons hand a tumbler of juice and a snack to a seated donor at a camp table.',
  },
  {
    myth: 'My blood group is common, so nobody needs it.',
    fact: 'O+ and B+ are common — and therefore in constant demand. Rare groups are not more urgent; they are just harder to find.',
    image: 'bank-fridge',
    alt: 'A gloved hand reaches into a lit blood bank refrigerator holding rows of sealed blood bags.',
  },
  {
    myth: 'I will catch an infection.',
    fact: 'Every kit is sterile, single-use and opened in front of you. There is no route for transmission when standard practice is followed.',
    image: 'nurse-prep',
    alt: 'A nurse prepares a sterile donation kit on a steel tray before a donation.',
  },
]

export default function KnowBefore() {
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(0)
  const [tab, setTab] = useState('yes')

  return (
    <section
      id="know"
      aria-labelledby="know-title"
      className="relative overflow-hidden bg-[var(--surface-sunk)] py-20 sm:py-28"
    >
      <div className="shell">
        <SectionHeading
          id="know-title"
          eyebrow="Know before you donate"
          title={
            <>
              Clear answers,
              <br />
              not folklore.
            </>
          }
          intro="Most people who never donate are not unwilling — they are unsure. Here is what actually determines eligibility, exactly how the appointment runs, and the myths worth retiring."
        />

        {/* ------------------------------------------------------- eligibility */}
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="card rounded-4xl p-5 sm:p-7">
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-teal/12 text-teal">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m4 12.5 5 5L20 6.5" />
                </svg>
              </span>
              <h3 className="text-[19px]">You can probably donate if…</h3>
            </div>
            <ul className="mt-4 space-y-2.5">
              {ELIGIBILITY.yes.map((t, i) => (
                <Reveal as="li" key={t} delay={i * 0.04} y={10} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-ink/75 dark:text-bone/75">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" aria-hidden="true" />
                  {t}
                </Reveal>
              ))}
            </ul>
          </div>

          <div className="card rounded-4xl p-5 sm:p-7">
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-crimson/10 text-crimson dark:text-[#FF8FA0]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </span>
              <h3 className="text-[19px]">Please wait, or ask a doctor, if…</h3>
            </div>
            <ul className="mt-4 space-y-2.5">
              {ELIGIBILITY.no.map((t, i) => (
                <Reveal as="li" key={t} delay={i * 0.04} y={10} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-ink/75 dark:text-bone/75">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-crimson/50" aria-hidden="true" />
                  {t}
                </Reveal>
              ))}
            </ul>
            <p className="mt-4 border-t border-current/10 pt-4 text-[11.5px] leading-relaxed text-ink/45 dark:text-bone/45">
              This is general guidance, not a medical decision. A trained screener assesses you on the
              day, and their answer is the one that counts.
            </p>
          </div>
        </div>

        {/* --------------------------------------------------------- timeline */}
        <div className="mt-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div className="lg:order-2">
            <Picture
              name="volunteers-refresh"
              alt="Two volunteers hand a steel tumbler of juice and a biscuit packet to a seated donor at a refreshment table after a donation."
              className="rounded-4xl"
              rounded="rounded-4xl"
              sizes="(max-width: 1024px) 100vw, 50vw"
              parallax={22}
              aspect="4 / 3"
            />
            <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-current/10 px-4 py-3">
              <p className="text-[12px] leading-snug text-ink/55 dark:text-bone/55">
                Refreshments are not a formality — they prevent dizziness.
              </p>
              <span className="shrink-0 rounded-full bg-teal/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-teal">
                15 min wait
              </span>
            </div>
          </div>

          <div className="lg:order-1">
            <p className="eyebrow">The procedure, minute by minute</p>
            <h3 className="mt-3 text-[clamp(1.6rem,4vw,2.2rem)] leading-[1.04]">
              What actually happens
              <br />
              when you sit down.
            </h3>

            <ol className="relative mt-7 space-y-1">
              <span
                className="absolute bottom-4 left-[13px] top-4 w-px bg-gradient-to-b from-crimson/50 via-crimson/25 to-transparent"
                aria-hidden="true"
              />
              {TIMELINE.map((step, i) => (
                <Reveal as="li" key={step.title} delay={i * 0.06} y={14} className="group relative flex gap-4 rounded-2xl px-1 py-3.5 transition-colors hover:bg-ink/[0.03] dark:hover:bg-bone/[0.04]">
                  <span className="relative z-10 mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-crimson/30 bg-[var(--surface-sunk)] text-[10px] font-bold text-crimson transition-colors group-hover:bg-crimson group-hover:text-white dark:text-[#FF8FA0]">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-display text-[10.5px] font-bold uppercase tracking-[0.16em] text-crimson/70 dark:text-[#FF8FA0]/70">
                      {step.t}
                    </p>
                    <h4 className="mt-1 text-[15.5px] leading-tight">{step.title}</h4>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-ink/60 dark:text-bone/60">{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>

        {/* ------------------------------------------------------------- myths */}
        <div className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Myths versus facts</p>
              <h3 className="mt-3 text-[clamp(1.6rem,4vw,2.2rem)] leading-[1.04]">
                Five things people
                <br className="hidden sm:block" /> still believe.
              </h3>
            </div>
            <p className="max-w-xs text-[12px] leading-relaxed text-ink/45 dark:text-bone/45">
              Tap a statement to see the fact and the room it happens in.
            </p>
          </div>

          <div className="mt-7 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <ul className="list-none space-y-2.5 p-0">
              {MYTHS.map((m, i) => {
                const isOpen = open === i
                return (
                  <li key={m.myth} className="card overflow-hidden rounded-2xl">
                    <h4>
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? -1 : i)}
                        aria-expanded={isOpen}
                        aria-controls={`myth-panel-${i}`}
                        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-ink/[0.02] dark:hover:bg-bone/[0.03]"
                      >
                        <span className="flex items-start gap-3">
                          <span className="mt-0.5 font-display text-[11px] font-bold text-crimson/50 dark:text-[#FF8FA0]/50">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className={`text-[14px] leading-snug transition-colors ${isOpen ? 'font-semibold text-crimson dark:text-[#FF8FA0]' : ''}`}>
                            “{m.myth}”
                          </span>
                        </span>
                        <motion.span
                          animate={{ rotate: isOpen ? 45 : 0 }}
                          transition={{ duration: 0.35, ease: EASE }}
                          className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current/15 text-ink/50 dark:text-bone/50"
                          aria-hidden="true"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        </motion.span>
                      </button>
                    </h4>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`myth-panel-${i}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: reduced ? 0.01 : 0.45, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-current/10 px-4 py-4">
                            <p className="text-[13px] leading-relaxed text-ink/70 dark:text-bone/70">{m.fact}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                )
              })}
            </ul>

            {/* the photo swaps with the open myth — the fact gets a place */}
            <div className="relative min-h-[260px]">
              <div className="sticky top-24">
                <div className="relative overflow-hidden rounded-4xl" style={{ aspectRatio: '4 / 3.4' }}>
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={MYTHS[Math.max(0, open)]?.image ?? 'none'}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: reduced ? 0.01 : 0.6, ease: EASE }}
                      className="absolute inset-0"
                    >
                      <Picture
                        name={MYTHS[Math.max(0, open)]?.image ?? 'camp-college'}
                        alt={MYTHS[Math.max(0, open)]?.alt ?? 'A blood donation camp in progress.'}
                        aspect="auto"
                        className="!h-full !aspect-none h-full w-full"
                        sizes="(max-width: 1024px) 100vw, 38vw"
                        reveal={false}
                        overlay={
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-5 pt-16">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#FF8FA0]">
                              Fact {open >= 0 ? String(open + 1).padStart(2, '0') : '—'}
                            </p>
                            <p className="mt-1 text-[13px] leading-snug text-bone/85">
                              {MYTHS[Math.max(0, open)]?.fact.split('.')[0]}.
                            </p>
                          </div>
                        }
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <p className="mt-3 text-[10.5px] uppercase tracking-[0.14em] text-ink/30 dark:text-bone/30">
                  Photographs are illustrative, set in Tamil Nadu
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
