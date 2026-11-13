import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from './useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

/**
 * One Lenis instance for the whole page, driven by GSAP's ticker so scroll
 * animation and scroll-triggered animation share a single frame loop
 * (prevents the 1-frame jitter you get from two independent rAF loops).
 */
export function useLenis() {
  const lenisRef = useRef(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return undefined

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    })
    lenisRef.current = lenis
    window.__lenis = lenis // available to the heartbeat + anchor helpers

    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
      window.__lenis = null
    }
  }, [reduced])

  return lenisRef
}

/** Smooth anchor scrolling that works with or without Lenis. */
export function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (window.__lenis) {
    window.__lenis.scrollTo(el, { offset: -72, duration: 1.4 })
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export default useLenis
