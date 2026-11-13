import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Persisted light/dark switch. The FOUC is prevented in index.html by setting
 * the class before paint.
 *
 * `onDark` lets the switch sit over the hero photograph (light chrome) without
 * losing contrast once the nav becomes a solid surface.
 */
export default function ThemeToggle({ onDark = false }) {
  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false,
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    try {
      localStorage.setItem('bloodlink-theme', dark ? 'dark' : 'light')
    } catch (e) {
      /* private mode — theme just won't persist */
    }
    const meta = document.querySelector('meta[name="color-scheme"]')
    if (meta) meta.setAttribute('content', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button
      type="button"
      onClick={() => setDark((d) => !d)}
      aria-pressed={dark}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`relative grid h-9 w-9 place-items-center rounded-full border transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson ${
        onDark
          ? 'border-bone/30 text-bone/80 hover:border-bone/60 hover:text-bone'
          : 'border-ink/12 text-ink/70 hover:border-crimson/40 hover:text-crimson dark:border-bone/20 dark:text-bone/70 dark:hover:text-[#FF8FA0]'
      }`}
    >
      <motion.span
        key={dark ? 'moon' : 'sun'}
        initial={{ rotate: -35, opacity: 0, scale: 0.7 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
        className="block"
      >
        {dark ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8Z" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
          </svg>
        )}
      </motion.span>
    </button>
  )
}
