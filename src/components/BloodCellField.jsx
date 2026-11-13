import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/useReducedMotion'

/**
 * <BloodCellField />
 * ---------------------------------------------------------------------------
 * A handful (14) of drifting red blood cells behind the hero. Each cell is a
 * pre-rendered sprite (a biconcave disc: warm ring, darker dimple) drawn once
 * into an offscreen canvas, then stamped each frame — cheaper than 14 radial
 * gradients per frame.
 *
 * Rules:
 *   • never more than 20 elements
 *   • rAF loop pauses completely when the canvas leaves the viewport
 *   • respects prefers-reduced-motion (draws one static frame)
 *   • devicePixelRatio capped at 2 so phones don't melt
 */
export default function BloodCellField({ count = 14, className = '', opacity = 0.55 }) {
  const canvasRef = useRef(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return undefined

    let w = 0
    let h = 0
    let dpr = 1
    let raf = 0
    let visible = true
    let sprite = null

    const makeSprite = () => {
      const size = 96
      const c = document.createElement('canvas')
      c.width = size
      c.height = size
      const g = c.getContext('2d')
      const r = size / 2
      const grad = g.createRadialGradient(r, r, r * 0.12, r, r, r)
      grad.addColorStop(0, 'rgba(92,10,23,0.62)')
      grad.addColorStop(0.42, 'rgba(179,18,43,0.52)')
      grad.addColorStop(0.74, 'rgba(179,18,43,0.34)')
      grad.addColorStop(0.9, 'rgba(251,247,246,0.22)')
      grad.addColorStop(1, 'rgba(251,247,246,0)')
      g.fillStyle = grad
      g.beginPath()
      g.arc(r, r, r, 0, Math.PI * 2)
      g.fill()
      // biconcave dimple
      g.globalCompositeOperation = 'multiply'
      const dimple = g.createRadialGradient(r, r, 0, r, r, r * 0.5)
      dimple.addColorStop(0, 'rgba(92,10,23,0.42)')
      dimple.addColorStop(1, 'rgba(92,10,23,0)')
      g.fillStyle = dimple
      g.beginPath()
      g.arc(r, r, r * 0.52, 0, Math.PI * 2)
      g.fill()
      return c
    }
    sprite = makeSprite()

    const cells = Array.from({ length: Math.min(count, 20) }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      r: 14 + Math.random() * 46,
      speed: 0.0006 + Math.random() * 0.0016,
      drift: (Math.random() - 0.5) * 0.0009,
      phase: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.24,
      squash: 0.55 + Math.random() * 0.4,
      alpha: 0.25 + Math.random() * 0.5,
      tint: i % 4 === 0 ? 0.55 : 1,
    }))

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h)
      for (const c of cells) {
        const bob = Math.sin(t * 0.0004 + c.phase) * 10
        const px = c.x * w + Math.sin(t * 0.0002 + c.phase) * 14
        const py = c.y * h + bob
        ctx.save()
        ctx.translate(px, py)
        ctx.rotate(c.phase + t * 0.00008 * c.spin * 60)
        ctx.globalAlpha = c.alpha * c.tint * opacity
        ctx.drawImage(sprite, -c.r, -c.r * c.squash, c.r * 2, c.r * 2 * c.squash)
        ctx.restore()
      }
    }

    const step = (t) => {
      if (!visible) return
      for (const c of cells) {
        c.y -= c.speed * 16
        c.x += c.drift * 16
        if (c.y < -0.2) {
          c.y = 1.2
          c.x = Math.random()
        }
        if (c.x < -0.2) c.x = 1.2
        if (c.x > 1.2) c.x = -0.2
      }
      draw(t)
      raf = requestAnimationFrame(step)
    }

    resize()

    if (reduced) {
      draw(0)
    } else {
      raf = requestAnimationFrame(step)
    }

    const onResize = () => {
      resize()
      if (reduced) draw(0)
    }
    window.addEventListener('resize', onResize, { passive: true })

    // Pause when off-screen — the hero scrolls away after ~1 viewport.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible && !reduced && !raf) raf = requestAnimationFrame(step)
        if (!visible && raf) {
          cancelAnimationFrame(raf)
          raf = 0
        }
      },
      { threshold: 0.01 },
    )
    io.observe(canvas)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      io.disconnect()
    }
  }, [count, opacity, reduced])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  )
}
