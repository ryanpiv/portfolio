import { GridItem } from "@components/GridItem";
import type { Project } from "@data/projects";
import type { GithubRepoMeta } from "@utils/github";

import styles from "./Grid.module.scss";

type GridProps = {
  projects: Project[];
  githubBySlug?: Record<string, GithubRepoMeta | null>;
};

export function Grid({ projects, githubBySlug = {} }: GridProps) {
  return (
    <ul className={styles.grid}>
      {projects.map((project) => (
        <li key={project.slug} className={styles.grid__item}>
          <GridItem project={project} github={githubBySlug[project.slug]} />
        </li>
      ))}
    </ul>
  );
}
