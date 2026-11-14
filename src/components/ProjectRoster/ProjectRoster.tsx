import { SlantStage } from "@components/SlantStage";
import type { Project } from "@data/projects";
import type { GithubRepoMeta } from "@utils/github";

import styles from "./ProjectRoster.module.scss";
import { RosterPanel } from "./RosterPanel";

type ProjectRosterProps = {
  projects: Project[];
  githubBySlug?: Record<string, GithubRepoMeta | null>;
};

/** Gentle shear: sixteen panels share the width, so the divider stays close to upright. */
const SLANT_DEG = 12;
/** The picked project takes this many shares against one each for the rest. */
const EXPAND = 9;

/**
 * Character-select browser for the registry: every project is a slim
 * slanted panel showing its name on end; hover one and it opens to the
 * same facts the grid card carries. Hidden below the medium breakpoint,
 * where `ProjectsBrowser` shows the grid instead.
 */
export function ProjectRoster({ projects, githubBySlug = {} }: ProjectRosterProps) {
  return (
    <SlantStage slant={SLANT_DEG} expand={EXPAND} height="var(--roster-height)" label="Projects" bleed={false} className={styles.roster}>
      {projects.map((project, index) => (
        <RosterPanel key={project.slug} project={project} github={githubBySlug[project.slug]} index={index} />
      ))}
    </SlantStage>
  );
}
