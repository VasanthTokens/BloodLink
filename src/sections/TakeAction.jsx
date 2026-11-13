import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Picture from '../components/Picture'
import { MagneticButton } from '../components/MagneticButton'
import Reveal from '../components/Reveal'
import { api } from '../services/api'

const EASE = [0.22, 1, 0.36, 1]

/**
 * TAKE ACTION — full-bleed photograph, three real intents.
 * "Share a request" opens a small inline composer that hits POST /camps-equivalent
 * (requestCamp) so the third button does something rather than nothing.
 */
export default function TakeAction({ onOpenRegister }) {
  const [share, setShare] = useState(false)
  const [sent, setSent] = useState(false)
  const [campOpen, setCampOpen] = useState(false)
  const [campSent, setCampSent] = useState(false)
  const [campSubmitting, setCampSubmitting] = useState(false)

  const submitCamp = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const payload = Object.fromEntries(new FormData(form).entries())
    payload.expected_donors = Number(payload.expected_donors)
    payload.submitted_at = new Date().toISOString()
    setCampSubmitting(true)
    try {
      await api.requestCamp(payload)
      setCampSent(true)
      form.reset()
    } catch (err) {
      alert('Could not submit the camp request. Please try again.')
    } finally {
      setCampSubmitting(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setSent(true)
    try {
      await api.requestCamp({ intent: 'share_request', submitted_at: new Date().toISOString() })
    } catch (err) {
      /* prototype — optimistic */
    }
  }

  return (
    <section id="act" aria-labelledby="act-title" className="relative isolate min-h-[72svh] overflow-hidden">
      <Picture
        name="cta-hands"
        alt="A gloved hand presses a cotton swab and small bandage onto a donor's arm after the needle is removed, with a single drop of blood on the gauze."
        aspect="auto"
        sizes="100vw"
        priority={false}
        reveal
        parallax={40}
        className="!aspect-auto absolute inset-0"
        overlayClassName=""
        overlay={
          <>
            <div className="absolute inset-0 bg-[#5C0A17]/70 mix-blend-multiply" aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#140D0F] via-[#140D0F]/60 to-[#140D0F]/80" aria-hidden="true" />
          </>
        }
      />

      <div className="shell relative z-10 py-24 text-bone sm:py-32">
        <div className="max-w-3xl">
          <Reveal as="p" className="eyebrow !text-[#FF8FA0]">
            <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
            Take action
          </Reveal>

          <Reveal
            as="h2"
            id="act-title"
            delay={0.06}
            className="mt-4 text-[clamp(2.4rem,7vw,4.6rem)] leading-[0.92] tracking-tightest"
          >
            Somewhere in Tamil Nadu,
            <br />
            <span className="text-[#FF8FA0]">a bag is running low.</span>
          </Reveal>

          <Reveal
            as="p"
            delay={0.12}
            className="mt-5 max-w-lg text-[15px] leading-relaxed text-bone/70 sm:text-[16.5px]"
          >
            Register once. Get a call only when your group and your district actually match. Or bring
            the network to your workplace, college or apartment — a camp takes one afternoon to organise.
          </Reveal>

          <Reveal delay={0.18} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <MagneticButton
              onClick={onOpenRegister}
              className="rounded-full bg-crimson px-7 py-4 text-[14px] font-semibold text-white shadow-tactile hover:bg-crimson-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              strength={9}
            >
              Register as a donor
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </MagneticButton>

            <MagneticButton
              onClick={() => {
                setCampOpen((value) => !value)
                setCampSent(false)
              }}
              aria-expanded={campOpen}
              className="rounded-full bg-bone px-7 py-4 text-[14px] font-semibold text-ink hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              strength={9}
            >
              {campOpen ? 'Close camp form' : 'Host a camp'}
            </MagneticButton>

            <MagneticButton
              onClick={() => {
                setShare((s) => !s)
                setSent(false)
              }}
              aria-expanded={share}
              className="rounded-full border border-bone/30 px-7 py-4 text-[14px] font-semibold text-bone hover:border-bone/60 hover:bg-bone/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              strength={9}
            >
              Share a request
            </MagneticButton>
          </Reveal>

          {/* Host-a-camp submission form */}
          <AnimatePresence initial={false}>
            {campOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: 10 }}
                animate={{ height: 'auto', opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: 10 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="mt-5 max-w-2xl rounded-3xl border border-bone/20 bg-bone/[0.07] p-5 backdrop-blur sm:p-7">
                  {campSent ? (
                    <div role="status" className="rounded-2xl border border-teal/30 bg-teal/10 p-5 text-bone">
                      <p className="font-display text-xl font-semibold">Camp request received!</p>
                      <p className="mt-2 text-sm leading-relaxed text-bone/70">
                        Thank you. This is a prototype submission; no real coordinator has been notified.
                      </p>
                      <button type="button" onClick={() => setCampSent(false)} className="mt-4 rounded-full border border-bone/25 px-4 py-2 text-xs font-semibold hover:bg-bone/10">
                        Submit another request
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-5">
                        <p className="eyebrow !text-[#FF8FA0]">Organise a blood donation camp</p>
                        <h3 className="mt-2 font-display text-2xl font-bold tracking-tightest text-bone">Tell us about your camp</h3>
                        <p className="mt-2 text-sm text-bone/60">Share your venue and preferred date. Fields marked * are required.</p>
                      </div>
                      <form onSubmit={submitCamp} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {[
                          ['organiser_name', 'Your name *', 'text', true],
                          ['organisation', 'College / company / organisation *', 'text', true],
                          ['phone', 'Contact mobile *', 'tel', true],
                          ['email', 'Email address', 'email', false],
                          ['venue', 'Camp venue / address *', 'text', true],
                          ['city', 'City / town *', 'text', true],
                        ].map(([name, label, type, required]) => (
                          <label key={name} className="block text-xs font-medium text-bone/75">
                            {label}
                            <input name={name} type={type} required={required} className="mt-1.5 w-full rounded-xl border border-bone/20 bg-ink/30 px-3.5 py-2.5 text-sm text-bone placeholder:text-bone/30 focus:outline-none focus-visible:outline-2 focus-visible:outline-[#FF8FA0]" />
                          </label>
                        ))}
                        <label className="block text-xs font-medium text-bone/75">
                          District *
                          <select name="district" required defaultValue="" className="mt-1.5 w-full rounded-xl border border-bone/20 bg-[#211417] px-3.5 py-2.5 text-sm text-bone focus:outline-none focus-visible:outline-2 focus-visible:outline-[#FF8FA0]">
                            <option value="" disabled>Select district</option>
                            {['Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Tirunelveli','Erode','Vellore','Thanjavur','Thoothukudi','Other'].map((district) => <option key={district} value={district}>{district}</option>)}
                          </select>
                        </label>
                        <label className="block text-xs font-medium text-bone/75">
                          Preferred camp date *
                          <input name="camp_date" type="date" required min={new Date().toISOString().slice(0, 10)} className="mt-1.5 w-full rounded-xl border border-bone/20 bg-ink/30 px-3.5 py-2.5 text-sm text-bone focus:outline-none focus-visible:outline-2 focus-visible:outline-[#FF8FA0]" />
                        </label>
                        <label className="block text-xs font-medium text-bone/75">
                          Expected donors *
                          <input name="expected_donors" type="number" min="10" max="1000" required placeholder="e.g. 100" className="mt-1.5 w-full rounded-xl border border-bone/20 bg-ink/30 px-3.5 py-2.5 text-sm text-bone placeholder:text-bone/30 focus:outline-none focus-visible:outline-2 focus-visible:outline-[#FF8FA0]" />
                        </label>
                        <label className="block text-xs font-medium text-bone/75 sm:col-span-2">
                          Additional details
                          <textarea name="notes" rows={3} placeholder="Availability, facilities, preferred time, etc." className="mt-1.5 w-full resize-y rounded-xl border border-bone/20 bg-ink/30 px-3.5 py-2.5 text-sm text-bone placeholder:text-bone/30 focus:outline-none focus-visible:outline-2 focus-visible:outline-[#FF8FA0]" />
                        </label>
                        <div className="sm:col-span-2 flex flex-wrap items-center gap-3 pt-1">
                          <button type="submit" disabled={campSubmitting} className="rounded-full bg-crimson px-6 py-3 text-sm font-semibold text-white transition hover:bg-crimson-600 disabled:opacity-60">
                            {campSubmitting ? 'Submitting…' : 'Submit camp request →'}
                          </button>
                          <span className="text-[11px] text-bone/45">Prototype only — no real data is sent.</span>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* inline share composer */}
          <AnimatePresence initial={false}>
            {share && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="mt-5 max-w-lg rounded-3xl border border-bone/20 bg-bone/[0.06] p-5 backdrop-blur">
                  {sent ? (
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-[13px] text-bone/85"
                      role="status"
                    >
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-teal text-white">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m5 13 4 4L19 7" />
                        </svg>
                      </span>
                      Thanks — a coordinator will verify this with the hospital within 30 minutes.
                      <span className="text-[10px] uppercase tracking-[0.14em] text-bone/40">(prototype)</span>
                    </motion.p>
                  ) : (
                    <form onSubmit={submit}>
                      <label htmlFor="share-note" className="block text-[12px] font-medium text-bone/70">
                        What do you need? Do not include patient names or phone numbers.
                      </label>
                      <textarea
                        id="share-note"
                        rows={3}
                        required
                        minLength={10}
                        placeholder="e.g. B− needed at a Madurai hospital, 2 units, by tomorrow evening."
                        className="mt-2 w-full resize-none rounded-xl border border-bone/20 bg-ink/20 px-3.5 py-2.5 text-[13px] text-bone placeholder:text-bone/30 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF8FA0]"
                      />
                      <button
                        type="submit"
                        className="mt-3 rounded-full bg-bone px-5 py-2.5 text-[12.5px] font-semibold text-ink transition-transform hover:scale-[1.02]"
                      >
                        Send to coordinator
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-bone/20 pt-6 text-[11.5px] text-bone/50">
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden="true" />
            Donor details never public
          </span>
          <span>No cost to donors, ever</span>
          <span>Works on a 2G connection</span>
        </div>
      </div>
    </section>
  )
}
