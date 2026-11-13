# BloodLink — The journey of a drop

A cinematic, story-driven landing page for **BloodLink**, a fictional platform connecting voluntary blood donors, hospitals, and licensed blood banks across Tamil Nadu.

> **Prototype disclaimer:** All donors, hospitals, blood banks, stock levels, requests, impact figures, and testimonials are synthetic demo data. There are no real patient records, real phone numbers, or medical integrations. The interface labels prototype information accordingly.

## Features

- Donor registration and donor directory
- Urgent blood requests and pledge interactions
- Blood bank network with map and outline fallback
- Host-a-camp request form
- Impact dashboard with illustrative sample figures
- Responsive layout, dark/light theme, and motion preferences
- Tamil Nadu-focused content and map
- Mock API/service layer for prototype data

## 1. Run locally

Requirements: **Node.js 18+** and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

### Production build

```bash
npm run build
npm run preview
```

The production output is generated in `dist/`.

## 2. Tech stack

- React
- Vite
- JavaScript
- Tailwind CSS
- Framer Motion / GSAP (animations)
- Leaflet + OpenStreetMap (map; network access required for tiles)

## 3. Project structure

```text
bloodlink/
├── public/                 # Static assets and generated image renditions
├── raw/                    # Source photography (ignored by Git by default)
├── scripts/                 # Data and image-generation scripts
├── src/
│   ├── assets/             # Image manifest and assets
│   ├── data/               # Synthetic prototype data
│   ├── services/            # Mock API/service boundary
│   ├── hooks/               # Shared hooks
│   ├── components/          # UI components
│   ├── sections/            # Page sections
│   └── styles/               # Design tokens and global styles
├── package.json
├── vite.config.js
└── README.md
```

## 4. Data and prototype behavior

The application uses seeded, synthetic data for demonstration. Some actions (such as pledging or camp requests) may show local confirmation but **do not send information to a real backend or persist to a database**.

To regenerate the sample data, if supported by the project scripts:

```bash
npm run data
```

To regenerate image renditions, if supported:

```bash
npm run images
```

## 5. Deployment

This is a Vite static site.

| Platform | Build command | Publish/output directory |
|---|---|---|
| Vercel | `npm run build` | `dist` |
| Netlify | `npm run build` | `dist` |
| Other static hosting | `npm run build` | Upload `dist/` |

The repository includes `vercel.json` and `netlify.toml` deployment configuration.

## 6. Accessibility and performance

The project includes responsive layouts, keyboard-focus styling, reduced-motion handling, and loading/empty/error states in relevant sections. Map tiles require an internet connection; an outline fallback is available when tiles cannot load.

## 7. Replace prototype assets

Generated demo images are stored under `public/img/`. Source images are kept in `raw/` and are ignored by Git by default. If you replace images, use the project's image-generation script (when available) to rebuild responsive renditions.

## Disclaimer

**BloodLink is a fictional demonstration project, not a real blood donation or emergency service.** Do not use it to request blood, contact donors, or make medical decisions.
