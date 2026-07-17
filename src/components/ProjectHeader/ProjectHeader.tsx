import { StatusBadge } from "@components/StatusBadge";
import type { Project } from "@data/projects";
import type { GithubRepoMeta } from "@utils/github";

import styles from "./ProjectHeader.module.scss";

type ProjectHeaderProps = {
  project: Project;
  github?: GithubRepoMeta | null;
};

export function ProjectHeader({ project, github }: ProjectHeaderProps) {
  return (
    <header className={styles.projectHeader}>
      <div className={styles.projectHeader__meta}>
        <StatusBadge status={project.status} />
        <span className={styles.projectHeader__year}>{project.year}</span>
        {github?.language ? (
          <span className={styles.projectHeader__githubMeta}>
            {github.language}
            {github.pushedAt
              ? ` · updated ${new Date(github.pushedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                })}`
              : null}
          </span>
        ) : null}
      </div>
      <h1 className={styles.projectHeader__title}>{project.title}</h1>
      <p className={styles.projectHeader__description}>{project.description}</p>
      <ul className={styles.projectHeader__tags}>
        {project.tags.map((tag) => (
          <li key={tag} className={styles.projectHeader__tag}>
            {tag}
          </li>
        ))}
      </ul>
      <ul className={styles.projectHeader__links}>
        {project.liveUrl ? (
          <li>
            <a
              className={styles.projectHeader__link}
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open live →
            </a>
          </li>
        ) : null}
        <li>
          <a
            className={styles.projectHeader__link}
            href={project.repo}
            target="_blank"
            rel="noreferrer"
          >
            GitHub →
          </a>
        </li>
        {project.legacyRepo ? (
          <li>
            <a
              className={styles.projectHeader__link}
              href={project.legacyRepo}
              target="_blank"
              rel="noreferrer"
            >
              Legacy repo →
            </a>
          </li>
        ) : null}
      </ul>
    </header>
  );
}
