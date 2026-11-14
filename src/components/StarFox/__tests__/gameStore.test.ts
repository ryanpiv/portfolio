import { starFoxWaves } from "@data/lab";

import { applyDamage, createGameStore, isRunLive, recordEscape, recordHit } from "../game/gameStore";

const rules = { waves: starFoxWaves, shieldMax: 100 };

describe("gameStore", () => {
  it("starts in briefing with a full shield and the wave totals", () => {
    const store = createGameStore(rules);
    expect(store.get()).toMatchObject({
      phase: "briefing",
      wave: 0,
      waveCount: starFoxWaves.length,
      hits: 0,
      escaped: 0,
      shield: 100,
      downed: [],
    });
  });

  it("records hits with the downed project and escapes", () => {
    const store = createGameStore(rules);
    recordHit(store, "parse-ai");
    recordHit(store, "wow-tools");
    recordEscape(store);
    expect(store.get()).toMatchObject({ hits: 2, escaped: 1, downed: ["parse-ai", "wow-tools"] });
  });

  it("takes shield damage and fails the run at zero", () => {
    const store = createGameStore(rules);
    applyDamage(store, 40);
    expect(store.get()).toMatchObject({ shield: 60, phase: "briefing" });
    applyDamage(store, 70);
    expect(store.get()).toMatchObject({ shield: 0, phase: "failed" });
  });

  it("ignores damage once the run is over", () => {
    const store = createGameStore(rules);
    store.set({ phase: "complete", shield: 30 });
    applyDamage(store, 10);
    expect(store.get()).toMatchObject({ shield: 30, phase: "complete" });
  });

  it("knows which phases are live", () => {
    expect(isRunLive("briefing")).toBe(true);
    expect(isRunLive("wave")).toBe(true);
    expect(isRunLive("complete")).toBe(false);
    expect(isRunLive("failed")).toBe(false);
  });
});
