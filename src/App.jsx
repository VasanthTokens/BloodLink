import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import Nav from './components/Nav'
import HeartbeatLine from './components/HeartbeatLine'
import RegistrationModal from './components/RegistrationModal'
import { api } from './services/api'
import { useLenis } from './hooks/useLenis'

import Hero from './sections/Hero'
import JourneyStory from './sections/JourneyStory'
import UrgentRequests from './sections/UrgentRequests'
import BloodBankNetwork from './sections/BloodBankNetwork'
import BecomeDonor from './sections/BecomeDonor'
import KnowBefore from './sections/KnowBefore'
import Impact from './sections/Impact'
import TakeAction from './sections/TakeAction'
import Footer from './sections/Footer'

const EASE = [0.22, 1, 0.36, 1]

export default function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const [urgent, setUrgent] = useState(false)
  const [districts, setDistricts] = useState([])
  const [booted, setBooted] = useState(false)
  useLenis()

  useEffect(() => {
    let alive = true
    api.getReference().then(({ data }) => alive && setDistricts(data.districts))
    // a short, honest curtain while the hero's photography decodes
    const t = setTimeout(() => setBooted(true), 420)
    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [])

  const openRegister = useCallback(() => setModalOpen(true), [])
  const closeRegister = useCallback(() => setModalOpen(false), [])

  return (
    <>
      {/* screen-reader landmark summary */}
      <p className="sr-only">
        BloodLink is a prototype donor-matching site for Tamil Nadu. All data is synthetic. In an
        emergency, call 108.
      </p>

      <HeartbeatLine urgent={urgent} />
      <Nav onOpenRegister={openRegister} />

      <main id="main">
        <Hero onOpenRegister={openRegister} />
        <JourneyStory />
        <UrgentRequests onPulse={setUrgent} />
        <BloodBankNetwork />
        <BecomeDonor />
        <KnowBefore />
        <Impact />
        <TakeAction onOpenRegister={openRegister} />
      </main>

      <Footer />

      <RegistrationModal open={modalOpen} onClose={closeRegister} districts={districts} />

      {/* boot curtain — fades the first paint in rather than snapping */}
      <AnimatePresence>
        {!booted && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="pointer-events-none fixed inset-0 z-[95] bg-[#140D0F]"
            aria-hidden="true"
          >
            <div className="flex h-full items-center justify-center">
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="font-display text-[11px] uppercase tracking-[0.4em] text-bone/40"
              >
                BloodLink
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
