# Portfolio

Personal portfolio hub: a Next.js site with a project grid that links to detail pages (and outward to live apps / GitHub).

## Stack

- Next.js (App Router) + TypeScript
- Sass + CSS Modules (BEM)
- Jest + Testing Library + MSW
- Optional MDX writeups per project
- `/lab`: WebGL physics-field experiments (three.js, react-three-fiber, Rapier, postprocessing, Leva)

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
- Tune lab variants and lighting in [`src/data/lab/`](src/data/lab/); the Leva "Tuning" panel on each `/lab/[variant]` page lets you dial values live before promoting them into the presets
