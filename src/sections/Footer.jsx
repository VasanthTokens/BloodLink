import { BloodDrop } from '../components/BloodDrop'
import { scrollToId } from '../hooks/useLenis'
import Reveal from '../components/Reveal'

const COLUMNS = [
  {
    title: 'Donors',
    links: [
      ['Find a donor', 'find-donor'],
      ['Register', 'donate'],
      ['Know before you donate', 'know'],
      ['Impact', 'impact'],
    ],
  },
  {
    title: 'Hospitals & banks',
    links: [
      ['Urgent requests', 'urgent'],
      ['Blood bank network', 'network'],
      ['Verification policy', 'urgent'],
      ['Host a camp', 'act'],
    ],
  },
]

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink pb-10 pt-16 text-bone dark:bg-[#0D0809]">
      <div className="shell">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div>
            <button
              type="button"
              onClick={() => scrollToId('find-donor')}
              className="flex items-center gap-2.5"
              aria-label="BloodLink — back to top"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-crimson text-white">
                <BloodDrop className="h-4.5 w-4.5" />
              </span>
              <span className="font-display text-[21px] font-bold tracking-tightest">BloodLink</span>
            </button>
            <p className="mt-4 max-w-xs text-[12.5px] leading-relaxed text-bone/50">
              A prototype of a voluntary blood-donor network for Tamil Nadu. Not a medical service, not
              a blood bank, not affiliated with any hospital.
            </p>
            <p lang="ta" className="mt-3 max-w-xs text-[12.5px] leading-relaxed text-bone/40">
              தமிழ்நாட்டில் தன்னார்வ இரத்த தானம்.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-bone/35">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([label, id]) => (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={() => scrollToId(id)}
                      className="text-[12.5px] text-bone/60 transition-colors hover:text-bone"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-bone/35">
              Emergency
            </p>
            <a
              href="tel:108"
              className="group mt-4 flex items-center justify-between gap-3 rounded-2xl border border-bone/15 px-4 py-3 transition-colors hover:border-crimson/60 hover:bg-crimson/10"
            >
              <span>
                <span className="block text-[10.5px] uppercase tracking-[0.14em] text-bone/40">
                  In an emergency call
                </span>
                <span className="mt-0.5 block font-display text-[26px] font-bold leading-none tracking-tightest">
                  108
                </span>
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-crimson text-white transition-transform duration-300 ease-calm group-hover:scale-105">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4.5 4.5c1-.9 2.4-.6 3.1.5l1.2 2c.5.9.4 1.7-.3 2.3l-.8.7a12 12 0 0 0 5.3 5.3l.7-.8c.6-.7 1.4-.8 2.3-.3l2 1.2c1.1.7 1.4 2.1.5 3.1l-.9 1c-1 1.1-2.6 1.4-4 .8-6-2.4-10.4-6.8-12.8-12.8-.6-1.4-.3-3 .7-4l1-.9Z" />
                </svg>
              </span>
            </a>
            <p className="mt-3 text-[11px] leading-relaxed text-bone/35">
              BloodLink cannot dispatch ambulances or supply blood directly. 108 is Tamil Nadu&apos;s
              emergency response number.
            </p>
          </div>
        </div>

        {/* prototype notice */}
        <Reveal className="mt-12 rounded-3xl border border-dashed border-bone/20 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#FF8FA0]">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                </svg>
                Prototype notice
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-bone/55">
                Every donor, hospital, blood bank, stock level and request on this site is synthetic and
                generated by a seeded script. There are no real phone numbers, no real patients and no
                medical integrations. Names are fictional; no donor contact is shared. Do not use this
                prototype to make medical decisions.
              </p>
            </div>
            <p className="shrink-0 text-[11px] text-bone/35">Build 1.0 · {new Date().getFullYear()}</p>
          </div>
        </Reveal>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-bone/10 pt-6 text-[11px] text-bone/35 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} BloodLink (prototype). Made in Tamil Nadu.</p>
          <p className="flex items-center gap-4">
            <span>Accessibility</span>
            <span aria-hidden="true">·</span>
            <span>Privacy</span>
            <span aria-hidden="true">·</span>
            <span>Data ethics</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
