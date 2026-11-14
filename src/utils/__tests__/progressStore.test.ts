import {
  createProgressStore,
  hydrateProgress,
  PROGRESS_STORAGE_KEY,
  recordExplored,
  recordStat,
} from "../progressStore";

function fakeStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
    removeItem(key: string) {
      delete data[key];
    },
  };
}

describe("progressStore", () => {
  it("hydrates from storage and mirrors changes back", () => {
    const saved = { stats: { shotsFired: 7 }, unlocked: [] };
    const storage = fakeStorage({ [PROGRESS_STORAGE_KEY]: JSON.stringify(saved) });
    const store = createProgressStore();
    hydrateProgress(store, storage);
    expect(store.get().stats.shotsFired).toBe(7);

    recordStat(store, "shotsFired", 3);
    recordExplored(store, "parse-ai");
    const persisted = JSON.parse(storage.data[PROGRESS_STORAGE_KEY]);
    expect(persisted.stats.shotsFired).toBe(10);
    expect(persisted.stats.projectsExplored).toEqual(["parse-ai"]);
    expect(persisted.unlocked.map((u: { id: string }) => u.id)).toEqual(["explorer"]);
  });

  it("survives a corrupt save and missing storage", () => {
    const store = createProgressStore();
    expect(() => hydrateProgress(store, fakeStorage({ [PROGRESS_STORAGE_KEY]: "{not json" }))).not.toThrow();
    expect(store.get().stats.shotsFired).toBe(0);
    expect(() => hydrateProgress(store, null)).not.toThrow();
  });

  it("stops mirroring after unsubscribe", () => {
    const storage = fakeStorage();
    const store = createProgressStore();
    const stop = hydrateProgress(store, storage);
    stop();
    recordStat(store, "points", 50);
    expect(storage.data[PROGRESS_STORAGE_KEY]).toBeUndefined();
  });
});
