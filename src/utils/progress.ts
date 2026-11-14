import { achievements, type Achievement, type ProgressStatKey } from "@data/lab";

/**
 * Pure bookkeeping for the shared arcade progression: lifetime counters,
 * the set of explored projects, and which achievements they unlock.
 */

export type ProgressStats = Record<Exclude<ProgressStatKey, "projectsExplored">, number> & {
  /** Slugs flown through at least once. */
  projectsExplored: string[];
};

export type Unlock = {
  id: string;
  /** Epoch ms. */
  at: number;
};

export type ProgressState = {
  stats: ProgressStats;
  unlocked: Unlock[];
};

export const emptyProgress: ProgressState = {
  stats: {
    shotsFired: 0,
    enemiesDestroyed: 0,
    barrelRolls: 0,
    portalsFlown: 0,
    railRunsCompleted: 0,
    points: 0,
    deaths: 0,
    damageDealt: 0,
    towersDestroyed: 0,
    projectsExplored: [],
  },
  unlocked: [],
};

/** Numeric view of a stat (explored projects count as their length). */
function statValue(stats: ProgressStats, key: ProgressStatKey): number {
  return key === "projectsExplored" ? stats.projectsExplored.length : stats[key];
}

export function isUnlocked(stats: ProgressStats, achievement: Achievement): boolean {
  return statValue(stats, achievement.stat) >= achievement.threshold;
}

/** Fraction of the way to an achievement, clamped to [0, 1]. */
export function achievementProgress(stats: ProgressStats, achievement: Achievement): number {
  return Math.min(1, statValue(stats, achievement.stat) / achievement.threshold);
}

/** Achievements earned by `stats` that are not yet in `unlocked`. */
function newUnlocks(stats: ProgressStats, unlocked: Unlock[], now: number): Unlock[] {
  const have = new Set(unlocked.map((u) => u.id));
  return achievements.filter((a) => !have.has(a.id) && isUnlocked(stats, a)).map((a) => ({ id: a.id, at: now }));
}

function withStats(state: ProgressState, stats: ProgressStats, now: number): ProgressState {
  return { stats, unlocked: [...state.unlocked, ...newUnlocks(stats, state.unlocked, now)] };
}

/** Adds `amount` to a numeric stat and unlocks whatever that earns. */
export function addStat(
  state: ProgressState,
  key: Exclude<ProgressStatKey, "projectsExplored">,
  amount = 1,
  now = Date.now(),
): ProgressState {
  if (amount === 0) return state;
  return withStats(state, { ...state.stats, [key]: state.stats[key] + amount }, now);
}

/** Marks a project as explored (idempotent). */
export function exploreProject(state: ProgressState, slug: string, now = Date.now()): ProgressState {
  if (state.stats.projectsExplored.includes(slug)) return state;
  return withStats(state, { ...state.stats, projectsExplored: [...state.stats.projectsExplored, slug] }, now);
}

/** Restores a persisted state, tolerating missing or junk fields. */
export function parseProgress(raw: unknown): ProgressState {
  if (!raw || typeof raw !== "object") return emptyProgress;
  const input = raw as Partial<{ stats: Partial<Record<string, unknown>>; unlocked: unknown }>;
  const stats = { ...emptyProgress.stats };
  for (const key of Object.keys(stats) as ProgressStatKey[]) {
    const value = input.stats?.[key];
    if (key === "projectsExplored") {
      if (Array.isArray(value)) stats.projectsExplored = value.filter((v): v is string => typeof v === "string");
    } else if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      stats[key] = value;
    }
  }
  const known = new Set(achievements.map((a) => a.id));
  const unlocked = Array.isArray(input.unlocked)
    ? input.unlocked.filter(
        (u): u is Unlock =>
          !!u && typeof u === "object" && typeof (u as Unlock).id === "string" && known.has((u as Unlock).id),
      )
    : [];
  return { stats, unlocked };
}
