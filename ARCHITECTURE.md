# Architecture conventions

Living conventions for this portfolio and every future project rewrite. Copy this file into new repos and keep the patterns aligned.

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Sass + CSS Modules** (`*.module.scss`) with **BEM** naming inside modules
- **Jest** via `next/jest` + Testing Library + **MSW** (`src/msw`)
- Deploy to **Vercel** (Hobby is fine for personal projects)

No Tailwind. Prefer Sass modules over global utility CSS.

## Folder layout

```text
src/
  app/                 # Next.js routes only — keep thin
  components/          # React components (PascalCase folders)
  content/             # Optional MDX writeups, etc.
  data/                # Typed content registries (camelCase files)
  utils/               # Non-React helpers (camelCase files)
  msw/                 # Mock Service Worker handlers + server
  styles/              # globals + Sass tokens/mixins
```

`src/` stays the root of application code. Config files (`next.config.ts`, `jest.config.ts`, `tsconfig.json`) live at the repo root.

## Casing

| Kind | Case | Example |
|---|---|---|
| React components (folders + `.tsx`) | PascalCase | `GridItem/GridItem.tsx` |
| Everything else | camelCase | `github.ts`, `projects.ts`, `_tokens.scss` |

## Component anatomy

```text
ComponentName/
  index.ts                 # barrel re-export
  ComponentName.tsx
  ComponentName.module.scss
  __tests__/ComponentName.test.tsx
  __mocks__/               # only when useful
```

BEM inside modules is for structure/readability (`.gridItem`, `.gridItem__title`, `.gridItem--featured`). CSS Modules already scope class names.

## Utils

Flat camelCase files under `src/utils/` with a shared `__tests__/` directory:

```text
utils/
  github.ts
  getProjectPage.ts
  __tests__/
    github.test.ts
```

## Import aliases

Configured in `tsconfig.json` `paths` (honored by Next.js and `next/jest`):

- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@utils/*` → `src/utils/*`
- `@data/*` → `src/data/*`
- `@styles/*` → `src/styles/*`
- `@msw/*` → `src/msw/*`
- `@content/*` → `src/content/*`

Sass modules import tokens with relative paths (reliable under Turbopack), e.g. `@use "../../styles/tokens" as *`. Partials in `src/styles/` can still `@use "tokens"` as siblings.

## Portfolio content model

**Thin registry** (`src/data/projects.ts`): `slug`, `title`, `description`, `tags`, `repo`, `legacyRepo?`, `liveUrl?`, `status`, `year`.

**Optional writeups** (`src/content/projects/{slug}.mdx`): add only when a project has a story. Register the loader in `src/utils/getProjectPage.ts`.

`/projects/[slug]` always exists — MDX when present, otherwise a short generic page from registry fields.

## Testing

- Component tests colocated in `__tests__/`
- Network tests use MSW (`src/msw/handlers.ts` + `src/msw/server.ts`) wired in `jest.setup.ts`
- Run with `npm test`

## Rewrite lifecycle (other repos)

1. Inspect the old repo
2. Create a **new** repo (rename allowed) using these conventions
3. Deploy to Vercel
4. Archive the old repo
5. Update this portfolio’s registry (`repo`, `legacyRepo`, `liveUrl`, `status`) and add MDX history when useful

## Future UI notes

- `BackgroundLayer` owns the full-bleed background; later swap in a floating star-grid canvas without restructuring routes
- `SidebarNav` is present but secondary in v1 — expand when star-grid navigation needs it
