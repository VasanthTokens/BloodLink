/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        crimson: {
          DEFAULT: '#B3122B',
          600: '#A21027',
          700: '#8A0D20',
          800: '#6E0A19',
        },
        oxblood: '#5C0A17',
        bone: '#FBF7F6',
        ink: '#1D1416',
        teal: '#0F6B66',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', 'Bricolage Grotesque', 'Georgia', 'serif'],
        sans: ['"Instrument Sans Variable"', 'Instrument Sans', 'system-ui', 'sans-serif'],
        tamil: ['"Noto Sans Tamil Variable"', '"Noto Sans Tamil"', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.045em',
      },
      transitionTimingFunction: {
        calm: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      borderRadius: {
        '4xl': '2.5rem',
        '5xl': '3rem',
      },
      maxWidth: {
        shell: '1280px',
        prose: '68ch',
      },
      boxShadow: {
        tactile: '0 1px 0 rgba(255,255,255,.5) inset, 0 6px 18px -8px rgba(29,20,22,.35)',
        lift: '0 24px 60px -30px rgba(92,10,23,.45)',
      },
    },
  },
  plugins: [],
}
