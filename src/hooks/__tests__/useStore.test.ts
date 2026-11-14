import { act, renderHook } from "@testing-library/react";

import { createStore } from "@utils/createStore";

import { useStore } from "../useStore";

describe("useStore", () => {
  it("re-renders with the selected slice", () => {
    const store = createStore({ hits: 0, wave: 1 });
    const { result } = renderHook(() => useStore(store, (s) => s.hits));
    expect(result.current).toBe(0);

    act(() => store.set({ hits: 3 }));
    expect(result.current).toBe(3);
  });

  it("returns the whole state without a selector", () => {
    const store = createStore({ hits: 2 });
    const { result } = renderHook(() => useStore(store));
    expect(result.current).toEqual({ hits: 2 });
  });
});
