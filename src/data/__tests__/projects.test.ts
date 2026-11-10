import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  getAllProjectSlugs,
  getProjectBySlug,
  projects,
} from "@data/projects";

describe("projects registry", () => {
  it("has unique slugs", () => {
    const slugs = getAllProjectSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("looks up a project by slug", () => {
    expect(getProjectBySlug("murph-button")?.title).toBe("Murph Button");
    expect(getProjectBySlug("nope")).toBeUndefined();
  });

  it("only uses statuses that have a label", () => {
    for (const project of projects) {
      expect(PROJECT_STATUSES).toContain(project.status);
      expect(PROJECT_STATUS_LABELS[project.status]).toBeTruthy();
    }
  });
});
