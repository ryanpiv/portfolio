import { ExternalLink } from "@components/ExternalLink";
import { StatusBadge } from "@components/StatusBadge";
import { TagList } from "@components/TagList";
import type { Project } from "@data/projects";
import type { GithubRepoMeta } from "@utils/github";
import { formatMonthYear } from "@utils/formatDate";

import styles from "./ProjectHeader.module.scss";

type ProjectHeaderProps = {
  project: Project;
  github?: GithubRepoMeta | null;
};

type HeaderLink = { href: string; label: string };

/** Live → GitHub → legacy, skipping any that are unset. */
function headerLinks(project: Project): HeaderLink[] {
  const links: Array<HeaderLink | null> = [
    project.liveUrl ? { href: project.liveUrl, label: "Open live →" } : null,
    { href: project.repo, label: "GitHub →" },
    project.legacyRepo ? { href: project.legacyRepo, label: "Legacy repo →" } : null,
  ];
  return links.filter((link): link is HeaderLink => link !== null);
}

function githubSummary(github: GithubRepoMeta): string {
  const updated = github.pushedAt ? ` · updated ${formatMonthYear(github.pushedAt)}` : "";
  return `${github.language}${updated}`;
}

export function ProjectHeader({ project, github }: ProjectHeaderProps) {
  return (
    <header className={styles.projectHeader}>
      <div className={styles.projectHeader__meta}>
        <StatusBadge status={project.status} />
        <span className={styles.projectHeader__year}>{project.year}</span>
        {github?.language && (
          <span className={styles.projectHeader__githubMeta}>{githubSummary(github)}</span>
        )}
      </div>
      <h1 className={styles.projectHeader__title}>{project.title}</h1>
      <p className={styles.projectHeader__description}>{project.description}</p>
      <TagList tags={project.tags} />
      <ul className={styles.projectHeader__links}>
        {headerLinks(project).map((link) => (
          <li key={link.href}>
            <ExternalLink className={styles.projectHeader__link} href={link.href}>
              {link.label}
            </ExternalLink>
          </li>
        ))}
      </ul>
    </header>
  );
}
