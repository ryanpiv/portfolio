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

Arcade/
  index.ts, ArcadeRail.tsx (rail entry), ArcadeRoam.tsx (free-roam entry) — both render a LabStage
  ArcadeHud.tsx            # minimal HUD: mode word + gauge + gear top, tracker / fading hint / weapon + a number or two
                           # bottom, callouts centre; mode nav, achievements and Leva live inside the LabSettingsMenu
  SceneFrame.tsx            # LabCanvas + lighting + fog + effects shared by both modes
  ShieldBar.tsx             # shared gauge (rail "shield", roam "hull")
  gameContext.ts            # GameContext: lighting, effects, combat, shipRef, inputRef, simRef, weaponRef, progress, isLive, damageShip
  hooks/         # useInput (keys + pointer → ref; boost/brake, Q/E + double-tap roll; ignores presses on HUD controls),
                 # useGameFrame, useAfterFirstFrame, useGroupRegistry (id → mounted Group map for entity lists)
  game/          # sim (per-frame bus: lasers, shots, bursts, flashes), fireShot (enemy bolt toward the ship), barrelRoll, steering
  entities/      # ShipModel, EnemyModel (primitives), useBarrelRoll (roll request → angle, marks userData.rolling)
  combat/        # Lasers (fires weaponRef's bolts along ship.userData.aim; additive glow sheath + muzzle flash),
                 # EnemyShots (deflect while rolling / immune, else damageShip), Explosions (layered pools fed by
                 # sim.bursts: sparks, flash, shockwave ring, smoke, falling rubble), FlashLights (pool of real point
                 # lights fed by sim.flashes), hdrColor — mode-agnostic
  controls/      # Leva: useCombatControls (shared "Combat" folder), useRailControls (rail)
  progress/      # useProgress (singleton store + localStorage hydration), AchievementToast, AchievementsList (menu section)
  rail/          # RailScene, GameRun, railContext (useRail = game + config + store), Ship, ChaseCamera, Ground, Scenery,
                 # Enemies → Enemy, gameStore, waveDirector, buildWave, MissionScreen, WaveCallout, WaveTracker
  roam/          # RoamScene, RoamRun, roamContext (useRoam = game + config + store + layout + arenaRef + radarRef),
                 # RoamShip (all-range flight; tower hits graded by how head-on: fatal / heavy / light; death → wreck
                 # timer → respawn at a clear point with immunity blink; emerges from the return portal), RoamCamera,
                 # Arena (ground + grid, parks, instanced trees, instanced towers with a procedural facade from
                 # towerMaterial — lit windows, floor bands, per-instance damage; heavy bolts chip towers, which
                 # pancake and scatter rubble at 0) + arenaState, ShipLight (headlight), Portals → Portal,
                 # Roamers (objects + sim glue) ← roamerBrain (pure wander / scatter / return-fire rules, tuned by
                 # roamConfig.roamers), shipCollision (pure tower slide + damage curve), PowerUps (weapon + repair
                 # pickups, refill on a timer), roamStore (score, hull, weapon, phase, arrival), radarFrame + Radar
                 # (DOM canvas), RoamCallout, WeaponReadout,
                 # PortalTransition (enter: takeover → router.push; arrive: reverse wash), returnPortal (sessionStorage),
                 # useRoamControls
