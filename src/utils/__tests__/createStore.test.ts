import { createStore } from "../createStore";

describe("createStore", () => {
  it("merges patches and notifies subscribers", () => {
    const store = createStore({ a: 1, b: "x" });
    const listener = jest.fn();
    store.subscribe(listener);

    store.set({ a: 2 });
    expect(store.get()).toEqual({ a: 2, b: "x" });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("accepts functional patches", () => {
    const store = createStore({ count: 0 });
    store.set((s) => ({ count: s.count + 5 }));
    expect(store.get().count).toBe(5);
  });

  it("skips notification when nothing changed", () => {
    const store = createStore({ a: 1 });
    const listener = jest.fn();
    store.subscribe(listener);
    store.set({ a: 1 });
    expect(listener).not.toHaveBeenCalled();
  });

  it("unsubscribes", () => {
    const store = createStore({ a: 1 });
    const listener = jest.fn();
    const off = store.subscribe(listener);
    off();
    store.set({ a: 2 });
    expect(listener).not.toHaveBeenCalled();
  });
});
