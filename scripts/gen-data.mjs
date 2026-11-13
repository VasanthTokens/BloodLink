/**
 * Synthetic data generator — deterministic (seeded), no real people, no real
 * phone numbers. Every record is fictional but shaped like production SQL rows.
 *
 * Run with: npm run data
 */
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const DATA = path.join(process.cwd(), 'src', 'data')

// --- tiny deterministic PRNG (mulberry32) --------------------------------
function rng(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = rng(20260317)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const int = (min, max) => Math.floor(rand() * (max - min + 1)) + min
const chance = (p) => rand() < p

export const DISTRICTS = [
  { slug: 'chennai', name: 'Chennai', name_ta: 'சென்னை', lat: 13.0827, lon: 80.2707, donors_hint: 34 },
  { slug: 'coimbatore', name: 'Coimbatore', name_ta: 'கோயம்புத்தூர்', lat: 11.0168, lon: 76.9558, donors_hint: 26 },
  { slug: 'madurai', name: 'Madurai', name_ta: 'மதுரை', lat: 9.9252, lon: 78.1198, donors_hint: 22 },
  { slug: 'tiruchirappalli', name: 'Tiruchirappalli', name_ta: 'திருச்சிராப்பள்ளி', lat: 10.7905, lon: 78.7047, donors_hint: 18 },
  { slug: 'salem', name: 'Salem', name_ta: 'சேலம்', lat: 11.6643, lon: 78.146, donors_hint: 14 },
  { slug: 'tirunelveli', name: 'Tirunelveli', name_ta: 'திருநெல்வேலி', lat: 8.7139, lon: 77.7567, donors_hint: 12 },
  { slug: 'kanniyakumari', name: 'Kanniyakumari', name_ta: 'கன்னியாகுமரி', lat: 8.1833, lon: 77.4119, donors_hint: 8 },
  { slug: 'erode', name: 'Erode', name_ta: 'ஈரோடு', lat: 11.341, lon: 77.7172, donors_hint: 9 },
  { slug: 'vellore', name: 'Vellore', name_ta: 'வேலூர்', lat: 12.9165, lon: 79.1325, donors_hint: 11 },
  { slug: 'thanjavur', name: 'Thanjavur', name_ta: 'தஞ்சாவூர்', lat: 10.787, lon: 79.1378, donors_hint: 10 },
]

export const GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

// Tamil first names (transliterated) + last-name initials only.
const FIRST = {
  masculine: ['Arun', 'Karthik', 'Vignesh', 'Suresh', 'Manoj', 'Prakash', 'Dinesh', 'Ganesh', 'Hari', 'Jeevan', 'Kumaran', 'Lokesh', 'Muthu', 'Naveen', 'Praveen', 'Raghav', 'Sakthivel', 'Saravanan', 'Sathish', 'Selvam', 'Senthil', 'Surya', 'Tharun', 'Udhaya', 'Vasanth', 'Vijay', 'Yuvaraj', 'Aravind', 'Balaji', 'Chandran', 'Elango', 'Gokul', 'Ilango', 'Kannan', 'Krishna', 'Mohan', 'Nandakumar', 'Pandian', 'Ramesh', 'Sanjay'],
  feminine: ['Aishwarya', 'Anitha', 'Bhavani', 'Chitra', 'Deepa', 'Divya', 'Gayathri', 'Harini', 'Indira', 'Janani', 'Kavya', 'Keerthana', 'Lakshmi', 'Meena', 'Nandini', 'Nithya', 'Pavithra', 'Priya', 'Ranjani', 'Revathi', 'Sandhya', 'Sangeetha', 'Sharmila', 'Sneha', 'Sowmya', 'Swetha', 'Tamilselvi', 'Uma', 'Vani', 'Vishali', 'Yamuna', 'Abinaya', 'Dharani', 'Ezhil', 'Hemalatha', 'Jayanthi', 'Kalpana', 'Malathi', 'Poongodi', 'Suganya'],
}
const INITIALS = 'ABCDEFGHIJKLMNOPRSTV'.split('')
const AREAS = {
  chennai: ['Adyar', 'Anna Nagar', 'T. Nagar', 'Velachery', 'Mylapore', 'Porur', 'Tambaram'],
  coimbatore: ['RS Puram', 'Saibaba Colony', 'Peelamedu', 'Gandhipuram', 'Vadavalli'],
  madurai: ['Anna Nagar', 'KK Nagar', 'Simmakkal', 'Thirunagar', 'Villapuram'],
  tiruchirappalli: ['Srirangam', 'Thillai Nagar', 'K.K. Nagar', 'Puthur'],
  salem: ['Fairlands', 'Hasthampatti', 'Suramangalam', 'Ammapet'],
  tirunelveli: ['Palayamkottai', 'Town', 'Vannarpettai', 'Melapalayam'],
  kanniyakumari: ['Nagercoil', 'Kanyakumari', 'Marthandam', 'Colachel'],
  erode: ['Perundurai Road', 'Sampath Nagar', 'Veenavankudi'],
  vellore: ['Katpadi', 'Sathuvachari', 'Gandhi Nagar', 'Bagayam'],
  thanjavur: ['Medical College Road', 'Trichy Road', 'Nanjikottai'],
}

const NOW = new Date('2026-11-12T06:00:00Z')
const isoDate = (d) => d.toISOString().slice(0, 10)
const daysAgo = (n) => isoDate(new Date(NOW.getTime() - n * 864e5))
const daysAhead = (n) => isoDate(new Date(NOW.getTime() + n * 864e5))

// ------------------------------------------------------------------ donors
const donors = []
let id = 1001
for (const d of DISTRICTS) {
  for (let i = 0; i < d.donors_hint; i += 1) {
    const sex = chance(0.62) ? 'male' : 'female'
    const first = pick(FIRST[sex === 'male' ? 'masculine' : 'feminine'])
    const group = pick(['O+', 'O+', 'B+', 'B+', 'A+', 'A+', 'AB+', 'O-', 'B-', 'A-', 'AB-'])
    const lastGap = int(31, 400)
    donors.push({
      donor_id: `BL-D-${id}`,
      first_name: first,
      last_initial: `${pick(INITIALS)}.`,
      display_name: `${first} ${pick(INITIALS)}.`,
      blood_group: group,
      district_slug: d.slug,
      district_name: d.name,
      area: pick(AREAS[d.slug]),
      age_band: pick(['18–24', '25–34', '35–44', '45–55']),
      is_available: chance(0.72) && lastGap >= 90,
      is_verified: chance(0.86),
      last_donation_date: daysAgo(lastGap),
      total_donations: int(1, 14),
      response_minutes: int(6, 180),
      distance_km: Number((rand() * 9 + 0.4).toFixed(1)),
      consent_share_contact: chance(0.6),
      created_at: daysAgo(int(120, 900)),
    })
    id += 1
  }
}

// ----------------------------------------------------------------- requests
const HOSPITALS = [
  { hospital_name: 'Government General Hospital', district_slug: 'chennai', area: 'Park Town' },
  { hospital_name: 'Coimbatore Medical College Hospital', district_slug: 'coimbatore', area: 'Civil Aerodrome Post' },
  { hospital_name: 'Madurai Rajaji Government Hospital', district_slug: 'madurai', area: 'Panagal Road' },
  { hospital_name: 'K.A.P. Viswanatham Medical College', district_slug: 'tiruchirappalli', area: 'Puthur' },
  { hospital_name: 'Salem Steel Plant Hospital', district_slug: 'salem', area: 'Steel Plant Road' },
  { hospital_name: 'Tirunelveli Medical College Hospital', district_slug: 'tirunelveli', area: 'High Ground' },
  { hospital_name: 'Asaripallam Government Medical College', district_slug: 'kanniyakumari', area: 'Asaripallam' },
  { hospital_name: 'Vellore Christian Medical Annexe', district_slug: 'vellore', area: 'Ida Scudder Road' },
]
const CONTEXT = [
  'Post-partum haemorrhage — theatre on standby',
  'Thalassaemia transfusion cycle, paediatric ward',
  'Road traffic trauma — emergency laparotomy',
  'Scheduled cardiac bypass, first case tomorrow',
  'Dengue with low platelets — intensive care',
  'Orthopaedic surgery after fall, elderly patient',
  'Chemotherapy support, day-care oncology',
  'Sickle cell crisis — haematology unit',
]
const requests = HOSPITALS.map((h, i) => {
  const needed = pick([1, 2, 2, 3, 3, 4, 5, 6])
  const pledged = Math.min(needed, Math.floor(rand() * needed))
  const urgency = i < 2 ? 'critical' : i < 5 ? 'urgent' : 'standard'
  return {
    request_id: `BL-R-${2100 + i}`,
    hospital_name: h.hospital_name,
    district_slug: h.district_slug,
    district_name: DISTRICTS.find((d) => d.slug === h.district_slug).name,
    area: h.area,
    blood_group: pick(GROUPS),
    units_needed: needed,
    units_pledged: pledged,
    urgency,
    needed_by: daysAhead(int(1, 6)),
    patient_context: CONTEXT[i],
    verified_by: 'Hospital blood bank coordinator',
    verified_at: daysAgo(int(0, 2)),
    contact_channel: 'BloodLink coordinator bridge',
    status: pledged >= needed ? 'fulfilled' : 'open',
    created_at: daysAgo(int(0, 3)),
  }
})

// -------------------------------------------------------------------- banks
const BANK_DEFS = [
  ['Chennai Blood Centre', 'chennai', 'Egmore', 'Government licensed', ['A+', 'O+', 'B+']],
  ['Kovai Lifeline Blood Bank', 'coimbatore', 'Ram Nagar', 'Government licensed', ['O+', 'O-', 'AB+']],
  ['Meenakshi Blood Centre', 'madurai', 'Anna Bus Stand', 'Hospital attached', ['B+', 'A+', 'O+']],
  ['Cauvery Blood Bank', 'tiruchirappalli', 'Cantonment', 'Government licensed', ['A+', 'B+', 'O-']],
  ['Salem Regional Blood Centre', 'salem', 'Fairlands', 'Government licensed', ['O+', 'A+', 'B-']],
  ['Nellai Blood Bank', 'tirunelveli', 'Palayamkottai', 'Hospital attached', ['O+', 'B+', 'AB+']],
  ['Cape Blood Centre', 'kanniyakumari', 'Nagercoil', 'Government licensed', ['O+', 'A+', 'O-']],
  ['Vellore CMC Blood Bank', 'vellore', 'Ida Scudder Road', 'Hospital attached', ['A+', 'B+', 'O+', 'AB+']],
]
const banks = BANK_DEFS.map(([name, slug, area, type, strong], i) => {
  const stock = {}
  for (const g of GROUPS) {
    const strongHere = strong.includes(g)
    stock[g] = Math.max(0, Math.round((strongHere ? rand() * 26 + 10 : rand() * 14 - 2)))
  }
  return {
    bank_id: `BL-B-${3100 + i}`,
    name,
    district_slug: slug,
    district_name: DISTRICTS.find((d) => d.slug === slug).name,
    area,
    type,
    is_verified: true,
    cold_chain_ok: true,
    open_hours: pick(['24 × 7', '7:00 – 21:00', '8:00 – 20:00']),
    component_separation: chance(0.8),
    stock_units: stock,
    total_units: Object.values(stock).reduce((a, b) => a + b, 0),
    last_updated: `${int(2, 40)} min ago`,
  }
})

// ------------------------------------------------------------------- impact
const MONTHS = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']
let base = 640
const monthly = MONTHS.map((label) => {
  base = Math.round(base * (1 + (rand() * 0.16 - 0.04)))
  return { month_label: label, donations: base, units: base, lives_reached: base * 3 }
})

const district_bars = DISTRICTS.map((d) => ({
  district_slug: d.slug,
  district_name: d.name,
  donors_registered: donors.filter((x) => x.district_slug === d.slug).length + int(20, 90),
  donations_ytd: int(120, 980),
})).sort((a, b) => b.donations_ytd - a.donations_ytd)

const impact = {
  counters: {
    donors_registered: 12847,
    units_collected_ytd: monthly.reduce((a, b) => a + b.units, 0),
    lives_reached: monthly.reduce((a, b) => a + b.lives_reached, 0),
    hospitals_onboarded: 64,
    banks_onboarded: 38,
    avg_match_minutes: 24,
  },
  monthly_donations: monthly,
  district_totals: district_bars,
  stories: [
    {
      story_id: 'BL-S-01',
      quote:
        'I registered on a Tuesday evening because my sister needed two units. By Wednesday noon, three strangers from Adyar had pledged. The first one arrived before my shift ended.',
      attribution: 'Suresh K.',
      role: 'Donor since 2019 · Chennai',
      blood_group: 'B+',
      donations: 11,
      is_sample: true,
    },
    {
      story_id: 'BL-S-02',
      quote:
        'The reminder came ninety days after my last donation, exactly when my body was ready again. I have never had to remember a date myself since then.',
      attribution: 'Priya M.',
      role: 'Donor since 2021 · Coimbatore',
      blood_group: 'O+',
      donations: 6,
      is_sample: true,
    },
    {
      story_id: 'BL-S-03',
      quote:
        'I organised a camp in our college hostel. Fifty-one students registered, forty-two were eligible, and every unit was collected by the district blood centre the same evening.',
      attribution: 'Karthik R.',
      role: 'Camp organiser · Tiruchirappalli',
      blood_group: 'A+',
      donations: 4,
      is_sample: true,
    },
  ],
  generated_at: NOW.toISOString(),
  is_sample: true,
}

// ------------------------------------------------------------------- misc
const reference = {
  blood_groups: GROUPS.map((g) => ({
    code: g,
    label: g,
    is_negative: g.endsWith('-'),
    rarity_note: ['O-', 'A-', 'B-', 'AB-'].includes(g) ? 'Rare — universal donor' : null,
  })),
  districts: DISTRICTS.map(({ slug, name, name_ta, lat, lon }) => ({ slug, name, name_ta, lat, lon })),
}

// Stylised Tamil Nadu outline in real [lon, lat] pairs. Projected at render
// time by <TamilNaduMap/>, so the map is data-driven, not a screenshot.
const tn_map = {
  outline: [
    [77.75, 12.75], [78.5, 12.9], [78.95, 13.02], [79.32, 13.26], [79.86, 13.44],
    [80.16, 13.24], [80.32, 13.06], [80.24, 12.62], [80.02, 12.15], [79.9, 11.78],
    [79.83, 11.36], [79.86, 10.98], [79.83, 10.72], [79.87, 10.3], [79.72, 10.02],
    [79.42, 9.72], [79.15, 9.42], [78.94, 9.12], [78.98, 8.92], [78.62, 8.82],
    [78.28, 8.62], [77.98, 8.44], [77.68, 8.18], [77.54, 8.07], [77.36, 8.28],
    [77.22, 8.55], [77.02, 8.78], [76.94, 9.18], [77.02, 9.55], [76.86, 9.86],
    [76.72, 10.16], [76.52, 10.34], [76.62, 10.72], [76.72, 11.06], [76.88, 11.42],
    [77.02, 11.72], [77.18, 11.98], [77.34, 12.2], [77.52, 12.42],
  ],
  label_offset: {
    chennai: [10, -6], coimbatore: [-6, 10], madurai: [8, 6], tiruchirappalli: [8, -4],
    salem: [6, -8], tirunelveli: [-8, 12], kanniyakumari: [-14, 6], erode: [-10, 6],
    vellore: [8, 2], thanjavur: [10, 10],
  },
}

await mkdir(DATA, { recursive: true })
const write = (name, obj) =>
  writeFile(path.join(DATA, name), JSON.stringify(obj, null, 2) + '\n')

await Promise.all([
  write('donors.json', { donors, generated_at: NOW.toISOString(), is_sample: true }),
  write('requests.json', { requests, generated_at: NOW.toISOString(), is_sample: true }),
  write('banks.json', { banks, generated_at: NOW.toISOString(), is_sample: true }),
  write('impact.json', impact),
  write('reference.json', reference),
  write('tn-map.json', tn_map),
])

console.log(
  `donors=${donors.length} requests=${requests.length} banks=${banks.length} districts=${DISTRICTS.length}`,
)
