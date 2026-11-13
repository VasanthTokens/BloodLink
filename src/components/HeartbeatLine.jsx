import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/useReducedMotion'

/**
 * <HeartbeatLine />
 * ---------------------------------------------------------------------------
 * A 3px ECG trace pinned to the very top of the page. It scrolls its dash
 * offset forever at a resting rhythm (one beat ≈ 5.4s). When the Urgent
 * Requests section is in view, `speed` jumps to ~2.2× and the trace turns
 * crimson — the page itself gets anxious. Tachycardia, not decoration.
 *
 * Driven by rAF + dashoffset (a compositor-friendly transform-free loop).
 * Reduced motion: static line, no scrolling.
 */
export default function HeartbeatLine({ urgent = false }) {
  const pathRef = useRef(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return undefined
    let raf = 0
    let offset = 0
    let current = 0.5
    let last = performance.now()

    const tick = (now) => {
      const dt = Math.min(64, now - last)
      last = now
      // ease the rate so the change of heart rate feels physiological
      const target = urgent ? 1.9 : 0.62
      current += (target - current) * Math.min(1, dt / 420)
      offset -= (current * dt) / 26
      if (pathRef.current) pathRef.current.style.strokeDashoffset = String(offset)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [urgent, reduced])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[14px] overflow-hidden"
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 1200 24"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ecg-fade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="12%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="88%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g
          className={`transition-colors duration-700 ease-calm ${
            urgent ? 'text-crimson dark:text-[#FF6B80]' : 'text-crimson/35 dark:text-[#FF8FA0]/35'
          }`}
        >
          <path
            ref={pathRef}
            d="M0 12 H120 l10 0 l6 -6 l6 12 l6 -6 H200 l8 0 l4 -9 l5 18 l5 -9 H320 l10 0 l6 -5 l6 10 l6 -5 H430 l8 0 l4 -12 l5 24 l5 -12 H560 l10 0 l6 -6 l6 12 l6 -6 H690 l8 0 l4 -9 l5 18 l5 -9 H810 l10 0 l6 -5 l6 10 l6 -5 H920 l8 0 l4 -12 l5 24 l5 -12 H1060 l10 0 l6 -6 l6 12 l6 -6 H1200"
            stroke="url(#ecg-fade)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="60 24"
          />
        </g>
      </svg>
    </div>
  )
}
