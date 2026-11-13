import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Picture from '../components/Picture'
import BloodCellField from '../components/BloodCellField'
import FindDonorTool from '../components/FindDonorTool'
import { BloodDrop } from '../components/BloodDrop'
import { scrollToId } from '../hooks/useLenis'
import { arrowDown } from '../components/icons'

const EASE = [0.22, 1, 0.36, 1]
const SEEN_KEY = 'bloodlink-hero-played'

/**
 * HERO — the drop falls, lands, ripples, and the photograph opens underneath.
 * Plays once per browser session; afterwards the page simply starts composed.
 */
export default function Hero({ onOpenRegister }) {
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState('idle') // idle → falling → rippled → done

  useEffect(() => {
    if (reduced) {
      setPhase('done')
      return undefined
    }
    let seen = false
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === '1'
    } catch (e) {
      /* ignore */
    }
    if (seen) {
      setPhase('done')
      return undefined
    }
    const t1 = setTimeout(() => setPhase('falling'), 240)
    const t2 = setTimeout(() => setPhase('rippled'), 1080)
    const t3 = setTimeout(() => {
      setPhase('done')
      try {
        sessionStorage.setItem(SEEN_KEY, '1')
      } catch (e) {
        /* ignore */
      }
    }, 2900)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [reduced])

  const revealOpen = phase === 'rippled' || phase === 'done'
  const showDrop = phase === 'falling'

  return (
    <section
      id="find-donor"
      aria-labelledby="hero-title"
      className="relative isolate min-h-[100svh] overflow-hidden bg-[#140D0F] pb-16 pt-[76px] text-bone sm:pb-20"
    >
      {/* ------------------------------------------------ photograph + grade */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="h-full w-full"
          initial={false}
          animate={{ opacity: phase === 'idle' ? 0 : 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="h-full w-full"
            animate={
              revealOpen
                ? { clipPath: 'circle(148% at 46% 30%)' }
                : { clipPath: 'circle(0% at 46% 30%)' }
            }
            transition={{ duration: 1.6, ease: EASE }}
          >
            <Picture
              name="hero"
              alt="A woman donating blood reclines in a blue donation chair while a nurse in blue scrubs adjusts the tubing, a filled blood bag resting on the trolley in front of them."
              aspect="auto"
              sizes="100vw"
              priority
              reveal={false}
              kenBurns
              className="!h-full !aspect-none min-h-full w-full"
              imgClassName="object-cover object-[62%_center] sm:object-center"
              overlayClassName=""
              overlay={
                <>
                  {/* crimson tint + legibility scrim — the "grade" is baked
                      into the files, this is the story's colour wash */}
                  <div className="absolute inset-0 bg-[#5C0A17]/45 mix-blend-multiply" aria-hidden="true" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#140D0F] via-[#140D0F]/82 to-[#140D0F]/25" aria-hidden="true" />
                  <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#140D0F] to-transparent" aria-hidden="true" />
                </>
              }
            />
          </motion.div>
        </motion.div>

        <BloodCellField count={14} opacity={0.5} className="-z-10" />

        {/* ripple rings released from the landing point */}
        <AnimatePresence>
          {phase === 'rippled' && !reduced && (
            <div className="absolute left-[46%] top-[30%]" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 0 }}
                  transition={{ duration: 2.2, delay: i * 0.16, ease: [0.16, 0.84, 0.3, 1] }}
                  className="absolute left-1/2 top-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FF8FA0]/40 will-change-transform"
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* --------------------------------------------------- the falling drop */}
      <AnimatePresence>
        {showDrop && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex justify-center" aria-hidden="true">
            <motion.div
              initial={{ y: -160, scaleY: 1.35, opacity: 0 }}
              animate={{ y: '39svh', scaleY: 1, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.82, ease: [0.5, 0, 0.9, 0.6] }}
              className="relative text-crimson drop-shadow-[0_6px_18px_rgba(179,18,43,.55)] will-change-transform"
            >
              <BloodDrop className="h-10 w-10" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------ content */}
      <div className="shell relative z-10 pt-10 sm:pt-14">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:gap-10">
          {/* -------------------------------------------------- left column */}
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.8, ease: EASE }}
              className="inline-flex items-center gap-2 rounded-full border border-bone/20 bg-bone/5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-bone/75 backdrop-blur"
            >
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal" />
              </span>
              Tamil Nadu voluntary network
            </motion.p>

            <h1
              id="hero-title"
              className="mt-5 font-display text-[clamp(2.85rem,8.2vw,5.4rem)] font-bold leading-[0.9] tracking-tightest text-bone"
            >
              <Line delay={0.28}>Every drop</Line>
              <Line delay={0.38}>
                connects <span className="relative inline-block text-[#FF8FA0]">a life<DropDot /></span>
              </Line>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.9, ease: EASE }}
              className="mt-5 max-w-md text-[15px] leading-relaxed text-bone/70 sm:text-[16.5px]"
            >
              BloodLink links voluntary donors to verified hospital requests and licensed blood
              banks across Tamil Nadu — so the right unit reaches the right ward in hours, not days.
            </motion.p>

            <motion.p
              lang="ta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75, duration: 0.9 }}
              className="mt-3 max-w-md text-[14px] leading-relaxed text-bone/55"
            >
              ஒவ்வொரு துளியும் ஒரு உயிரை இணைக்கிறது.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.72, duration: 0.9, ease: EASE }}
              className="mt-7 flex flex-wrap items-center gap-3"
            >
              <button
                type="button"
                onClick={() => scrollToId('urgent')}
                className="group inline-flex items-center gap-2 rounded-full bg-crimson px-5 py-3 text-[13.5px] font-semibold text-white shadow-tactile transition-all duration-300 ease-calm hover:bg-crimson-600 hover:shadow-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                See urgent requests
                <span className="transition-transform duration-300 ease-calm group-hover:translate-x-1" aria-hidden="true">
                  →
                </span>
              </button>
              <button
                type="button"
                onClick={onOpenRegister}
                className="inline-flex items-center gap-2 rounded-full border border-bone/25 px-5 py-3 text-[13.5px] font-semibold text-bone transition-colors duration-300 hover:border-bone/50 hover:bg-bone/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Register in 2 minutes
              </button>
            </motion.div>

            <motion.dl
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 1 }}
              className="mt-9 grid max-w-md grid-cols-3 gap-4 border-t border-bone/12 pt-5"
            >
              {[
                ['12,847', 'donors registered'],
                ['64', 'hospitals onboard'],
                ['24 min', 'median match'],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-display text-[19px] font-bold leading-none tracking-tight text-bone sm:text-[22px]">
                    {v}
                  </dt>
                  <dd className="mt-1.5 text-[11px] leading-tight text-bone/50">{l}</dd>
                </div>
              ))}
            </motion.dl>
          </div>

          {/* ------------------------------------------------- right column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.82, duration: 1, ease: EASE }}
            className="relative lg:-mb-24"
          >
            <FindDonorTool onOpenRegister={onOpenRegister} />
          </motion.div>
        </div>

        <button
          type="button"
          onClick={() => scrollToId('journey')}
          className="mt-10 hidden items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-bone/45 transition-colors hover:text-bone/80 lg:inline-flex"
        >
          <motion.span
            animate={reduced ? undefined : { y: [0, 5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            {arrowDown}
          </motion.span>
          Scroll to follow the drop
        </button>
      </div>
    </section>
  )
}

/** Headline line that rises into place and is clipped by its own line box. */
function Line({ children, delay = 0 }) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span
        className="block"
        initial={{ y: '108%' }}
        animate={{ y: '0%' }}
        transition={{ delay, duration: 1.05, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  )
}

/** The dot the drop lands on — it pulses once the drop arrives. */
function DropDot() {
  return (
    <motion.span
      aria-hidden="true"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1.05, duration: 0.5, ease: EASE }}
      className="absolute -right-[0.18em] bottom-[0.16em] inline-block h-[0.17em] w-[0.17em] rounded-full bg-[#FF8FA0]"
    >
      <motion.span
        className="absolute inset-0 rounded-full bg-[#FF8FA0]"
        animate={{ scale: [1, 2.6], opacity: [0.6, 0] }}
        transition={{ delay: 1.2, duration: 1.6, repeat: Infinity, repeatDelay: 1.4, ease: 'easeOut' }}
      />
    </motion.span>
  )
}
