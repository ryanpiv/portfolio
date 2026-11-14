# Architecture conventions

Living conventions for this portfolio and every future project rewrite. Copy this file into new repos and keep the patterns aligned.

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Sass + CSS Modules** (`*.module.scss`) with **BEM** naming inside modules
- **Jest** via `next/jest` + Testing Library + **MSW** (`src/msw`)
- **three.js** via react-three-fiber + Rapier + postprocessing for the `/lab` experiments
- Deploy to **Vercel** (Hobby is fine for personal projects)

No Tailwind. Prefer Sass modules over global utility CSS.

## Folder layout

```text
src/
  app/                 # Next.js routes only — keep thin
  components/          # React components (PascalCase folders)
  content/             # Optional MDX writeups, etc.
  data/                # Typed content registries (camelCase files or folders with index.ts)
  hooks/               # Site-wide React hooks (useSystemTheme)
  utils/               # Non-React helpers (camelCase files)
  msw/                 # Mock Service Worker handlers + server
  styles/              # globals + Sass tokens/mixins
```

`src/` stays the root of application code. Config files (`next.config.ts`, `jest.config.mjs`, `tsconfig.json`) live at the repo root.

## Code quality rules of thumb

- **DRY, but concretely.** Repeated JSX becomes a component (`TagList`, `ExternalLink`, `PillGroup`); repeated Sass becomes a mixin (`mono-label`, `page-container`); repeated string tables become data (`PROJECT_STATUS_LABELS`).
- **Smaller is better.** A file does one thing. Components over ~120 lines get split: extract hooks for behavior (`usePointerDrag`, `useBodyMotion`), subcomponents for markup (`Nameplate`, `HoverCard`), and pure functions for logic (`constraintSchema`, `applyLighting`).
- **Folders tell the story.** When a component grows helpers, group them in subfolders by role (see `PhysicsField/` below) rather than a flat list of twelve files.
- **Named constants over magic numbers.** `CLICK_SLOP_PX`, `LAYOUT_INSET`, `EMISSIVE_LAMBDA` — one definition, one comment.
- **Data in `src/data/`, not inside components.** Labels, presets, and option lists live next to their types so routes, HUDs, and badges all read the same source.

## Casing

| Kind | Case | Example |
|---|---|---|
| React components (folders + `.tsx`) | PascalCase | `GridItem/GridItem.tsx` |
| Everything else | camelCase | `github.ts`, `projects.ts`, `_tokens.scss` |

## Component anatomy

```text
ComponentName/
  index.ts                 # barrel re-export (public surface)
  ComponentName.tsx
  ComponentName.module.scss
  __tests__/ComponentName.test.tsx
  SubPart.tsx              # internal pieces; NOT re-exported from index.ts
```

BEM inside modules is for structure/readability (`.gridItem`, `.gridItem__title`, `.gridItem--featured`). CSS Modules already scope class names.

Larger components group internals by role:

```text
PhysicsField/
  index.ts, PhysicsField.tsx, PhysicsFieldScene.tsx, FieldWorld.tsx, fieldContext.ts
  hooks/         # useFieldBounds
  bodies/        # ProjectSphere + its hooks (usePointerDrag, useBodyMotion), StarHalo, Nameplate
  constraints/   # Constraints switch, Cage, Core, TetherLines, Tether, Attractor
  controls/      # Leva: useFieldControls + per-folder schema builders

StarFox/
  index.ts, StarFox.tsx, StarFoxScene.tsx, StarFoxHud.tsx, gameContext.ts
  hooks/         # useInput (keyboard + pointer → ref)
  entities/      # Ship (steering/banking), ShipModel (primitives)
  world/         # ChaseCamera, Ground (leapfrogging grid tiles), Scenery (recycled instances)
  controls/      # Leva: useStarFoxControls
```

Anything two lab scenes share lives outside both:

| Where | What |
|---|---|
| `components/LabScene/` | `LabLighting`, `LabEffects` (bloom + flare), `TuningPanel` (Leva host) |
| `components/LabHud/` | `LabHud` overlay shell (eyebrow/title/switches/controls/footer) + `LabHudCard`, `LabHudHint` |
| `hooks/useLabViewState` | URL-synced `theme` / view flags via `buildLabUrl` |
| `utils/leva` | `slider`, `num` schema helpers |

### Shared primitives

| Component | Purpose |
|---|---|
| `PageHeader` | eyebrow / h1 / lede hero for index pages |
| `TagList` | mono uppercase tag list |
| `ExternalLink` | `<a target="_blank" rel="noreferrer">` |
| `PillGroup` / `PillNav` | segmented control (buttons) / link flavour; themed via `--hud-*` custom properties |
| `StatusBadge` / `StatusLegend` | status chip / color key, both reading `PROJECT_STATUS_LABELS` |

## Styles

`src/styles/_index.scss` forwards tokens and mixins so every module needs one import:

```scss
@use "../../styles" as *;   // relative path — Turbopack ignores sassOptions.includePaths
```

Mixins: `page-container`, `respond-up`, `list-reset`, `mono-label`, `eyebrow`, `display-title`, `lede`, `mono-meta`, `mono-link`, `surface`, `focus-ring`, `visually-hidden`. Add a mixin the second time a pattern appears, not the first.

## Utils and hooks

Flat camelCase files under `src/utils/` and `src/hooks/`, each with a shared `__tests__/` directory. Utils are framework-free; hooks are React-only.

## Import aliases

Configured in `tsconfig.json` `paths` and mirrored in `jest.config.mjs`:

- `@/*` → `src/*`
- `@components/*`, `@utils/*`, `@data/*`, `@hooks/*`, `@styles/*`, `@msw/*`, `@content/*`

## Content model

**Thin registry** (`src/data/projects.ts`): `slug`, `title`, `description`, `tags`, `repo`, `legacyRepo?`, `liveUrl?`, `status`, `year`, plus `PROJECT_STATUSES` / `PROJECT_STATUS_LABELS`.

**Optional writeups** (`src/content/projects/{slug}.mdx`): add only when a project has a story. Register the loader in `src/utils/getProjectPage.ts`.

**Lab** (`src/data/lab/`): `types.ts`, `variants.ts` (constraint + physics presets), `lighting.ts` (dark/light presets), `view.ts` (visitor options + guards), `starfox.ts` (ship/world/camera tuning + page meta), `index.ts` barrel. Import from `@data/lab`.

`/projects/[slug]` always exists — MDX when present, otherwise a short generic page from registry fields. `/lab/[variant]` and `/lab/starfox` read `?theme=&names=&lines=` via `parseLabQuery` and write them back with `buildLabUrl`.

## Testing

- Component tests colocated in `__tests__/`; utils/hooks/data share a `__tests__/` per folder
- Network tests use MSW (`src/msw/handlers.ts` + `src/msw/server.ts`) wired in `jest.setup.ts`
- `*.mdx` resolves to `jest.mdx-stub.tsx` under Jest
- WebGL components are not unit-tested; verify them in the browser
- Run with `npm test`

## Rewrite lifecycle (other repos)

1. Inspect the old repo
2. Create a **new** repo (rename allowed) using these conventions
3. Deploy to Vercel
4. Archive the old repo
5. Update this portfolio’s registry (`repo`, `legacyRepo`, `liveUrl`, `status`) and add MDX history when useful
