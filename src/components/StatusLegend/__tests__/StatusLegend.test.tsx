import { render, screen } from "@testing-library/react";

import { StatusLegend } from "@components/StatusLegend";

describe("StatusLegend", () => {
  it("lists every status with its label", () => {
    render(
      <StatusLegend
        colors={{ live: "#1", "in-progress": "#2", "rewrite-planned": "#3", showcase: "#4" }}
      />,
    );
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "Live",
      "In progress",
      "Rewrite planned",
      "Showcase",
    ]);
  });
});
