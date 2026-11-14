import { projects } from "@data/projects";

/**
 * Milestones shared by every Star Fox mode. Each one watches a single
 * lifetime stat and unlocks at a threshold; `utils/progress` does the
 * bookkeeping and `localStorage` keeps it between visits.
 */

export type ProgressStatKey =
  | "shotsFired"
  | "enemiesDestroyed"
  | "barrelRolls"
  | "portalsFlown"
  | "projectsExplored"
  | "railRunsCompleted"
  | "points"
  | "deaths"
  | "damageDealt"
  | "towersDestroyed";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  stat: ProgressStatKey;
  threshold: number;
};

/** The arena has one portal per project, so "every project" is the registry size. */
export const achievements: readonly Achievement[] = [
  { id: "first-blood", title: "First Blood", description: "Shoot down a fighter.", stat: "enemiesDestroyed", threshold: 1 },
  { id: "ace", title: "Ace", description: "Shoot down ten fighters.", stat: "enemiesDestroyed", threshold: 10 },
  { id: "squadron", title: "Squadron", description: "Shoot down fifty fighters.", stat: "enemiesDestroyed", threshold: 50 },
  { id: "trigger-happy", title: "Trigger Happy", description: "Fire a hundred shots.", stat: "shotsFired", threshold: 100 },
  { id: "do-a-barrel-roll", title: "Do a Barrel Roll", description: "Double-tap left or right, or press Q / E.", stat: "barrelRolls", threshold: 1 },
  { id: "aerobat", title: "Aerobat", description: "Twenty-five barrel rolls.", stat: "barrelRolls", threshold: 25 },
  { id: "explorer", title: "Explorer", description: "Fly through your first portal.", stat: "projectsExplored", threshold: 1 },
  { id: "cartographer", title: "Cartographer", description: "Explore every project through a portal.", stat: "projectsExplored", threshold: projects.length },
  { id: "portal-hopper", title: "Portal Hopper", description: "Fly through ten portals.", stat: "portalsFlown", threshold: 10 },
  { id: "corneria-clear", title: "Corneria Clear", description: "Survive all four waves of the rail mission.", stat: "railRunsCompleted", threshold: 1 },
  { id: "high-score", title: "High Score", description: "Earn five thousand lifetime points.", stat: "points", threshold: 5000 },
  { id: "crash-course", title: "Crash Course", description: "Lose the ship once. It comes back.", stat: "deaths", threshold: 1 },
  { id: "bruiser", title: "Bruiser", description: "Deal a thousand damage.", stat: "damageDealt", threshold: 1000 },
  { id: "heavy-hitter", title: "Heavy Hitter", description: "Deal ten thousand damage.", stat: "damageDealt", threshold: 10000 },
  { id: "wrecking-ball", title: "Wrecking Ball", description: "Deal fifty thousand damage.", stat: "damageDealt", threshold: 50000 },
  { id: "demolition", title: "Demolition", description: "Bring down a tower with the plasma cannon.", stat: "towersDestroyed", threshold: 1 },
];
