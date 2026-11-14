import { createRoamStore, enterPortal, isRoamLive, recordKill } from "../roam/roamStore";

const transition = { slug: "parse-ai", title: "Parse AI", color: "#a8f0c4" };

describe("roamStore", () => {
  it("starts live with an empty score", () => {
    const store = createRoamStore();
    expect(store.get()).toEqual({ score: 0, kills: 0, portals: 0, transition: null });
    expect(isRoamLive(store.get())).toBe(true);
  });

  it("scores kills", () => {
    const store = createRoamStore();
    recordKill(store, 100);
    recordKill(store, 100);
    expect(store.get()).toMatchObject({ kills: 2, score: 200 });
  });

  it("awards a portal once and starts the takeover", () => {
    const store = createRoamStore();
    expect(enterPortal(store, transition, 750)).toBe(true);
    expect(store.get()).toMatchObject({ portals: 1, score: 750, transition });
    expect(isRoamLive(store.get())).toBe(false);

    // A second ring crossed mid-takeover is ignored.
    expect(enterPortal(store, { ...transition, slug: "wow-tools" }, 250)).toBe(false);
    expect(store.get()).toMatchObject({ portals: 1, score: 750, transition });
  });
});
