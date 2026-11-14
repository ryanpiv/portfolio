import { act, fireEvent, render, screen } from "@testing-library/react";

import { achievements } from "@data/lab";
import { createProgressStore, recordStat } from "@utils/progressStore";

import { AchievementsPanel } from "../progress/AchievementsPanel";
import { AchievementToast, TOAST_MS } from "../progress/AchievementToast";

describe("AchievementToast", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("announces a fresh unlock and clears it after a while", () => {
    const store = createProgressStore();
    render(<AchievementToast store={store} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    act(() => recordStat(store, "enemiesDestroyed"));
    expect(screen.getByRole("status")).toHaveTextContent(/first blood/i);

    act(() => jest.advanceTimersByTime(TOAST_MS));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("ignores stale unlocks restored from storage", () => {
    const store = createProgressStore();
    render(<AchievementToast store={store} />);
    act(() => store.set({ unlocked: [{ id: "ace", at: Date.now() - 60_000 }] }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

describe("AchievementsPanel", () => {
  it("shows the count and expands to the full list with progress", () => {
    const store = createProgressStore();
    recordStat(store, "enemiesDestroyed", 5);
    render(<AchievementsPanel store={store} />);

    const toggle = screen.getByRole("button", { name: /achievements 1 \/ \d+/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);

    expect(screen.getAllByRole("listitem")).toHaveLength(achievements.length);
    expect(screen.getByText("First Blood").parentElement).toHaveTextContent("✓");
    expect(screen.getByText("Ace").parentElement).toHaveTextContent("50%");
  });
});
