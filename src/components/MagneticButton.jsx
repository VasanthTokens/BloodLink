import { useCallback, useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'

/**
 * <MagneticButton />
 * The cursor "pulls" the button toward it (max ~10px), and the label drifts a
 * little further for a sense of mass. Press → 0.97 scale + a hair of shadow
 * loss. Disabled entirely for reduced motion and for touch (no hover).
 */
export function MagneticButton({
  as = 'button',
  children,
  className = '',
  strength = 12,
  onClick,
  type,
  ...rest
}) {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 260, damping: 22, mass: 0.4 })
  const sy = useSpring(my, { stiffness: 260, damping: 22, mass: 0.4 })
  const lx = useTransform(sx, (v) => v * 0.35)
  const ly = useTransform(sy, (v) => v * 0.35)

  const handleMove = useCallback(
    (e) => {
      if (reduced || !ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const px = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
      const py = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
      mx.set(Math.max(-1, Math.min(1, px)) * strength)
      my.set(Math.max(-1, Math.min(1, py)) * strength * 0.7)
    },
    [mx, my, reduced, strength],
  )

  const reset = () => {
    mx.set(0)
    my.set(0)
  }

  const Tag = motion[as] ?? motion.button

  return (
    <Tag
      ref={ref}
      type={as === 'button' ? type ?? 'button' : undefined}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onClick={onClick}
      style={reduced ? undefined : { x: sx, y: sy }}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      whileHover={reduced ? undefined : { scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative inline-flex select-none items-center justify-center gap-2 ${className}`}
      {...rest}
    >
      <motion.span style={reduced ? undefined : { x: lx, y: ly }} className="inline-flex items-center gap-2">
        {children}
      </motion.span>
    </Tag>
  )
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium tracking-tight transition-colors duration-300 ease-calm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'

export const buttonStyles = {
  primary: `${base} bg-crimson text-white shadow-tactile hover:bg-crimson-700 focus-visible:outline-crimson`,
  ink: `${base} bg-ink text-bone hover:bg-oxblood dark:bg-bone dark:text-ink dark:hover:bg-white`,
  ghost: `${base} border border-ink/15 text-ink hover:border-crimson/40 hover:bg-crimson/5 dark:border-bone/20 dark:text-bone dark:hover:bg-bone/10`,
  onImage: `${base} bg-bone/95 text-ink hover:bg-white backdrop-blur`,
  teal: `${base} bg-teal text-white hover:bg-[#0b5652]`,
}

export default MagneticButton
