import { render, screen } from "@testing-library/react";

import { landingChoices } from "@data/landing";

import { Landing } from "../Landing";

describe("Landing", () => {
  it("offers both ways in as links with their detail sheets", () => {
    render(<Landing choices={landingChoices} />);
    const arcade = screen.getByRole("link", { name: /arcade/i });
    const classic = screen.getByRole("link", { name: /classic/i });
    expect(arcade).toHaveAttribute("href", "/lab/arcade/roam");
    expect(classic).toHaveAttribute("href", "/projects");
    expect(arcade).toHaveTextContent("Launch");
    expect(classic).toHaveTextContent("Browse");
    expect(screen.getAllByRole("term")).toHaveLength(landingChoices.reduce((n, c) => n + c.stats.length, 0));
  });
});
