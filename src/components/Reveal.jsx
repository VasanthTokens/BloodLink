import { motion, useReducedMotion } from 'framer-motion'

export const EASE = [0.22, 1, 0.36, 1]

/**
 * <Reveal /> — the project's single entrance animation.
 * Under prefers-reduced-motion it degrades to a plain opacity fade with no
 * transform, so nothing moves for users who asked for stillness.
 */
export default function Reveal({
  children,
  as = 'div',
  delay = 0,
  y = 26,
  duration = 0.9,
  once = true,
  className = '',
  amount = 0.25,
  ...rest
}) {
  const reduced = useReducedMotion()
  const MotionTag = motion[as] ?? motion.div

  return (
    <MotionTag
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: reduced ? 0.4 : duration, delay: reduced ? 0 : delay, ease: EASE }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}

/** Staggered container/child pair for lists and card grids. */
export const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

export const staggerChild = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

/** Section heading block used by most sections — keeps rhythm identical. */
export function SectionHeading({ eyebrow, title, intro, align = 'left', dark = false, id, children }) {
  return (
    <div className={`${align === 'center' ? 'mx-auto max-w-prose text-center' : 'max-w-2xl'}`}>
      {eyebrow && (
        <Reveal as="p" className={`eyebrow ${dark ? '!text-[#FF8FA0]' : ''}`} y={12}>
          <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
          {eyebrow}
        </Reveal>
      )}
      <Reveal
        as="h2"
        id={id}
        delay={0.06}
        className={`mt-4 text-[clamp(2rem,5.2vw,3.65rem)] leading-[0.98] ${
          dark ? 'text-bone' : 'text-ink dark:text-bone'
        }`}
      >
        {title}
      </Reveal>
      {intro && (
        <Reveal
          as="p"
          delay={0.12}
          className={`mt-5 text-[15px] leading-relaxed sm:text-base ${
            dark ? 'text-bone/70' : 'text-ink/65 dark:text-bone/65'
          }`}
        >
          {intro}
        </Reveal>
      )}
      {children}
    </div>
  )
}
