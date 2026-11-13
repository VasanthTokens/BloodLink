/** Shared 20px line icons. Kept as raw nodes so they inherit currentColor. */
const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const arrowDown = (
  <svg {...base}>
    <path d="M12 4v16M6 14l6 6 6-6" />
  </svg>
)

export const arrowRight = (
  <svg {...base}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
)

export const check = (
  <svg {...base} strokeWidth={2.4}>
    <path d="m4 12.5 5 5L20 6.5" />
  </svg>
)

export const pin = (
  <svg {...base}>
    <path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.4" />
  </svg>
)

export const clock = (
  <svg {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)

export const shield = (
  <svg {...base}>
    <path d="M12 3 5 6v6c0 4.3 3 7.6 7 9 4-1.4 7-4.7 7-9V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

export const close = (
  <svg {...base} strokeWidth={2}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const heart = (
  <svg {...base}>
    <path d="M12 20s-7-4.4-7-9.4A4.1 4.1 0 0 1 12 7a4.1 4.1 0 0 1 7 3.6c0 5-7 9.4-7 9.4Z" />
  </svg>
)