```

Game-loop rules: mutable per-frame state lives in refs named `*Ref` and is only touched inside `useGameFrame`; React state changes only on events (spawn, hit, escape, damage, portal). Sibling order in `GameRun` / `RoamRun` is update order. `GameRun` is everything that belongs to one attempt — "fly again" bumps its `key` and resets the store. The DOM HUD reads a `createStore` store via `useStore`, never the sim.

Both modes share one ship contract: the ship group publishes its yaw/pitch attitude on `userData.aim` (a quaternion, no roll), `userData.rolling`, and `userData.immune`; `Lasers` fires along the aim and `RoamCamera` follows it, so a barrel roll never sprays shots or tilts the horizon. Weapons are data (`data/lab/arcadeWeapons`): `weaponRef` holds the current spec, `Lasers` arms each bolt with its damage / size / `heavy` flag, and whoever a bolt hits decides what that means (fighters lose HP, only heavy bolts hurt towers). Anything that needs the mode's own config/store uses `useRail()` / `useRoam()`, which spread the shared `useGame()` value.

Progression (`utils/progress` + `utils/progressStore` + `data/lab/achievements`) is a pure stats → unlocks reducer persisted under `lab.arcade.progress`. Scenes call `recordStat` / `recordExplored` on events; both HUDs render the same toast and the settings menu's achievements list from the singleton store in `progress/useProgress`, so milestones carry across rail and free roam.

Visitor settings (`data/lab/settings` + `hooks/useLabSettings`) are one `lab.settings` record in `localStorage`: optional theme and quality overrides plus the effect toggles (bloom, flare, dynamic lights, lit windows, foliage density, trails & shockwaves). `useLabViewState` resolves theme and quality as URL → remembered → system / device suggestion, and `effects` ride on `GameContext` so every system (`LabEffects`, `FlashLights`, `ShipLight`, `Arena`, `Lasers`, `Explosions`) can skip what is off. `utils/persistedStore.hydrateStore` is the shared "mirror a store to a storage key" helper that both settings and progress use.

Free roam is a project explorer first, so dying is cheap: hull hits zero → short wreck pause → `utils/arenaSpawn` finds open air near where you were (and a heading that isn't into a wall) → five seconds of blinking immunity. Flying into a portal stores its slug in `sessionStorage` (`roam/returnPortal`) before `router.push`; when the page mounts again (back button) the store's `spawnPortal` is set and `RoamShip` places the ship just outside that ring, nose toward the center, under a reverse "back from" wash.

Anything two lab scenes share lives outside both:

| Where | What |
|---|---|
| `components/LabScene/` | R3F side: `LabCanvas` (the one `<Canvas>`; spends what the quality tier allows, `PerformanceMonitor` steps down on frame drops), `LabLighting`, `LabEffects` (bloom + flare; skipped on tiers without effects), `TuningPanel` (Leva host), `Nameplate` (DOM label under a body) |
| `components/LabStage/` | DOM side: `LabStage` (fixed full-viewport stage; renders `SceneFallback` instead of the scene when the device has no WebGL), `SceneLoading` |
| `components/LabSettings/` | `LabSettingsMenu` — the gear in the top-right corner of every lab scene: Display (theme, quality), Effects (per-scope toggles via `effectTogglesFor`), page-supplied sections (mode / variant nav, view switches, achievements), Developer (Leva host behind a "tuning panel" switch); `SettingsSection`, `SettingsToggle` |
| `components/LabHud/` | `LabHud` overlay shell (eyebrow/title/switches/footer) + `LabHudCard`, `LabHudHint` — the physics field's HUD |
| `hooks/useLabViewState` | resolves `theme` / `quality` / view flags as URL → remembered (`useLabSettings`) → system / device suggestion, writes picks back to both; `degradeQuality` steps it down |
| `hooks/useLabSettings` + `utils/persistedStore` | the remembered `lab.settings` store (theme / quality overrides + effect toggles) and the generic store ↔ localStorage mirror |
| `hooks/useDeviceCapability` + `utils/deviceCapability` | one-shot probe: WebGL, touch-only, reduced motion, low-power → `suggestQuality`, `classicReasons` |
| `hooks/useStore` + `utils/createStore` | minimal external store for render-loop → React state |
| `utils/leva` | `slider`, `num` schema helpers |
| `utils/collision`, `utils/waveLayout`, `utils/arenaLayout`, `utils/arenaSpawn` | sphere / AABB / segment / disc tests; formation offsets + dealing projects into waves; seeded towers + portal ring; clear-point search + respawn heading |
| `utils/progress`, `utils/progressStore` | achievement stats reducer; persisted store + `recordStat` / `recordExplored` |

### Shared primitives

| Component | Purpose |
|---|---|
| `PageHeader` | eyebrow / h1 / lede hero for index pages |
| `TagList` | mono uppercase tag list |
| `ExternalLink` | `<a target="_blank" rel="noreferrer">` |
| `PillGroup` / `PillNav` | segmented control (buttons) / link flavour; themed via `--hud-*` custom properties |
| `StatusBadge` / `StatusLegend` | status chip / color key, both reading `PROJECT_STATUS_LABELS` |
| `SlantStage` / `SlantPanel` / `SlantDetail` | the sheared character-select strip: skewed row, counter-skewed content, pleated curtains that part on hover, detail sheet that unfurls. Exposes `--panel-picked / --panel-scale / --panel-secondary` to consumers. `bleed` oversizes the row for full-width stages; off, the row is inset so the whole parallelogram shows |
| `ProjectRoster` / `ProjectsBrowser` | roster of projects on `SlantStage` (spine along the slant when idle, card sheet when picked) and the roster ⇄ grid toggle on `/projects` (grid only below `$bp-md`) |

## Styles

`src/styles/_index.scss` forwards tokens and mixins so every module needs one import:

```scss
@use "../../styles" as *;   // relative path — Turbopack ignores sassOptions.includePaths
```

Mixins: `page-container`, `respond-up`, `list-reset`, `mono-label`, `eyebrow`, `display-title`, `lede`, `mono-meta`, `mono-link`, `surface`, `focus-ring`, `visually-hidden`, `hud-vars` (the `--hud-ink / --hud-muted / --hud-surface / --hud-border` set per theme). Add a mixin the second time a pattern appears, not the first.

## Utils and hooks

Flat camelCase files under `src/utils/` and `src/hooks/`, each with a shared `__tests__/` directory. Utils are framework-free; hooks are React-only.

## Import aliases

Configured in `tsconfig.json` `paths` and mirrored in `jest.config.mjs`:

- `@/*` → `src/*`
- `@components/*`, `@utils/*`, `@data/*`, `@hooks/*`, `@styles/*`, `@msw/*`, `@content/*`

## Content model

**Thin registry** (`src/data/projects.ts`): `slug`, `title`, `description`, `tags`, `repo`, `legacyRepo?`, `liveUrl?`, `status`, `year`, plus `PROJECT_STATUSES` / `PROJECT_STATUS_LABELS`.

**Optional writeups** (`src/content/projects/{slug}.mdx`): add only when a project has a story. Register the loader in `src/utils/getProjectPage.ts`.

**Lab** (`src/data/lab/`): `types.ts`, `variants.ts` (constraint + physics presets), `lighting.ts` (dark/light presets), `quality.ts` (render tiers low / balanced / high: DPR, shadows, effects), `settings.ts` (remembered settings: effect toggles with the scenes they apply to, `parseLabSettings`), `view.ts` (visitor options + guards), `arcadeRail.ts` (ship/world/camera/combat/scoring tuning + page meta), `arcadeWaves.ts` (wave table — counts sum to the project total so every project flies once), `arcadeRoam.ts` (flight/arena/world palette/camera/scoring/hull/collision/roamers/pickups tuning + page meta), `arcadeWeapons.ts` (weapon + power-up tables), `achievements.ts` (milestone table: stat + threshold), `index.ts` barrel. Import from `@data/lab`.

`/` is the chooser (`components/Landing`, copy in `data/landing.ts`): two `SlantStage` panels, one into `/lab/arcade/roam` and one into `/projects`. The hover mechanic is pure CSS; the only client state is the device probe, which marks Classic "recommended" (and says why) when the device has no WebGL, is touch-only, low-power, or prefers reduced motion. Below `$bp-md` the shear is dropped and the call to action is always visible.

`/projects` defaults to the roster (the same character-select mechanic, one spine per project) with a grid toggle; narrow screens get the grid. This is the "performant choice": no WebGL, nothing animating until hovered.

`/projects/[slug]` always exists — MDX when present, otherwise a short generic page from registry fields. `/lab/[variant]`, `/lab/arcade`, and `/lab/arcade/roam` read `?theme=&quality=&names=&lines=` via `parseLabQuery` and write them back with `buildLabUrl`. Every lab page renders inside `LabStage`: no WebGL → `SceneFallback` with a link to the roster; otherwise the scene at the device's suggested quality tier, stepping down automatically when frames drop.

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
