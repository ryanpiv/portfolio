import { act, renderHook } from "@testing-library/react";

import { usePersistedChoice } from "@hooks/usePersistedChoice";

type View = "roster" | "grid";
const isView = (value: unknown): value is View => value === "roster" || value === "grid";

describe("usePersistedChoice", () => {
  beforeEach(() => window.localStorage.clear());

  it("falls back when nothing is stored, and writes picks to storage", () => {
    const { result } = renderHook(() => usePersistedChoice("test.view", "roster", isView));
    expect(result.current[0]).toBe("roster");

    act(() => result.current[1]("grid"));
    expect(result.current[0]).toBe("grid");
    expect(window.localStorage.getItem("test.view")).toBe("grid");
  });

  it("reads an existing valid value and ignores junk", () => {
    window.localStorage.setItem("test.a", "grid");
    window.localStorage.setItem("test.b", "sideways");
    expect(renderHook(() => usePersistedChoice("test.a", "roster", isView)).result.current[0]).toBe("grid");
    expect(renderHook(() => usePersistedChoice("test.b", "roster", isView)).result.current[0]).toBe("roster");
  });

  it("forgets the choice when set to undefined", () => {
    window.localStorage.setItem("test.c", "grid");
    const { result } = renderHook(() => usePersistedChoice("test.c", undefined, isView));
    expect(result.current[0]).toBe("grid");
    act(() => result.current[1](undefined));
    expect(result.current[0]).toBeUndefined();
    expect(window.localStorage.getItem("test.c")).toBeNull();
  });
});
