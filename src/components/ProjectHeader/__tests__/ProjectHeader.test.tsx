import { render, screen } from "@testing-library/react";

import { ProjectHeader } from "@components/ProjectHeader";
import type { Project } from "@data/projects";

const base: Project = {
  slug: "guildsongbot",
  title: "GuildSongBot",
  description: "Discord bot.",
  tags: ["Node", "Discord"],
  repo: "https://github.com/x/guildsongbot",
  status: "live",
  year: 2021,
};

describe("ProjectHeader", () => {
  it("always shows the GitHub link, and only optional links when set", () => {
    render(<ProjectHeader project={base} />);
    expect(screen.getAllByRole("link").map((a) => a.textContent)).toEqual(["GitHub →"]);
  });

  it("orders links live → GitHub → legacy", () => {
    render(
      <ProjectHeader
        project={{ ...base, liveUrl: "https://live.example", legacyRepo: "https://github.com/x/old" }}
      />,
    );
    expect(screen.getAllByRole("link").map((a) => a.textContent)).toEqual([
      "Open live →",
      "GitHub →",
      "Legacy repo →",
    ]);
  });

  it("renders GitHub language and last-push month when provided", () => {
    render(
      <ProjectHeader
        project={base}
        github={{ language: "TypeScript", pushedAt: "2024-03-09T10:00:00Z", stars: 1 }}
      />,
    );
    expect(screen.getByText("TypeScript · updated Mar 2024")).toBeInTheDocument();
  });
});
