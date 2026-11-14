import {
  classicReasons,
  detectDeviceCapability,
  probeWebgl,
  suggestQuality,
  type CapabilityEnvironment,
} from "@utils/deviceCapability";

function environment(overrides: Partial<CapabilityEnvironment> = {}, media: string[] = []): CapabilityEnvironment {
  return {
    matchMedia: (query) => ({ matches: media.includes(query) }),
    navigator: { hardwareConcurrency: 8, deviceMemory: 8 },
    createCanvas: () => ({ getContext: () => ({}) }),
    ...overrides,
  };
}

describe("probeWebgl", () => {
  it("is true when either context is available", () => {
    expect(probeWebgl(() => ({ getContext: (id) => (id === "webgl" ? {} : null) }))).toBe(true);
  });

  it("is false when the context is null or creation throws", () => {
    expect(probeWebgl(() => ({ getContext: () => null }))).toBe(false);
    expect(
      probeWebgl(() => {
        throw new Error("no canvas");
      }),
    ).toBe(false);
  });
});

describe("detectDeviceCapability", () => {
  it("reports a capable desktop", () => {
    expect(detectDeviceCapability(environment())).toEqual({
      webgl: true,
      touchOnly: false,
      reducedMotion: false,
      lowPower: false,
    });
  });

  it("needs both coarse pointer and no hover to call a device touch-only", () => {
    expect(detectDeviceCapability(environment({}, ["(pointer: coarse)"])).touchOnly).toBe(false);
    expect(detectDeviceCapability(environment({}, ["(pointer: coarse)", "(hover: none)"])).touchOnly).toBe(true);
  });

  it("flags low power on few cores, little memory, or data saver", () => {
    expect(detectDeviceCapability(environment({ navigator: { hardwareConcurrency: 4 } })).lowPower).toBe(true);
    expect(detectDeviceCapability(environment({ navigator: { deviceMemory: 2 } })).lowPower).toBe(true);
    expect(detectDeviceCapability(environment({ navigator: { connection: { saveData: true } } })).lowPower).toBe(true);
    expect(detectDeviceCapability(environment({ navigator: {} })).lowPower).toBe(false);
  });
});

describe("suggestQuality / classicReasons", () => {
  const base = { webgl: true, touchOnly: false, reducedMotion: false, lowPower: false };

  it("picks the tier by the weakest signal", () => {
    expect(suggestQuality(base)).toBe("high");
    expect(suggestQuality({ ...base, touchOnly: true })).toBe("balanced");
    expect(suggestQuality({ ...base, touchOnly: true, lowPower: true })).toBe("low");
  });

  it("has nothing to say about a capable desktop", () => {
    expect(classicReasons(base)).toEqual([]);
  });

  it("lists one reason per limitation", () => {
    expect(classicReasons({ webgl: false, touchOnly: true, reducedMotion: true, lowPower: true })).toHaveLength(4);
  });
});
