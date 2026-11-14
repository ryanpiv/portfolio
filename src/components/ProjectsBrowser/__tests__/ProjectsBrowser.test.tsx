import { fireEvent, render, screen } from "@testing-library/react";

import { ProjectsBrowser, PROJECTS_VIEW_KEY } from "../ProjectsBrowser";

function renderBrowser() {
  render(<ProjectsBrowser roster={<p>roster view</p>} grid={<p>grid view</p>} />);
}

describe("ProjectsBrowser", () => {
  beforeEach(() => window.localStorage.clear());

  it("starts on the roster and remembers a switch to the grid", () => {
    renderBrowser();
    expect(screen.getByRole("button", { name: "roster" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "grid" }));
    expect(screen.getByRole("button", { name: "grid" })).toHaveAttribute("aria-pressed", "true");
    expect(window.localStorage.getItem(PROJECTS_VIEW_KEY)).toBe("grid");
  });

  it("opens on the remembered view next time", () => {
    window.localStorage.setItem(PROJECTS_VIEW_KEY, "grid");
    renderBrowser();
    expect(screen.getByRole("button", { name: "grid" })).toHaveAttribute("aria-pressed", "true");
  });
});
