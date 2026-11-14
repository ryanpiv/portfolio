import {
  createRoamStore,
  damageHull,
  enterPortal,
  equipWeapon,
  isRoamLive,
  recordKill,
  repairHull,
  respawn,
} from "../roam/roamStore";

const transition = { slug: "parse-ai", title: "Parse AI", color: "#a8f0c4" };

describe("roamStore", () => {
  it("starts live with an empty score", () => {
    const store = createRoamStore(100);
    expect(store.get()).toMatchObject({ score: 0, kills: 0, portals: 0, health: 100, weapon: "twin", phase: "flying", transition: null });
    expect(isRoamLive(store.get())).toBe(true);
  });

  it("scores kills", () => {
    const store = createRoamStore(100);
    recordKill(store, 100);
    recordKill(store, 100);
    expect(store.get()).toMatchObject({ kills: 2, score: 200 });
  });

  it("awards a portal once and starts the takeover", () => {
    const store = createRoamStore(100);
    expect(enterPortal(store, transition, 750)).toBe(true);
    expect(store.get()).toMatchObject({ portals: 1, score: 750, transition });
    expect(isRoamLive(store.get())).toBe(false);

    // A second ring crossed mid-takeover is ignored.
    expect(enterPortal(store, { ...transition, slug: "wow-tools" }, 250)).toBe(false);
    expect(store.get()).toMatchObject({ portals: 1, score: 750, transition });
  });

  it("takes damage, dies at zero, and comes back whole with the default weapon", () => {
    const store = createRoamStore(100);
    equipWeapon(store, "plasma");
    damageHull(store, 30);
    expect(store.get()).toMatchObject({ health: 70, phase: "flying", deaths: 0 });
    damageHull(store, 100);
    expect(store.get()).toMatchObject({ health: 0, phase: "dead", deaths: 1 });
    expect(isRoamLive(store.get())).toBe(false);

    // Dead ships take no further damage and cannot enter portals.
    damageHull(store, 10);
    expect(store.get().deaths).toBe(1);
    expect(enterPortal(store, transition, 250)).toBe(false);

    respawn(store);
    expect(store.get()).toMatchObject({ health: 100, phase: "flying", weapon: "twin" });
  });

  it("repairs up to the maximum", () => {
    const store = createRoamStore(100);
    damageHull(store, 60);
    repairHull(store, 50);
    expect(store.get().health).toBe(90);
    repairHull(store, 50);
    expect(store.get().health).toBe(100);
  });
});
