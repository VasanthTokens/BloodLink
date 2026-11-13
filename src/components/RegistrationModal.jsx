import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import DonorForm from './DonorForm'
import { close } from './icons'

const EASE = [0.22, 1, 0.36, 1]

/**
 * Registration as a modal.
 *
 * The transition is a crimson wipe (clip-path inset) on the panel, so the page
 * appears to be painted over rather than faded. Focus is trapped, Escape
 * closes, Lenis is paused, and scroll is restored on exit.
 */
export default function RegistrationModal({ open, onClose, districts = [] }) {
  const reduced = useReducedMotion()
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const previouslyFocused = document.activeElement
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    window.__lenis?.stop?.()

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && panelRef.current) {
        const nodes = panelRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        const list = Array.from(nodes).filter((n) => n.offsetParent !== null)
        if (!list.length) return
        const first = list[0]
        const last = list[list.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    const t = setTimeout(() => {
      panelRef.current?.querySelector('input, button')?.focus()
    }, 420)

    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      window.__lenis?.start?.()
      previouslyFocused?.focus?.()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-labelledby="register-title">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/55 backdrop-blur-[3px]"
          />

          <motion.div
            initial={reduced ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
            animate={reduced ? { opacity: 1 } : { clipPath: 'inset(0 0 0% 0)' }}
            exit={reduced ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: reduced ? 0.2 : 0.6, ease: EASE }}
            className="pointer-events-none absolute inset-0 flex items-end justify-center sm:items-center"
          >
            <div
              ref={panelRef}
              className="pointer-events-auto relative flex max-h-[100svh] w-full max-w-xl flex-col overflow-hidden rounded-t-4xl bg-[var(--surface)] shadow-lift sm:max-h-[92svh] sm:rounded-4xl"
            >
              <motion.div
                aria-hidden="true"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
                className="h-1 shrink-0 origin-left bg-gradient-to-r from-crimson via-[#FF8FA0] to-oxblood"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close registration"
                className="absolute right-4 top-5 z-10 grid h-8 w-8 place-items-center rounded-full border border-current/15 text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink dark:text-bone/60 dark:hover:bg-bone/10 dark:hover:text-bone"
              >
                {close}
              </button>
              <div className="overflow-y-auto overscroll-contain px-5 pb-6 pt-5 sm:px-8 sm:pb-8">
                <DonorForm districts={districts} compact onCancel={onClose} titleId="register-title" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
