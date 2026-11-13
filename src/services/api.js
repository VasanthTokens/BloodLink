/**
 * BloodLink service layer.
 *
 * THE ONLY PLACE THAT TOUCHES DATA. Components must never import from /src/data.
 *
 * Every function below is already shaped like the future REST endpoint it maps
 * to (see README). To go live, swap the body of `request()` for `fetch()`:
 *
 *   async function request(path, { params, method = 'GET', body, signal } = {}) {
 *     const qs = params ? '?' + new URLSearchParams(prune(params)) : ''
 *     const res = await fetch(`/api${path}${qs}`, {
 *       method, signal,
 *       headers: { 'Content-Type': 'application/json' },
 *       body: body ? JSON.stringify(body) : undefined,
 *     })
 *     if (!res.ok) throw new ApiError(...)
 *     return res.json()
 *   }
 *
 * Nothing in /src/components or /src/sections changes.
 */

import donorsFile from '../data/donors.json'
import requestsFile from '../data/requests.json'
import banksFile from '../data/banks.json'
import impactFile from '../data/impact.json'
import referenceFile from '../data/reference.json'
import mapFile from '../data/tn-map.json'

import { readMock } from './mockStore'

export class ApiError extends Error {
  constructor(message, status = 500, code = 'internal_error') {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

const prune = (obj = {}) =>
  Object.entries(obj).reduce((acc, [k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'all') acc[k] = v
    return acc
  }, {})

/** Simulated network hop so loading skeletons are real, not cosmetic. */
const LATENCY = Number(import.meta.env.VITE_MOCK_LATENCY ?? 420)

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const t = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(t)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

/** GET /donors */
export async function getDonors({ group, district, availableOnly } = {}, { signal } = {}) {
  const donors = readMock('donors', donorsFile.donors)
  await delay(LATENCY, signal)

  const filtered = donors
    .filter((d) => (group ? d.blood_group === group : true))
    .filter((d) => (district ? d.district_slug === district : true))
    .filter((d) => (availableOnly ? d.is_available : true))
    .sort((a, b) => {
      // Verified + available + fastest responders first — mirrors server ranking.
      const score = (x) => (x.is_verified ? 2 : 0) + (x.is_available ? 2 : 0)
      return score(b) - score(a) || a.response_minutes - b.response_minutes
    })

  return {
    data: filtered,
    meta: {
      total: filtered.length,
      filters: { blood_group: group ?? null, district_slug: district ?? null, available_only: !!availableOnly },
      is_sample: true,
      latency_ms: LATENCY,
    },
  }
}

/** GET /requests */
export async function getRequests({ district, group, signal } = {}) {
  const requests = readMock('requests', requestsFile.requests)
  await delay(LATENCY, signal)

  const order = { critical: 0, urgent: 1, standard: 2 }
  const data = requests
    .filter((r) => (district ? r.district_slug === district : true))
    .filter((r) => (group ? r.blood_group === group : true))
    .sort((a, b) => order[a.urgency] - order[b.urgency] || a.needed_by.localeCompare(b.needed_by))

  return {
    data,
    meta: {
      total: data.length,
      critical: data.filter((r) => r.urgency === 'critical').length,
      is_sample: true,
    },
  }
}

/** GET /banks */
export async function getBanks({ district, group, signal } = {}) {
  const banks = readMock('banks', banksFile.banks)
  await delay(LATENCY, signal)

  const data = banks
    .filter((b) => (district ? b.district_slug === district : true))
    .map((b) => ({
      ...b,
      // Server computes "has stock" so the UI never does domain maths.
      stock_status: Object.fromEntries(
        Object.entries(b.stock_units).map(([g, units]) => [
          g,
          units === 0 ? 'out' : units < 5 ? 'low' : 'available',
        ]),
      ),
      ...(group ? { units_for_selected_group: b.stock_units[group] ?? 0 } : {}),
    }))

  return { data, meta: { total: data.length, is_sample: true } }
}

/** GET /impact */
export async function getImpact({ signal } = {}) {
  await delay(LATENCY, signal)
  return { data: impactFile, meta: { is_sample: true, generated_at: impactFile.generated_at } }
}

/** GET /reference — blood groups + districts (static enums) */
export async function getReference() {
  return { data: referenceFile, meta: { is_sample: true } }
}

/**
 * GET /reference/map — stylised Tamil Nadu outline in [lon, lat] pairs.
 * Geometry lives behind the service like everything else, so a future API can
 * serve a survey-accurate GeoJSON without the map component changing.
 */
export async function getMapGeometry() {
  return {
    data: { outline: mapFile.outline, label_offset: mapFile.label_offset },
    meta: { projection: 'equirectangular', stylised: true, is_sample: true },
  }
}

/** GET /donors/:id */
export async function getDonor(id, { signal } = {}) {
  const donors = readMock('donors', donorsFile.donors)
  await delay(Math.min(LATENCY, 240), signal)
  const donor = donors.find((d) => d.donor_id === id)
  if (!donor) throw new ApiError('Donor not found', 404, 'not_found')
  return { data: donor, meta: { is_sample: true } }
}

/**
 * POST /donors
 * Validated on the server too — the client form is a courtesy, not the gate.
 */
export async function registerDonor(payload, { signal } = {}) {
  await delay(760, signal)

  const required = ['full_name', 'blood_group', 'district_slug', 'phone', 'date_of_birth', 'consent_data_use']
  const missing = required.filter((k) => payload[k] === undefined || payload[k] === '' || payload[k] === false)
  if (missing.length) {
    throw new ApiError(`Missing required fields: ${missing.join(', ')}`, 422, 'validation_error')
  }
  if (!/^[6-9]\d{9}$/.test(String(payload.phone))) {
    throw new ApiError('Enter a valid 10-digit Indian mobile number.', 422, 'invalid_phone')
  }

  // Fictional echo of what a POST would persist.
  return {
    data: {
      donor_id: `BL-D-${9000 + Math.floor(Math.random() * 900)}`,
      display_name: `${payload.full_name.trim().split(' ')[0]} ${(payload.full_name.trim().split(' ')[1]?.[0] ?? '')}.`.trim(),
      blood_group: payload.blood_group,
      district_slug: payload.district_slug,
      is_verified: false,
      is_available: true,
      verification_due: 'Coordinator call within 24 hours',
      created_at: new Date().toISOString(),
    },
    meta: { is_sample: true, message: 'Registration received. No real record was created in this prototype.' },
  }
}

/** POST /requests/:id/pledges */
export async function pledgeRequest(id, { signal } = {}) {
  await delay(520, signal)
  const requests = readMock('requests', requestsFile.requests)
  const index = requests.findIndex((r) => r.request_id === id)
  if (index === -1) throw new ApiError('Request not found', 404, 'not_found')

  const current = requests[index]
  if (current.units_pledged >= current.units_needed) {
    throw new ApiError('This request is already fully pledged.', 409, 'already_fulfilled')
  }

  const next = {
    ...current,
    units_pledged: current.units_pledged + 1,
    status: current.units_pledged + 1 >= current.units_needed ? 'fulfilled' : 'open',
  }
  // Persist into the mock store so the UI stays consistent across refetches.
  const updated = requests.map((r, i) => (i === index ? next : r))
  readMock.set('requests', updated)

  return {
    data: next,
    meta: { is_sample: true, remaining_units: Math.max(0, next.units_needed - next.units_pledged) },
  }
}

/** POST /camps */
export async function requestCamp(payload, { signal } = {}) {
  await delay(700, signal)
  return {
    data: { camp_request_id: `BL-C-${Math.floor(Math.random() * 9000 + 1000)}`, status: 'received', ...payload },
    meta: { is_sample: true, message: 'Sample submission — nothing was sent.' },
  }
}

export const api = {
  getDonors,
  getRequests,
  getBanks,
  getImpact,
  getReference,
  getMapGeometry,
  getDonor,
  registerDonor,
  pledgeRequest,
  requestCamp,
}

export default api
