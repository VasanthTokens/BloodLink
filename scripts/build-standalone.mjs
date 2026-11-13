/**
 * Builds one self-contained HTML file (no server, no network needed).
 *
 * Why: `index.html` at the project root is a Vite *entry point*, not a page —
 * it imports /src/main.jsx as an ES module, so opening it directly shows a
 * blank screen. This script produces `bloodlink-preview.html`, which has the
 * JS, CSS, fonts and photographs all inlined as data URIs, so it renders by
 * double-click, from a USB stick, or inside a sandboxed iframe with no network.
 *
 * The map in that file falls back to the vector outline automatically,
 * because Leaflet's OSM tiles can't load without a network.
 *
 * Run: npm run standalone
 */
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const OUT = path.join(ROOT, '.standalone')
const IMG = path.join(ROOT, 'public', 'img')

// One rendition per photograph keeps the file ~1.5 MB instead of ~6 MB.
const RENDITION_WIDTH = 900

const mime = {
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

/** Collapse the manifest to one rendition per photo, inlined as a data URI. */
async function collapsedManifest() {
  const images = JSON.parse(await fs.readFile(path.join(ROOT, 'src/assets/images.json'), 'utf8'))
  const available = new Set(await fs.readdir(IMG))
  const out = {}

  for (const [key, asset] of Object.entries(images)) {
    const candidates = [`${key}-${RENDITION_WIDTH}.webp`, `${key}-640.webp`, `${key}-1200.webp`]
    const pick =
      candidates.find((c) => available.has(c)) ??
      asset.sources.map((s) => path.basename(s.webp)).find((c) => available.has(c))

    if (!pick) continue
    const uri = await toDataUri(path.join(IMG, pick))

    out[key] = {
      name: key,
      width: Number(pick.match(/-(\d+)\.webp$/)?.[1] ?? asset.width),
      height: asset.height,
      lqip: asset.lqip,
      // One entry only → srcset is valid and nothing is duplicated.
      sources: [{ w: 1, webp: uri, avif: uri }],
      fallback: uri,
      standalone: true,
    }
    console.log(`   · ${key} ← ${pick} (${Math.round(uri.length / 1024)} kB)`)
  }
  return out
}

const toDataUri = async (file) => {
  const buf = await fs.readFile(file)
  return `data:${mime[path.extname(file)] ?? 'application/octet-stream'};base64,${buf.toString('base64')}`
}

async function main() {
  console.log('1/4  collapsing image manifest…')
  const images = await collapsedManifest()
  await fs.rm(OUT, { recursive: true, force: true })
  console.log('2/4  building with inlined dynamic imports…')

  await build({
    // Ignore vite.config.js — its manualChunks is incompatible with
    // inlineDynamicImports, which a single-file build requires.
    configFile: false,
    root: ROOT,
    base: './',
    logLevel: 'warn',
    plugins: [
      react(),
      {
        // Swap src/assets/manifest.js for a tiny module returning the
        // collapsed, data-URI manifest. Deterministic: the app imports the
        // manifest, the plugin decides what it contains.
        name: 'bloodlink-inline-manifest',
        enforce: 'pre',
        resolveId(id, importer) {
          if (id.endsWith('assets/manifest')) return '\0bloodlink-manifest'
          return null
        },
        async load(id) {
          if (id !== '\0bloodlink-manifest') return null
          return `export default ${JSON.stringify(await images)}`
        },
      },
    ],
    build: {
      outDir: OUT,
      emptyOutDir: true,
      cssCodeSplit: false,
      assetsInlineLimit: 0, // we inline by hand below, deterministically
      rollupOptions: {
        output: {
          // Fold the lazy Leaflet chunk back in — a single file can't fetch.
          inlineDynamicImports: true,
          manualChunks: undefined,
          entryFileNames: 'app.js',
          assetFileNames: 'app.[ext]',
        },
      },
    },
  })

  console.log('3/4  inlining fonts and CSS…')
  const html = await fs.readFile(path.join(OUT, 'index.html'), 'utf8')
  const files = await fs.readdir(path.join(OUT))

  const jsName = files.find((f) => f.endsWith('.js'))
  const cssName = files.find((f) => f.endsWith('.css'))
  let js = await fs.readFile(path.join(OUT, jsName), 'utf8')
  let css = await fs.readFile(path.join(OUT, cssName), 'utf8')



  // --- fonts referenced from the stylesheet -----------------------------
  const fontUrls = [...css.matchAll(/url\((?:"|')?\.\/([^"')]+\.woff2)(?:"|')?\)/g)].map((m) => m[1])
  for (const name of new Set(fontUrls)) {
    const uri = await toDataUri(path.join(OUT, name))
    css = css.split(`./${name}`).join(uri)
  }

  // --- photographs: alias the manifest module to a collapsed, inlined one --
  // --- favicon ----------------------------------------------------------
  const favicon = await toDataUri(path.join(ROOT, 'public', 'favicon.svg'))

  console.log('4/4  writing single file…')
  /* IMPORTANT: function replacements only. The minified bundle contains `$&`,
     `$\`` and `$'` sequences, which String.replace() would interpret as
     substitution patterns and silently corrupt the script. */
  let out = html
    .replace(/<link rel="icon"[^>]*>/, () => `<link rel="icon" href="${favicon}" />`)
    .replace(/<link rel="stylesheet"[^>]*>/, () => `<style>\n${css}\n</style>`)
    .replace(
      /<script type="module"[^>]*src="[^"]*"[^>]*><\/script>/,
      () => `<script type="module">\n${js}\n</script>`,
    )

  // Any raw `</script>` inside the bundle would terminate the tag early.
  const closers = (js.match(/<\/script/gi) ?? []).length
  if (closers) throw new Error(`bundle contains ${closers} literal </script> sequence(s)`)

  // Sanity: nothing must still point at a build asset.
  const leftovers = out.match(/(?:src|href)="\.?\/?assets\/[^"]+"/g)
  if (leftovers) throw new Error(`unresolved asset links: ${leftovers.join(', ')}`)

  const target = path.join(ROOT, 'bloodlink-preview.html')
  await fs.writeFile(target, out)
  await fs.rm(OUT, { recursive: true, force: true })

  const kb = Math.round((await fs.stat(target)).size / 1024)
  console.log(`\n✓ bloodlink-preview.html — ${kb} kB, fully self-contained.`)
  console.log('  Open it by double-clicking, or preview it in the workspace.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
