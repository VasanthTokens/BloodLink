import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ThemeToggle from './ThemeToggle'
import { scrollToId } from '../hooks/useLenis'
import { BloodDrop } from './BloodDrop'

const LINKS = [
  { id: 'journey', label: 'The journey' },
  { id: 'urgent', label: 'Urgent' },
  { id: 'network', label: 'Network' },
  { id: 'know', label: 'Before you donate' },
  { id: 'impact', label: 'Impact' },
]

export default function Nav({ onOpenRegister }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id) => {
    setOpen(false)
    scrollToId(id)
  }

  // Over the dark hero the nav is light; once the shell turns solid it flips
  // back to the theme's ink/bone pair.
  const overHero = !scrolled

  return (
    <>
      <a
        href="#find-donor"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-bone"
      >
        Skip to donor search
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-[58] pt-[14px] transition-colors duration-500 ease-calm ${
          scrolled
            ? 'border-b border-ink/8 bg-bone/85 backdrop-blur-xl dark:border-bone/10 dark:bg-[#140D0F]/85'
            : 'bg-transparent'
        }`}
      >
        <nav className="shell flex h-16 items-center justify-between gap-4" aria-label="Primary">
          <button
            type="button"
            onClick={() => go('find-donor')}
            className="group flex items-center gap-2.5 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-crimson"
            aria-label="BloodLink — back to top"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-crimson text-white transition-transform duration-500 ease-calm group-hover:scale-105">
              <BloodDrop className="h-4 w-4" />
            </span>
            <span
              className={`font-display text-[19px] font-bold tracking-tightest transition-colors duration-500 ${
                overHero ? 'text-bone' : 'text-ink dark:text-bone'
              }`}
            >
              BloodLink
            </span>
            <span
              className={`hidden rounded-full border px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-[0.14em] transition-colors duration-500 sm:inline-block ${
                overHero
                  ? 'border-bone/25 text-bone/55'
                  : 'border-ink/15 text-ink/45 dark:border-bone/20 dark:text-bone/45'
              }`}
            >
              TN
            </span>
          </button>

          <div className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => go(l.id)}
                className={`rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors duration-300 ${
                  overHero
                    ? 'text-bone/70 hover:bg-bone/10 hover:text-bone'
                    : 'text-ink/65 hover:bg-ink/5 hover:text-ink dark:text-bone/65 dark:hover:bg-bone/10 dark:hover:text-bone'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle onDark={overHero} />
            <button
              type="button"
              onClick={onOpenRegister}
              className={`hidden rounded-full px-5 py-2.5 text-[13px] font-semibold transition-all duration-300 ease-calm hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson sm:inline-flex ${
                overHero
                  ? 'bg-bone text-ink hover:bg-white'
                  : 'bg-ink text-bone hover:bg-oxblood dark:bg-bone dark:text-ink dark:hover:bg-white'
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className={`grid h-9 w-9 place-items-center rounded-full border transition-colors duration-500 lg:hidden ${
                overHero
                  ? 'border-bone/30 text-bone'
                  : 'border-ink/12 text-ink/70 dark:border-bone/20 dark:text-bone/70'
              }`}
            >
              <span className="relative block h-3 w-4" aria-hidden="true">
                <motion.span
                  animate={open ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-x-0 top-0 h-[1.5px] rounded bg-current"
                />
                <motion.span
                  animate={open ? { opacity: 0 } : { opacity: 1 }}
                  className="absolute inset-x-0 top-[5px] h-[1.5px] rounded bg-current"
                />
                <motion.span
                  animate={open ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-x-0 top-[10px] h-[1.5px] rounded bg-current"
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[56] bg-ink/40 backdrop-blur-sm lg:hidden"
              aria-hidden="true"
            />
            <motion.div
              id="mobile-menu"
              initial={{ clipPath: 'inset(0 0 100% 0)' }}
              animate={{ clipPath: 'inset(0 0 0% 0)' }}
              exit={{ clipPath: 'inset(0 0 100% 0)' }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-0 top-0 z-[57] border-b border-ink/10 bg-bone px-5 pb-8 pt-24 lg:hidden dark:border-bone/10 dark:bg-[#140D0F]"
            >
              <ul className="space-y-1">
                {LINKS.map((l, i) => (
                  <motion.li
                    key={l.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <button
                      type="button"
                      onClick={() => go(l.id)}
                      className="flex w-full items-center justify-between border-b border-ink/8 py-3.5 text-left font-display text-2xl font-bold tracking-tightest dark:border-bone/10"
                    >
                      {l.label}
                      <span className="text-crimson" aria-hidden="true">
                        →
                      </span>
                    </button>
                  </motion.li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onOpenRegister()
                }}
                className="mt-6 w-full rounded-full bg-crimson px-6 py-3.5 text-sm font-semibold text-white"
              >
                Register as a donor
              </button>
              <p className="mt-4 text-center text-[12px] text-ink/50 dark:text-bone/50">
                In an emergency, call{' '}
                <a href="tel:108" className="font-semibold text-crimson underline decoration-dotted">
                  108
                </a>
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
