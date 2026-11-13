import { useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { api } from '../services/api'
import { BloodDrop } from './BloodDrop'

const EASE = [0.22, 1, 0.36, 1]
const GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

const STEPS = [
  { id: 'identity', label: 'You' },
  { id: 'health', label: 'Eligibility' },
  { id: 'contact', label: 'Contact' },
]

const initial = {
  full_name: '',
  date_of_birth: '',
  blood_group: '',
  sex: '',
  district_slug: '',
  area: '',
  phone: '',
  email: '',
  last_donation_date: '',
  weight_kg: '',
  conditions: [],
  consent_data_use: false,
  consent_contact: false,
  wants_reminders: true,
}

/**
 * <DonorForm />
 * ---------------------------------------------------------------------------
 * ONE form, two homes: inline in the "Become a donor" section and inside the
 * registration modal. Validation is progressive per step; the final POST goes
 * through services/api.js so the swap to a real backend is a one-line change.
 *
 * `compact` tightens spacing for the modal; `showTitle` lets the section own
 * the heading. `onDone` fires with the created record.
 */
export default function DonorForm({
  districts = [],
  compact = false,
  showTitle = true,
  onDone,
  onCancel,
  titleId,
}) {
  const reduced = useReducedMotion()
  /* Two instances of this form can be on the page at once (the section and the
     modal), so every field id is namespaced. Duplicate ids break both label
     association and assistive tech. */
  const uid = useId()
  const fieldId = (field) => `${uid}-${field}`
  const [step, setStep] = useState(0)
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [serverError, setServerError] = useState(null)
  const [result, setResult] = useState(null)
  const firstFieldRef = useRef(null)

  const set = (key) => (e) => {
    const value = e?.target?.type === 'checkbox' ? e.target.checked : e.target.value
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const toggleCondition = (cond) => {
    setValues((v) => ({
      ...v,
      conditions: v.conditions.includes(cond)
        ? v.conditions.filter((c) => c !== cond)
        : [...v.conditions, cond],
    }))
  }

  const validateStep = (index) => {
    const next = {}
    if (index === 0) {
      if (values.full_name.trim().length < 3) next.full_name = 'Enter your full name (at least 3 characters).'
      if (!values.date_of_birth) next.date_of_birth = 'Date of birth is required.'
      else {
        const age = (Date.now() - new Date(values.date_of_birth).getTime()) / 31557600000
        if (age < 18) next.date_of_birth = 'Donors must be 18 or older. Thank you for wanting to help.'
        if (age > 65) next.date_of_birth = 'Donors above 65 need a physician’s clearance — please call us.'
      }
      if (!values.blood_group) next.blood_group = 'Choose your blood group.'
      if (!values.district_slug) next.district_slug = 'Choose your district.'
    }
    if (index === 1) {
      if (!values.weight_kg) next.weight_kg = 'Weight is required.'
      else if (Number(values.weight_kg) < 50) next.weight_kg = 'Donors must weigh at least 50 kg.'
      if (!values.consent_data_use) next.consent_data_use = 'We need your consent to store these details.'
    }
    if (index === 2) {
      if (!/^[6-9]\d{9}$/.test(values.phone)) next.phone = 'Enter a valid 10-digit Indian mobile number.'
      if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email))
        next.email = 'That email does not look right.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const next = () => {
    if (!validateStep(step)) return
    setStep((s) => Math.min(STEPS.length - 1, s + 1))
  }
  const back = () => setStep((s) => Math.max(0, s - 1))

  const submit = async (e) => {
    e.preventDefault()
    if (!validateStep(2)) return
    setStatus('submitting')
    setServerError(null)
    try {
      const res = await api.registerDonor({
        ...values,
        full_name: values.full_name.trim(),
        weight_kg: Number(values.weight_kg),
        created_from: compact ? 'registration_modal' : 'become_a_donor_section',
      })
      setResult(res.data)
      setStatus('done')
      onDone?.(res.data)
    } catch (err) {
      setServerError(err.message)
      setStatus('error')
    }
  }

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step])
  const gap = compact ? 'space-y-3.5' : 'space-y-5'

  /* --------------------------------------------------------------- success */
  if (status === 'done') {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="py-4 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal/12 text-teal"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <motion.path
              d="m4 12.5 5 5L20 6.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
            />
          </svg>
        </motion.div>
        <h3 className="mt-5 text-2xl">You’re on the list, {result?.display_name?.split(' ')[0] ?? 'friend'}.</h3>
        <p className="mx-auto mt-3 max-w-sm text-[13.5px] leading-relaxed text-ink/65 dark:text-bone/65">
          A BloodLink coordinator will call within 24 hours to confirm your details and answer any
          questions. You can pause your availability at any time.
        </p>
        <div className="mx-auto mt-5 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-dashed border-current/20 px-4 py-3 text-[11.5px] text-ink/55 dark:text-bone/55">
          <span className="font-display text-[12px] font-bold text-ink dark:text-bone">{result?.donor_id}</span>
          <span aria-hidden="true">·</span>
          {result?.blood_group}
          <span aria-hidden="true">·</span>
          {result?.verification_due}
        </div>
        <p className="mt-5 text-[10.5px] uppercase tracking-[0.16em] text-ink/35 dark:text-bone/35">
          Prototype — no record was saved on a server
        </p>
        <button
          type="button"
          onClick={() => {
            setValues(initial)
            setStep(0)
            setStatus('idle')
            setResult(null)
            onCancel?.()
          }}
          className="mt-6 w-full rounded-full bg-ink px-6 py-3 text-[13.5px] font-semibold text-bone dark:bg-bone dark:text-ink"
        >
          {compact ? 'Back to the page' : 'Register another donor'}
        </button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={submit} noValidate>
      {showTitle && (
        <div className="mb-5">
          <p className="eyebrow">
            <BloodDrop className="h-3 w-3" /> Become a donor
          </p>
          <h3 id={titleId} className="mt-2 text-[clamp(1.5rem,4vw,2rem)] leading-[1.05]">
            Two minutes now.
            <br />
            Three lives later.
          </h3>
        </div>
      )}

      {/* step rail */}
      <ol className="flex items-center gap-2" aria-label="Form progress">
        {STEPS.map((s, i) => (
          <li key={s.id} className="flex flex-1 items-center gap-2">
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10.5px] font-bold transition-colors duration-300 ${
                i < step
                  ? 'bg-teal text-white'
                  : i === step
                    ? 'bg-crimson text-white'
                    : 'bg-ink/8 text-ink/45 dark:bg-bone/12 dark:text-bone/45'
              }`}
              aria-current={i === step ? 'step' : undefined}
            >
              {i < step ? '✓' : i + 1}
            </span>
            <span
              className={`hidden text-[11.5px] font-medium sm:block ${
                i === step ? 'text-ink dark:text-bone' : 'text-ink/40 dark:text-bone/40'
              }`}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-current/12" aria-hidden="true" />}
          </li>
        ))}
      </ol>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink/8 dark:bg-bone/12">
        <motion.div
          className="h-full rounded-full bg-crimson"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: EASE }}
        />
      </div>

      <div className={compact ? 'mt-5' : 'mt-7'}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: 24 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: EASE }}
            className={gap}
          >
            {step === 0 && (
              <>
                <Field
                  fieldId={fieldId}
                  label="Full name"
                  name="full_name"
                  value={values.full_name}
                  onChange={set('full_name')}
                  error={errors.full_name}
                  autoComplete="name"
                  inputRef={firstFieldRef}
                  hint="Only your first name and initial are ever shown publicly."
                />
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <Field
                    label="Date of birth"
                  fieldId={fieldId}
                    name="date_of_birth"
                    type="date"
                    value={values.date_of_birth}
                    onChange={set('date_of_birth')}
                    error={errors.date_of_birth}
                    max={new Date().toISOString().slice(0, 10)}
                    autoComplete="bday"
                  />
                  <SelectField
                    fieldId={fieldId}
                    label="Sex"
                    name="sex"
                    value={values.sex}
                    onChange={set('sex')}
                    options={['Female', 'Male', 'Prefer not to say']}
                  />
                </div>

                <fieldset>
                  <legend className="mb-2 text-[12px] font-medium">Blood group</legend>
                  <div className="grid grid-cols-4 gap-2">
                    {GROUPS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          setValues((v) => ({ ...v, blood_group: g }))
                          setErrors((e) => ({ ...e, blood_group: undefined }))
                        }}
                        aria-pressed={values.blood_group === g}
                        className={`rounded-xl border py-2.5 font-display text-[13px] font-bold transition-all duration-300 ease-calm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson ${
                          values.blood_group === g
                            ? 'border-crimson bg-crimson text-white'
                            : 'border-ink/12 text-ink/70 hover:border-crimson/40 dark:border-bone/15 dark:text-bone/70'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  {errors.blood_group && (
                    <p className="mt-1.5 text-[11.5px] text-crimson dark:text-[#FF8FA0]">{errors.blood_group}</p>
                  )}
                </fieldset>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  <SelectField
                    fieldId={fieldId}
                    label="District"
                    name="district_slug"
                    value={values.district_slug}
                    onChange={set('district_slug')}
                    error={errors.district_slug}
                    options={districts.map((d) => ({ value: d.slug, label: d.name }))}
                  />
                  <Field
                    fieldId={fieldId}
                  label="Area / locality"
                    name="area"
                    value={values.area}
                    onChange={set('area')}
                    placeholder="e.g. Adyar"
                  />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <Field
                    fieldId={fieldId}
                  label="Weight (kg)"
                    name="weight_kg"
                    type="number"
                    inputMode="numeric"
                    min="30"
                    max="200"
                    value={values.weight_kg}
                    onChange={set('weight_kg')}
                    error={errors.weight_kg}
                    hint="Minimum 50 kg for whole blood."
                  />
                  <Field
                    fieldId={fieldId}
                  label="Last donation (optional)"
                    name="last_donation_date"
                    type="date"
                    value={values.last_donation_date}
                    onChange={set('last_donation_date')}
                    max={new Date().toISOString().slice(0, 10)}
                    hint="We’ll calculate your next eligible date."
                  />
                </div>

                <fieldset>
                  <legend className="mb-2 text-[12px] font-medium">
                    Any of these in the last 6 months? (optional)
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {['Recent fever', 'Antibiotics', 'Tattoo or piercing', 'Pregnancy', 'Major surgery', 'None'].map(
                      (c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleCondition(c)}
                          aria-pressed={values.conditions.includes(c)}
                          className={`rounded-full border px-3.5 py-2 text-[12px] font-medium transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson ${
                            values.conditions.includes(c)
                              ? 'border-teal bg-teal/10 text-teal'
                              : 'border-ink/12 text-ink/65 hover:border-crimson/40 dark:border-bone/15 dark:text-bone/65'
                          }`}
                        >
                          {c}
                        </button>
                      ),
                    )}
                  </div>
                  <p className="mt-2 text-[11px] leading-snug text-ink/45 dark:text-bone/45">
                    A trained screener decides eligibility on the day. These answers only help us prepare —
                    they never disqualify you automatically.
                  </p>
                </fieldset>

                <Checkbox
                  fieldId={fieldId}
                  name="consent_data_use"
                  checked={values.consent_data_use}
                  onChange={set('consent_data_use')}
                  error={errors.consent_data_use}
                  label="I consent to BloodLink storing these details for donor matching."
                  sub="You can delete your record at any time."
                />
              </>
            )}

            {step === 2 && (
              <>
                <Field
                  fieldId={fieldId}
                  label="Mobile number"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={values.phone}
                  onChange={set('phone')}
                  error={errors.phone}
                  maxLength={10}
                  placeholder="10 digits, no +91"
                  hint="Shared only with a hospital coordinator, and only with your consent."
                />
                <Field
                  fieldId={fieldId}
                  label="Email (optional)"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={set('email')}
                  error={errors.email}
                />
                <Checkbox
                  fieldId={fieldId}
                  name="consent_contact"
                  checked={values.consent_contact}
                  onChange={set('consent_contact')}
                  label="Hospitals may contact me directly about matching requests."
                  sub="If unchecked, a BloodLink coordinator bridges every request."
                />
                <Checkbox
                  fieldId={fieldId}
                  name="wants_reminders"
                  checked={values.wants_reminders}
                  onChange={set('wants_reminders')}
                  label="Remind me when I’m eligible again (90 days)."
                />

                <div className="rounded-2xl border border-dashed border-current/20 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40 dark:text-bone/40">
                    Summary
                  </p>
                  <dl className="mt-2 grid gap-x-4 text-[12px] sm:grid-cols-2">
                    <Summary k="Name" v={values.full_name || '—'} />
                    <Summary k="Group" v={values.blood_group || '—'} />
                    <Summary
                      k="District"
                      v={districts.find((d) => d.slug === values.district_slug)?.name ?? '—'}
                    />
                    <Summary k="Weight" v={values.weight_kg ? `${values.weight_kg} kg` : '—'} />
                  </dl>
                </div>

                {serverError && (
                  <p
                    role="alert"
                    className="rounded-xl bg-crimson/8 px-3 py-2 text-[12px] text-crimson dark:text-[#FF8FA0]"
                  >
                    {serverError}
                  </p>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="rounded-full px-4 py-2.5 text-[12.5px] font-medium text-ink/55 transition-opacity disabled:pointer-events-none disabled:opacity-0 dark:text-bone/55"
        >
          ← Back
        </button>

        {step < STEPS.length - 1 ? (
          <motion.button
            type="button"
            onClick={next}
            whileTap={reduced ? undefined : { scale: 0.97 }}
            className="rounded-full bg-crimson px-6 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-crimson-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
          >
            Continue →
          </motion.button>
        ) : (
          <motion.button
            type="submit"
            disabled={status === 'submitting'}
            whileTap={reduced ? undefined : { scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-full bg-crimson px-6 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-crimson-600 disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
          >
            {status === 'submitting' && (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                className="inline-block h-3 w-3 rounded-full border-2 border-white/40 border-t-white"
                aria-hidden="true"
              />
            )}
            {status === 'submitting' ? 'Registering…' : 'Register as a donor'}
          </motion.button>
        )}
      </div>

      <p className="mt-4 text-center text-[10.5px] leading-relaxed text-ink/35 dark:text-bone/35">
        Prototype only. Nothing is transmitted, stored or shared. In a real emergency call{' '}
        <a href="tel:108" className="font-semibold text-crimson underline decoration-dotted dark:text-[#FF8FA0]">
          108
        </a>
        .
      </p>
    </form>
  )
}

/* ------------------------------------------------------------------ fields */
function Field({ label, name, error, hint, inputRef, fieldId, ...props }) {
  const id = fieldId(name)
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[12px] font-medium">
        {label}
      </label>
      <input
        id={id}
        ref={inputRef}
        name={name}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`w-full rounded-xl border bg-transparent px-3.5 py-2.5 text-[13.5px] text-ink transition-colors placeholder:text-ink/30 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson dark:text-bone dark:placeholder:text-bone/30 ${
          error ? 'border-crimson' : 'border-ink/15 focus:border-crimson/60 dark:border-bone/20'
        }`}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-[11px] text-crimson dark:text-[#FF8FA0]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-[10.5px] leading-snug text-ink/40 dark:text-bone/40">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

function SelectField({ label, name, error, options, fieldId, ...props }) {
  const id = fieldId(name)
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[12px] font-medium">
        {label}
      </label>
      <select
        id={id}
        name={name}
        aria-invalid={!!error}
        className={`w-full appearance-none rounded-xl border bg-transparent px-3.5 py-2.5 text-[13.5px] text-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson dark:text-bone ${
          error ? 'border-crimson' : 'border-ink/15 dark:border-bone/20'
        }`}
        {...props}
      >
        <option value="">Select…</option>
        {options.map((o) =>
          typeof o === 'string' ? (
            <option key={o} value={o}>
              {o}
            </option>
          ) : (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ),
        )}
      </select>
      {error && <p className="mt-1 text-[11px] text-crimson dark:text-[#FF8FA0]">{error}</p>}
    </div>
  )
}

function Checkbox({ name, checked, onChange, label, sub, error, fieldId }) {
  const id = fieldId(name)
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
        <span className="relative mt-0.5 grid shrink-0 place-items-center">
          <input
            id={id}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            aria-invalid={!!error}
            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-ink/25 transition-colors checked:border-crimson checked:bg-crimson focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson dark:border-bone/30"
          />
          <svg
            className="pointer-events-none absolute h-2.5 w-2.5 text-white opacity-0 peer-checked:opacity-100"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m5 13 4 4L19 7" />
          </svg>
        </span>
        <span>
          <span className="block text-[12.5px] leading-snug">{label}</span>
          {sub && (
            <span className="mt-0.5 block text-[10.5px] leading-snug text-ink/40 dark:text-bone/40">{sub}</span>
          )}
        </span>
      </label>
      {error && <p className="mt-1 text-[11px] text-crimson dark:text-[#FF8FA0]">{error}</p>}
    </div>
  )
}

function Summary({ k, v }) {
  return (
    <div className="flex justify-between gap-2 border-b border-current/8 py-1">
      <dt className="text-ink/45 dark:text-bone/45">{k}</dt>
      <dd className="truncate font-medium">{v}</dd>
    </div>
  )
}
