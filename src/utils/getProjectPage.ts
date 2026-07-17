import type { ComponentType } from "react";

import { getProjectBySlug, type Project } from "@data/projects";

export type ProjectWriteup = ComponentType;

const writeupLoaders: Record<
  string,
  () => Promise<{ default: ProjectWriteup }>
> = {
  "murph-button": () => import("@content/projects/murph-button.mdx"),
};

export type ProjectPageData = {
  project: Project;
  Writeup: ProjectWriteup | null;
};

export async function getProjectPage(
  slug: string,
): Promise<ProjectPageData | null> {
  const project = getProjectBySlug(slug);
  if (!project) return null;

  const loader = writeupLoaders[slug];
  if (!loader) {
    return { project, Writeup: null };
  }

  try {
    const mod = await loader();
    return { project, Writeup: mod.default };
  } catch {
    return { project, Writeup: null };
  }
}

export function hasProjectWriteup(slug: string): boolean {
  return Boolean(writeupLoaders[slug]);
}
