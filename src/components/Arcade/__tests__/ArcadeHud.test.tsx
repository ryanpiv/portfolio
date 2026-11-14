import { fireEvent, render, screen } from "@testing-library/react";

import { defaultEffects } from "@data/lab";
import { createProgressStore } from "@utils/progressStore";

import { ArcadeHud } from "../ArcadeHud";

function renderHud(mode: "rail" | "roam" = "rail") {
  const onEffectsChange = jest.fn();
  render(
    <ArcadeHud
      theme="dark"
      onThemeChange={() => {}}
      quality="high"
      onQualityChange={() => {}}
      effects={defaultEffects}
      onEffectsChange={onEffectsChange}
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
  return { onEffectsChange };
}

const openSettings = () => fireEvent.click(screen.getByRole("button", { name: "Settings" }));

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

  it("keeps everything but the gear out of the way until opened", () => {
    renderHud();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "free roam" })).not.toBeInTheDocument();
    openSettings();
    expect(screen.getByRole("dialog", { name: "Settings" })).toBeInTheDocument();
  });

  it("links to the other game mode from the menu, carrying the theme", () => {
    renderHud("rail");
    openSettings();
    const nav = screen.getByRole("navigation", { name: /mode/i });
    const rail = screen.getByRole("link", { name: "rail" });
    const roam = screen.getByRole("link", { name: "free roam" });
    expect(nav).toContainElement(rail);
    expect(rail).toHaveAttribute("aria-current", "page");
    expect(roam).not.toHaveAttribute("aria-current");
    expect(roam).toHaveAttribute("href", "/lab/arcade/roam?theme=dark&quality=high");
  });

  it("lists achievements and toggles effects inside the menu", () => {
    const { onEffectsChange } = renderHud("roam");
    openSettings();
    expect(screen.getByText(/0 \/ \d+ unlocked/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: /bloom/i }));
    expect(onEffectsChange).toHaveBeenCalledWith({ bloom: false });
    expect(screen.getByRole("group", { name: "Foliage" })).toBeInTheDocument();
  });

  it("keeps the tuning panel hidden until toggled", () => {
    renderHud();
    expect(screen.getByText("tuning hidden")).toBeInTheDocument();
    openSettings();
    fireEvent.click(screen.getByRole("switch", { name: /tuning/i }));
    expect(screen.getByText("tuning slot")).toBeInTheDocument();
  });
});
