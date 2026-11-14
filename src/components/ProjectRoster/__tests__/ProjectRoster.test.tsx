import { render, screen } from "@testing-library/react";

import { projects } from "@data/projects";

import { ProjectRoster } from "../ProjectRoster";

describe("ProjectRoster", () => {
  it("renders one linked panel per project with its card facts", () => {
    render(<ProjectRoster projects={projects} githubBySlug={{ [projects[0].slug]: { language: "TypeScript" } as never }} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(projects.length);
    expect(links[0]).toHaveAttribute("href", `/projects/${projects[0].slug}`);
    expect(links[0]).toHaveTextContent(projects[0].description);
    expect(links[0]).toHaveTextContent("TypeScript");
    expect(screen.getByRole("group", { name: "Projects" })).toBeInTheDocument();
  });
});
