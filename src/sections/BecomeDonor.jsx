import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../services/api'
import Picture from '../components/Picture'
import DonorForm from '../components/DonorForm'
import { SectionHeading } from '../components/Reveal'
import { SampleTag } from '../components/States'

/**
 * BECOME A DONOR
 * Split layout: a documentary photograph of a preparation on the left, the
 * validated three-step form on the right. The image is sticky on desktop so the
 * donor keeps a human face in view while filling in admin.
 */
export default function BecomeDonor({ id = 'donate', formId = 'donor-form' }) {
  const [districts, setDistricts] = useState([])

  useEffect(() => {
    let alive = true
    api.getReference().then(({ data }) => {
      if (alive) setDistricts(data.districts)
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <section id={id} aria-labelledby="donate-title" className="relative bg-bone py-20 sm:py-28 dark:bg-[#140D0F]">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          {/* ------------------------------------------------------- image side */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Picture
              name="nurse-prep"
              alt="A nurse in a light uniform and gloves lays out a sterile blood-donation kit on a steel tray beside a tourniquet, warm window light behind her."
              className="rounded-4xl"
              rounded="rounded-4xl"
              sizes="(max-width: 1024px) 100vw, 45vw"
              parallax={20}
              aspect="4 / 5"
            >
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent p-6 pt-20">
                <p className="font-display text-[15px] font-semibold leading-tight text-bone">
                  “The needle is the easy part. The hard part is deciding to come.”
                </p>
                <p className="mt-2 text-[11.5px] text-bone/60">
                  Volunteer donor, Coimbatore · synthetic quote for this prototype
                </p>
              </div>
            </Picture>

            <ul className="mt-6 grid grid-cols-3 gap-3">
              {[
                ['8–12', 'minutes to donate'],
                ['350–450', 'ml per unit'],
                ['90', 'days between donations'],
              ].map(([v, l]) => (
                <li key={l} className="rounded-2xl border border-current/10 px-3 py-3">
                  <p className="font-display text-[18px] font-bold leading-none tracking-tight">{v}</p>
                  <p className="mt-1.5 text-[10.5px] leading-tight text-ink/50 dark:text-bone/50">{l}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* -------------------------------------------------------- form side */}
          <div>
            <SectionHeading
              id="donate-title"
              eyebrow="Become a donor"
              title={
                <>
                  Your details stay
                  <br />
                  private until you say otherwise.
                </>
              }
              intro="Registration asks only what a coordinator needs to make a safe match. No medical records, no ID uploads, no phone number visible to anyone browsing."
            />

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="card mt-8 rounded-4xl p-5 sm:p-7"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink/45 dark:text-bone/45">
                  Step-by-step · ~2 minutes
                </p>
                <SampleTag>Demo form</SampleTag>
              </div>
              <DonorForm districts={districts} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
