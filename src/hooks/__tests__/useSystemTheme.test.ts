import { act, renderHook } from "@testing-library/react";

import { useSystemTheme } from "@hooks/useSystemTheme";

type Listener = () => void;

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<Listener>();
  const media = {
    matches,
    addEventListener: (_: string, fn: Listener) => listeners.add(fn),
    removeEventListener: (_: string, fn: Listener) => listeners.delete(fn),
  };
  window.matchMedia = jest.fn().mockReturnValue(media);
  return {
    flip() {
      media.matches = !media.matches;
      listeners.forEach((fn) => fn());
    },
  };
}

describe("useSystemTheme", () => {
  it("reads the current preference", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useSystemTheme());
    expect(result.current).toBe("light");
  });

  it("updates when the media query changes", () => {
    const media = mockMatchMedia(false);
    const { result } = renderHook(() => useSystemTheme());
    expect(result.current).toBe("dark");
    act(() => media.flip());
    expect(result.current).toBe("light");
  });
});
