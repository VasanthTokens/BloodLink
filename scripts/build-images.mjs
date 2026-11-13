/**
 * Asset pipeline.
 *
 * Takes the source photographs in /raw, applies ONE consistent colour grade to
 * every frame (slight desaturation, warm crimson undertone, tiny shadow lift),
 * then emits responsive WebP + AVIF renditions plus a 24px blur-up placeholder.
 *
 * Output: /public/img/*.{webp,avif}  +  /src/assets/images.json
 *
 * Run with: npm run images
 */
import sharp from 'sharp'
import { mkdir, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const RAW = path.join(ROOT, 'raw')
const OUT = path.join(ROOT, 'public', 'img')

// Hero + CTA are used full-bleed, everything else is a section image.
const WIDTHS = {
  hero: [1920, 1440, 1080, 720, 480],
  wide: [1600, 1200, 900, 600, 400],
  section: [1200, 900, 640, 440, 320],
}

const PLAN = {
  hero: 'hero',
  'journey-donor': 'section',
  'journey-lab': 'section',
  'journey-store': 'section',
  'journey-deliver': 'section',
  'urgent-ward': 'section',
  'bank-fridge': 'section',
  'camp-college': 'section',
  'nurse-prep': 'section',
  'family-waiting': 'section',
  'patient-recovering': 'wide', // added later if regenerated
  'volunteers-refresh': 'section',
  'cta-hands': 'wide',
}

/** Flat colour layer used as a grading pass. */
async function tint(width, height, hex, alpha, blend) {
  const { r, g, b } = {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  }
  const buf = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r, g, b, alpha },
    },
  })
    .png()
    .toBuffer()
  return { input: buf, blend }
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const files = (await readdir(RAW)).filter((f) => /\.(png|jpe?g)$/i.test(f))

  const extra = JSON.parse(process.env.EXTRA_IMAGES || '{}') // reserved
  const manifest = { ...extra }

  for (const file of files) {
    const name = path.basename(file, path.extname(file))
    const sizing = PLAN[name] || 'section'
    const widths = WIDTHS[sizing]

    const meta = await sharp(path.join(RAW, file)).metadata()
    const w = meta.width
    const h = meta.height

    // --- grade once at full resolution -------------------------------
    const graded = await sharp(path.join(RAW, file))
      .rotate()
      .modulate({ saturation: 0.84, brightness: 1.02 })
      .linear(1.05, -6) // gentle contrast + shadow lift
      .composite([
        await tint(w, h, '#B3122B', 0.1, 'soft-light'),
        await tint(w, h, '#5C0A17', 0.06, 'multiply'),
        await tint(w, h, '#FBF7F6', 0.03, 'screen'),
      ])
      .toBuffer()

    // --- blur-up placeholder ------------------------------------------
    const lqip = await sharp(graded)
      .resize(24, null, { fit: 'inside' })
      .webp({ quality: 32, alphaQuality: 20 })
      .toBuffer()

    const sources = []
    for (const target of widths.filter((x) => x <= Math.max(w, 480))) {
      const base = sharp(graded).resize(target, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })

      const webp = path.join(OUT, `${name}-${target}.webp`)
      await base.clone().webp({ quality: 74, effort: 5 }).toFile(webp)

      const avif = path.join(OUT, `${name}-${target}.avif`)
      await base.clone().avif({ quality: 52, effort: 4 }).toFile(avif)

      sources.push({
        w: target,
        webp: `/img/${name}-${target}.webp`,
        avif: `/img/${name}-${target}.avif`,
      })
    }

    manifest[name] = {
      name,
      width: w,
      height: h,
      lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
      sources,
      fallback: sources[sources.length - 1].webp,
    }
    console.log(`✓ ${name} → ${sources.length} renditions`)
  }

  await writeFile(
    path.join(ROOT, 'src', 'assets', 'images.json'),
    JSON.stringify(manifest, null, 2) + '\n',
  )
  console.log(`\nManifest written with ${Object.keys(manifest).length} images.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
