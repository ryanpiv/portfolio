import { defaultEffects, defaultLabSettings, parseLabSettings } from "../settings";

describe("parseLabSettings", () => {
  it("returns defaults for junk", () => {
    expect(parseLabSettings(null)).toEqual(defaultLabSettings);
    expect(parseLabSettings("nope")).toEqual(defaultLabSettings);
    expect(parseLabSettings({ theme: "sepia", quality: 3, effects: "all" })).toEqual(defaultLabSettings);
  });

  it("keeps valid overrides and fills missing effects", () => {
    const parsed = parseLabSettings({ theme: "light", quality: "low", effects: { bloom: false, foliage: "sparse" } });
    expect(parsed.theme).toBe("light");
    expect(parsed.quality).toBe("low");
    expect(parsed.effects).toEqual({ ...defaultEffects, bloom: false, foliage: "sparse" });
  });

  it("ignores unknown effect values", () => {
    expect(parseLabSettings({ effects: { bloom: "yes", foliage: "jungle" } }).effects).toEqual(defaultEffects);
  });
});
