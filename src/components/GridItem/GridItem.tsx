import Link from "next/link";

import { StatusBadge } from "@components/StatusBadge";
import type { Project } from "@data/projects";
import type { GithubRepoMeta } from "@utils/github";

import styles from "./GridItem.module.scss";

type GridItemProps = {
  project: Project;
  github?: GithubRepoMeta | null;
};

export function GridItem({ project, github }: GridItemProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={styles.gridItem}
    >
      <div className={styles.gridItem__meta}>
        <StatusBadge status={project.status} />
        <span className={styles.gridItem__year}>{project.year}</span>
      </div>
      <h2 className={styles.gridItem__title}>{project.title}</h2>
      <p className={styles.gridItem__description}>{project.description}</p>
      <ul className={styles.gridItem__tags}>
        {project.tags.map((tag) => (
          <li key={tag} className={styles.gridItem__tag}>
            {tag}
          </li>
        ))}
      </ul>
      <div className={styles.gridItem__footer}>
        <span className={styles.gridItem__language}>
          {github?.language ?? project.tags[0] ?? "Project"}
        </span>
        <span className={styles.gridItem__cta}>
          {project.liveUrl ? "Details + live →" : "Details →"}
        </span>
      </div>
    </Link>
  );
}
