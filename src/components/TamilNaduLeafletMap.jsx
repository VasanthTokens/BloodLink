import { useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * TamilNaduLeafletMap
 * ---------------------------------------------------------------------------
 * A real, interactive map of Tamil Nadu (Leaflet + OpenStreetMap tiles).
 *
 * Progressive enhancement, deliberately:
 *   • `ready` turns true only once the first tile actually paints. Until then
 *     (slow network, blocked tiles, offline, sandboxed preview iframe) the
 *     caller keeps showing <TamilNaduMap/>, the vector fallback. No blank grey
 *     rectangle, ever.
 *   • If tiles never arrive we simply never swap — the fallback stays.
 *
 * District markers are real lat/lon (src/data/reference.json). Markers are
 * DivIcons so they can carry the design system: teal = stock verified,
 * crimson = donors only, with a soft pulse when a district has stock.
 */

const OVERVIEW = { center: [10.55, 78.55], zoom: 6.4 }

/**
 * Tiles.
 *
 * Default is OSM's public tile service, which is fine for a prototype under
 * their tile usage policy (attribution kept, no bulk scraping). Before launch,
 * swap TILE_URL/TILE_ATTRIBUTION for your own tile server or a commercial
 * provider — see README → "Map tiles". Everything else stays identical.
 */
const TILE_URL =
  import.meta.env.VITE_MAP_TILES_URL ?? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILE_ATTRIBUTION =
  import.meta.env.VITE_MAP_ATTRIBUTION ??
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'

function markerHtml(d, { active, hasStock }) {
  const dot = hasStock ? '#0F6B66' : '#B3122B'
  const size = active ? 15 : 11
  return `
    <span class="bl-pin ${hasStock ? 'bl-pin--stock' : 'bl-pin--donor'} ${
      active ? 'is-active' : ''
    }" style="--dot:${dot};--size:${size}px">
      <span class="bl-pin__halo"></span>
      <span class="bl-pin__dot"></span>
      <span class="bl-pin__label">${d.name}</span>
    </span>`
}

export default function TamilNaduLeafletMap({
  districts = [],
  geometry,
  activeSlug,
  onSelect,
  onReady,
  onUnavailable,
  className = '',
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef(new Map())
  const boundsRef = useRef(null)
  const onSelectRef = useRef(onSelect)
  const onReadyRef = useRef(onReady)
  const onUnavailableRef = useRef(onUnavailable)

  // Keep the latest callbacks without re-initialising the map.
  useEffect(() => {
    onSelectRef.current = onSelect
    onReadyRef.current = onReady
    onUnavailableRef.current = onUnavailable
  }, [onSelect, onReady, onUnavailable])

  const points = useMemo(
    () => districts.filter((d) => Number.isFinite(d.lat) && Number.isFinite(d.lon)),
    [districts],
  )

  /* ------------------------------------------------------------- init once */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined

    const map = L.map(containerRef.current, {
      center: OVERVIEW.center,
      zoom: OVERVIEW.zoom,
      zoomSnap: 0.1,
      zoomDelta: 0.5,
      scrollWheelZoom: false, // never hijack page scroll — Lenis owns that
      dragging: true,
      keyboard: true,
      attributionControl: true,
      zoomControl: false,
      // Keep the state framed rather than letting users drift to the Arctic.
      maxBounds: [
        [7.2, 74.8],
        [14.4, 82.6],
      ],
      maxBoundsViscosity: 0.8,
      minZoom: 6,
      maxZoom: 11,
    })
    mapRef.current = map

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    /* A dedicated tint pane sits above the tiles and below the veil + markers.
       Dark mode dims the basemap with a scrim instead of inverting the tiles:
       inverted OSM labels are hard to read, and the invert() filter also
       painted a stray 1px blue frame around the tile layer. */
    const tint = map.createPane('bl-tint')
    tint.style.zIndex = '350'
    tint.style.pointerEvents = 'none'
    map.attributionControl.setPrefix('')

    const tiles = L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19,
      minZoom: 5,
      detectRetina: true,
    })
    tiles.addTo(map)

    let announced = false
    let failures = 0
    const announce = () => {
      if (announced) return
      announced = true
      onReadyRef.current?.()
    }
    // Announce on a real tile paint only. Leaflet's own 'load' event fires even
    // when every tile errored, which would leave a blank map on screen.
    tiles.on('tileload', announce)
    tiles.on('tileerror', () => {
      failures += 1
      if (failures >= 3 && !announced) {
        // Tiles are blocked or offline: tell the caller so it can unmount us
        // and keep the vector diagram. No point hammering the network.
        onUnavailableRef.current?.()
      }
    })
    const timeout = setTimeout(() => {
      if (!announced) onUnavailableRef.current?.()
    }, 6000)

    // Clicking the water clears the district filter.
    map.on('click', () => onSelectRef.current?.(null))

    /* Spotlight: everything outside Tamil Nadu is veiled, the state boundary
       itself is drawn as a crimson hairline. Purely presentational — the
       basemap still does the geographic work, the veil just answers
       "where are we?" in one glance. */
    const ring = geometry?.outline
    if (ring?.length > 3) {
      const latlngs = ring.map(([lon, lat]) => [lat, lon])
      const world = [
        [-89, -179],
        [-89, 179],
        [89, 179],
        [89, -179],
      ]
      L.polygon([world, [...latlngs].reverse()], {
        className: 'bl-tn-veil',
        stroke: false,
        fill: true,
        fillOpacity: 1,
        interactive: false,
      }).addTo(map)
      L.polygon(latlngs, {
        className: 'bl-tn-edge',
        stroke: true,
        weight: 1.4,
        fill: false,
        interactive: false,
      }).addTo(map)

      /* Frame the state properly instead of guessing a zoom — this adapts to
         whether the map is 300px tall on a phone or 420px on desktop. */
      const bounds = L.latLngBounds(latlngs)
      boundsRef.current = bounds
      map.fitBounds(bounds, { padding: [18, 18], maxZoom: 7.2, animate: false })
    }

    return () => {
      clearTimeout(timeout)
      tiles.off()
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      markersRef.current.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry])

  /* ----------------------------------------------------- markers / styling */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return undefined

    const seen = new Set()

    for (const d of points) {
      seen.add(d.slug)
      const active = activeSlug === d.slug
      const hasStock = !!d.has_bank

      const icon = L.divIcon({
        className: 'bl-pin-wrap',
        html: markerHtml(d, { active, hasStock }),
        iconSize: [1, 1], // the CSS pin centres itself on the point
        iconAnchor: [0, 0],
      })

      const existing = markersRef.current.get(d.slug)
      if (existing) {
        existing.setIcon(icon)
        existing.setZIndexOffset(active ? 1000 : 0)
      } else {
        const marker = L.marker([d.lat, d.lon], {
          icon,
          keyboard: true,
          title: `${d.name} — ${d.banks ?? 0} blood bank${d.banks === 1 ? '' : 's'}`,
          alt: `${d.name}: ${d.banks ?? 0} blood banks, ${
            hasStock ? 'stock available' : 'no stock data'
          }`,
          riseOnHover: true,
        })
        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e)
          onSelectRef.current?.(d.slug)
        })
        marker.addTo(map)
        markersRef.current.set(d.slug, marker)
      }
    }

    for (const [slug, marker] of markersRef.current) {
      if (!seen.has(slug)) {
        marker.remove()
        markersRef.current.delete(slug)
      }
    }

    return undefined
  }, [points, activeSlug])

  /* --------------------------- selection → fly to it · cleared → reframe */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!activeSlug) {
      // "All districts" restores the whole-state framing.
      if (boundsRef.current) {
        map.flyToBounds(boundsRef.current, {
          padding: [18, 18],
          maxZoom: 7.2,
          duration: 0.8,
        })
      }
      return
    }
    const d = points.find((p) => p.slug === activeSlug)
    if (!d) return
    map.flyTo([d.lat, d.lon], Math.max(map.getZoom(), 8), { duration: 0.9 })
  }, [activeSlug, points])

  /* Don't force `relative` when the caller positions the map itself — Tailwind
     layer order would make .relative win over .absolute and collapse the box. */
  const selfPositioned = /(^|\s)(absolute|fixed|sticky)\b/.test(className)

  return (
    <div className={`${selfPositioned ? '' : 'relative'} ${className}`}>
      <div
        ref={containerRef}
        className="bl-leaflet h-full w-full"
        role="application"
        aria-label="Map of Tamil Nadu showing blood bank coverage. District buttons below the map provide the same information as a list."
      />
      {/* keeps the map inside the card's rounded corners + theme tint */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-current/10"
        aria-hidden="true"
      />
    </div>
  )
}
