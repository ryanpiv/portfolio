import { fireEvent, render, screen } from "@testing-library/react";

import { createProgressStore } from "@utils/progressStore";

import { ArcadeHud } from "../ArcadeHud";

function renderHud(mode: "rail" | "roam" = "rail") {
  render(
    <ArcadeHud
      theme="dark"
      onThemeChange={() => {}}
      mode={mode}
      progress={createProgressStore()}
      readout={[
        { label: "wave", value: "1 / 4" },
        { label: "hits", value: "0 / 16" },
      ]}
      hint="steer with WASD"
      gauge={<p>gauge slot</p>}
      tracker={<p>tracker slot</p>}
      weapon={<p>weapon slot</p>}
      center={<p>center slot</p>}
      controls={(hidden) => <p>{hidden ? "tuning hidden" : "tuning slot"}</p>}
    />,
  );
}

describe("ArcadeHud", () => {
  it("renders the readout, gauge, hint, and center slots", () => {
    renderHud();
    expect(screen.getByText("wave").nextElementSibling).toHaveTextContent("1 / 4");
    expect(screen.getByText("hits").nextElementSibling).toHaveTextContent("0 / 16");
    expect(screen.getByText("gauge slot")).toBeInTheDocument();
    expect(screen.getByText("tracker slot")).toBeInTheDocument();
    expect(screen.getByText("weapon slot")).toBeInTheDocument();
    expect(screen.getByText("center slot")).toBeInTheDocument();
    expect(screen.getByText("steer with WASD")).toBeInTheDocument();
  });

  it("links to the other game mode, carrying the theme", () => {
    renderHud("rail");
    const nav = screen.getByRole("navigation", { name: /mode/i });
    const rail = screen.getByRole("link", { name: "rail" });
    const roam = screen.getByRole("link", { name: "free roam" });
    expect(nav).toContainElement(rail);
    expect(rail).toHaveAttribute("aria-current", "page");
    expect(roam).not.toHaveAttribute("aria-current");
    expect(roam).toHaveAttribute("href", "/lab/arcade/roam?theme=dark");
  });

  it("includes the achievements panel", () => {
    renderHud("roam");
    expect(screen.getByRole("button", { name: /achievements/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "free roam" })).toHaveAttribute("aria-current", "page");
  });

  it("keeps the tuning panel hidden until toggled", () => {
    renderHud();
    expect(screen.getByText("tuning hidden")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "tuning" }));
    expect(screen.getByText("tuning slot")).toBeInTheDocument();
  });
});
