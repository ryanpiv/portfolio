# Portfolio

Personal portfolio hub: a Next.js site whose homepage offers two ways in — an arcade free-roam browser (WebGL) or the classic roster, a character-select strip of projects with a grid toggle — each linking to detail pages (and outward to live apps / GitHub). Devices that cannot run the arcade well (no WebGL, touch-only, low-power) are pointed at the classic way in.

## Stack

- Next.js (App Router) + TypeScript
- Sass + CSS Modules (BEM)
- Jest + Testing Library + MSW
- Optional MDX writeups per project
- `/lab`: WebGL experiments (three.js, react-three-fiber, Rapier, postprocessing, Leva) — physics fields of the project registry, plus an arcade rail shooter and a free-roam arena whose portals open the project pages, with achievements shared between the two. Every scene has a low / balanced / high quality tier (picked from the device, stepped down on frame drops), a settings menu whose choices (theme, quality, effects) are remembered in the browser, and a plain-HTML fallback without WebGL

See [ARCHITECTURE.md](./ARCHITECTURE.md) for conventions carried into future rewrites.

## Develop

```bash
npm install
npm run dev
```

```bash
npm test
npm run build
npm run lint
```

Optional: set `GITHUB_TOKEN` in `.env.local` for higher GitHub API rate limits when enriching repo metadata at build time.

## Deploy (Vercel)

1. Import `ryanpiv/portfolio` in the [Vercel dashboard](https://vercel.com/new).
2. Framework preset: Next.js (defaults are fine).
3. Add your custom domain on the project’s Domains settings and point DNS at Vercel.

## Content

- Edit the grid in [`src/data/projects.ts`](src/data/projects.ts)
- Add a writeup at `src/content/projects/{slug}.mdx` and register it in [`src/utils/getProjectPage.ts`](src/utils/getProjectPage.ts)
- Tune lab variants, lighting, quality tiers, and arcade rules in [`src/data/lab/`](src/data/lab/); the Leva "Tuning" panel on each lab page (Settings → Developer → Tuning panel) lets you dial values live before promoting them into the presets
