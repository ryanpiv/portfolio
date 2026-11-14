import { act, render, screen } from "@testing-library/react";

import { starFoxWaves } from "@data/lab";

import { applyDamage, createGameStore, recordEscape, recordHit } from "../game/gameStore";
import { StarFoxHud } from "../StarFoxHud";

const rules = { waves: starFoxWaves, shieldMax: 100 };

function renderHud(store = createGameStore(rules)) {
  render(<StarFoxHud theme="dark" onThemeChange={() => {}} store={store} onRetry={() => {}} />);
  return store;
}

describe("StarFoxHud", () => {
  it("renders the readout from the store and follows updates", () => {
    const store = renderHud();
    expect(screen.getByText("wave").nextElementSibling).toHaveTextContent("1 / 4");
    expect(screen.getByText("hits").nextElementSibling).toHaveTextContent("0 / 16");

    act(() => {
      recordHit(store, "parse-ai");
      recordEscape(store);
      applyDamage(store, 40);
    });
    expect(screen.getByText("hits").nextElementSibling).toHaveTextContent("1 / 16");
    expect(screen.getByText("escaped").nextElementSibling).toHaveTextContent("1");
    expect(screen.getByRole("meter", { name: /shield/i })).toHaveAttribute("aria-valuenow", "60");
  });

  it("shows the mission screen once the run ends", () => {
    const store = renderHud();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    act(() => applyDamage(store, 100));
    expect(screen.getByRole("dialog", { name: /shield gone/i })).toBeInTheDocument();
  });
});
