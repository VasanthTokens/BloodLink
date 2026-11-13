import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './useReducedMotion'

const easeOutQuart = (t) => 1 - Math.pow(1 - t, 3.2)

/**
 * Counts from 0 → value once the element is on screen.
 * Reduced motion gets the final number immediately (no count-up).
 */
export function useCountUp(value, { duration = 1600, start = false } = {}) {
  const reduced = usePrefersReducedMotion()
  const [display, setDisplay] = useState(reduced ? value : 0)
  const frame = useRef(0)

  useEffect(() => {
    if (!start) return undefined
    if (reduced) {
      setDisplay(value)
      return undefined
    }
    const t0 = performance.now()
    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration)
      setDisplay(Math.round(easeOutQuart(p) * value))
      if (p < 1) frame.current = requestAnimationFrame(step)
    }
    frame.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame.current)
  }, [value, start, duration, reduced])

  return display
}

export default useCountUp
