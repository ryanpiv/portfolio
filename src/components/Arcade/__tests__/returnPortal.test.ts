import { consumeReturnPortal, rememberReturnPortal, RETURN_PORTAL_KEY } from "../roam/returnPortal";

function fakeStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    map,
  };
}

describe("returnPortal", () => {
  it("remembers a portal once and clears it on read", () => {
    const storage = fakeStorage();
    rememberReturnPortal("parse-ai", storage);
    expect(storage.map.get(RETURN_PORTAL_KEY)).toBe("parse-ai");
    expect(consumeReturnPortal(storage)).toBe("parse-ai");
    expect(consumeReturnPortal(storage)).toBeNull();
  });

  it("is a no-op without storage", () => {
    rememberReturnPortal("parse-ai", null);
    expect(consumeReturnPortal(null)).toBeNull();
  });

  it("swallows storage failures", () => {
    const broken = {
      getItem: () => {
        throw new Error("nope");
      },
      setItem: () => {
        throw new Error("nope");
      },
      removeItem: () => {},
    };
    expect(() => rememberReturnPortal("parse-ai", broken)).not.toThrow();
    expect(consumeReturnPortal(broken)).toBeNull();
  });
});
