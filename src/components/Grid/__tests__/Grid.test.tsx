import { render, screen } from "@testing-library/react";

import { Grid } from "@components/Grid";
import type { Project } from "@data/projects";

const projects: Project[] = [
  {
    slug: "parse-ai",
    title: "Parse AI",
    description: "Fight analysis.",
    tags: ["Next.js"],
    repo: "https://github.com/ryanpiv/parse-ai",
    status: "live",
    year: 2026,
  },
  {
    slug: "murph-button",
    title: "Murph Button",
    description: "murrrrph.",
    tags: ["CSS"],
    repo: "https://github.com/ryanpiv/MurphButton",
    status: "showcase",
    year: 2015,
  },
];

describe("Grid", () => {
  it("renders a card per project", () => {
    render(<Grid projects={projects} />);
    expect(screen.getByText("Parse AI")).toBeInTheDocument();
    expect(screen.getByText("Murph Button")).toBeInTheDocument();
  });
});
