import { render, screen } from "@testing-library/react";

import { GridItem } from "@components/GridItem";
import type { Project } from "@data/projects";

const project: Project = {
  slug: "murph-button",
  title: "Murph Button",
  description: "murrrrph.",
  tags: ["CSS", "fun"],
  repo: "https://github.com/ryanpiv/MurphButton",
  status: "showcase",
  year: 2015,
};

describe("GridItem", () => {
  it("links to the project detail page", () => {
    render(<GridItem project={project} />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/projects/murph-button",
    );
  });

  it("renders title and description", () => {
    render(<GridItem project={project} />);
    expect(screen.getByText("Murph Button")).toBeInTheDocument();
    expect(screen.getByText("murrrrph.")).toBeInTheDocument();
  });
});
