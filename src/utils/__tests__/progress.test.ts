import { achievements } from "@data/lab";
import { projects } from "@data/projects";

import {
  achievementProgress,
  addStat,
  emptyProgress,
  exploreProject,
  isUnlocked,
  parseProgress,
} from "../progress";

const ids = (state: { unlocked: { id: string }[] }) => state.unlocked.map((u) => u.id);

describe("progress", () => {
  it("unlocks First Blood on the first kill, Ace on the tenth", () => {
    let state = addStat(emptyProgress, "enemiesDestroyed", 1, 1000);
    expect(ids(state)).toEqual(["first-blood"]);
    expect(state.unlocked[0].at).toBe(1000);

    state = addStat(state, "enemiesDestroyed", 9);
    expect(ids(state)).toEqual(["first-blood", "ace"]);
  });

  it("never unlocks the same achievement twice", () => {
    let state = addStat(emptyProgress, "barrelRolls");
    state = addStat(state, "barrelRolls");
    expect(ids(state)).toEqual(["do-a-barrel-roll"]);
  });

  it("returns the same state for a zero increment", () => {
    expect(addStat(emptyProgress, "shotsFired", 0)).toBe(emptyProgress);
  });

  it("counts explored projects once each and unlocks Explorer, then Cartographer", () => {
    let state = exploreProject(emptyProgress, "parse-ai");
    state = exploreProject(state, "parse-ai");
    expect(state.stats.projectsExplored).toEqual(["parse-ai"]);
    expect(ids(state)).toEqual(["explorer"]);

    for (const project of projects) state = exploreProject(state, project.slug);
    expect(ids(state)).toContain("cartographer");
  });

  it("reports fractional progress toward a threshold", () => {
    const ace = achievements.find((a) => a.id === "ace")!;
    const state = addStat(emptyProgress, "enemiesDestroyed", 4);
    expect(achievementProgress(state.stats, ace)).toBeCloseTo(0.4);
    expect(isUnlocked(state.stats, ace)).toBe(false);
    expect(achievementProgress(addStat(state, "enemiesDestroyed", 20).stats, ace)).toBe(1);
  });

  describe("parseProgress", () => {
    it("round-trips a real state", () => {
      const state = exploreProject(addStat(emptyProgress, "shotsFired", 120), "wow-tools");
      expect(parseProgress(JSON.parse(JSON.stringify(state)))).toEqual(state);
    });

    it("falls back to empty for junk and drops unknown fields", () => {
      expect(parseProgress(null)).toEqual(emptyProgress);
      expect(parseProgress("nope")).toEqual(emptyProgress);
      const parsed = parseProgress({
        stats: { shotsFired: -5, enemiesDestroyed: "3", points: 40, projectsExplored: ["a", 7] },
        unlocked: [{ id: "first-blood", at: 1 }, { id: "made-up", at: 2 }, "x"],
      });
      expect(parsed.stats).toMatchObject({ shotsFired: 0, enemiesDestroyed: 0, points: 40, projectsExplored: ["a"] });
      expect(ids(parsed)).toEqual(["first-blood"]);
    });
  });
});
