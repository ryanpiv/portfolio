import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";

import { FieldHud } from "@components/FieldHud";
import { defaultEffects, defaultViewOptions, labVariants } from "@data/lab";
import type { Project } from "@data/projects";

const project: Project = {
  slug: "parse-ai",
  title: "Parse AI",
  description: "Fight analysis.",
  tags: ["Next.js"],
  repo: "https://github.com/ryanpiv/parse-ai",
  status: "live",
  year: 2026,
};

const [caged, tethered] = labVariants;

function renderHud(overrides: Partial<ComponentProps<typeof FieldHud>> = {}) {
  const props: ComponentProps<typeof FieldHud> = {
    variant: caged,
    variants: labVariants,
    theme: "dark",
    onThemeChange: jest.fn(),
    quality: "high",
    onQualityChange: jest.fn(),
    effects: defaultEffects,
    onEffectsChange: jest.fn(),
    view: defaultViewOptions,
    onViewChange: jest.fn(),
    hovered: null,
    dragging: false,
    ...overrides,
  };
  render(<FieldHud {...props} />);
  return props;
}

const openSettings = () => fireEvent.click(screen.getByRole("button", { name: "Settings" }));

describe("FieldHud", () => {
  it("shows the variant, links to the others from the menu, and the idle hint", () => {
    renderHud();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Caged");
    expect(screen.queryByRole("link", { name: "Tethered" })).not.toBeInTheDocument();
    openSettings();
    expect(screen.getByRole("link", { name: "Tethered" })).toHaveAttribute(
      "href",
      "/lab/tethered?theme=dark&quality=high",
    );
    expect(screen.getByText(/hover a sphere to slow it/i)).toBeInTheDocument();
  });

  it("carries non-default view options into variant links", () => {
    renderHud({ view: { nameplates: "hover", tetherLines: false } });
    openSettings();
    expect(screen.getByRole("link", { name: "Attractor" })).toHaveAttribute(
      "href",
      "/lab/attractor?theme=dark&quality=high&names=hover&lines=off",
    );
  });

  it("shows the hovered project and the drag hint", () => {
    renderHud({ variant: tethered, hovered: project, dragging: true });
    expect(screen.getByText("Parse AI")).toBeInTheDocument();
    expect(screen.getByText("Fight analysis.")).toBeInTheDocument();
    expect(screen.getByText("release to fling")).toBeInTheDocument();
  });

  it("calls onThemeChange with the clicked theme", () => {
    const { onThemeChange } = renderHud();
    openSettings();
    fireEvent.click(screen.getByRole("button", { name: "light" }));
    expect(onThemeChange).toHaveBeenCalledWith("light");
    expect(screen.getByRole("button", { name: "dark" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("changes the nameplate mode", () => {
    const { onViewChange } = renderHud();
    openSettings();
    const names = screen.getByRole("group", { name: "Names" });
    expect(names).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Hover" }));
    expect(onViewChange).toHaveBeenCalledWith({ nameplates: "hover" });
    fireEvent.click(screen.getByRole("button", { name: "Off" }));
    expect(onViewChange).toHaveBeenCalledWith({ nameplates: "off" });
  });

  it("only offers the tether-lines toggle on the tethered variant", () => {
    renderHud();
    openSettings();
    expect(screen.queryByRole("group", { name: "Lines" })).not.toBeInTheDocument();
  });

  it("toggles tether lines on the tethered variant", () => {
    const { onViewChange } = renderHud({ variant: tethered });
    openSettings();
    const lines = screen.getByRole("group", { name: "Lines" });
    fireEvent.click(within(lines).getByRole("button", { name: "Off" }));
    expect(onViewChange).toHaveBeenCalledWith({ tetherLines: false });
  });
});
