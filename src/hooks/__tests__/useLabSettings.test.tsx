import { act, renderHook } from "@testing-library/react";

import { defaultEffects } from "@data/lab";

import { resetLabSettingsForTests, SETTINGS_STORAGE_KEY, useLabSettings } from "../useLabSettings";

describe("useLabSettings", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetLabSettingsForTests();
  });

  it("reads remembered settings on first use", () => {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ theme: "light", effects: { bloom: false } }),
    );
    const { result } = renderHook(() => useLabSettings());
    expect(result.current.settings.theme).toBe("light");
    expect(result.current.settings.effects).toEqual({ ...defaultEffects, bloom: false });
  });

  it("writes every change back to storage", () => {
    const { result } = renderHook(() => useLabSettings());
    act(() => result.current.patch({ quality: "low" }));
    act(() => result.current.patchEffects({ trails: false }));
    const stored = JSON.parse(window.localStorage.getItem(SETTINGS_STORAGE_KEY) ?? "{}");
    expect(stored.quality).toBe("low");
    expect(stored.effects.trails).toBe(false);
    expect(stored.effects.bloom).toBe(true);
  });
});
