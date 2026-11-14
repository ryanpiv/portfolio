import type { CSSProperties } from "react";

import { SlantDetail, SlantPanel } from "@components/SlantStage";
import { StatusBadge } from "@components/StatusBadge";
import { TagList } from "@components/TagList";
import type { Project } from "@data/projects";
import { cx } from "@utils/cx";
import type { GithubRepoMeta } from "@utils/github";

import styles from "./ProjectRoster.module.scss";

type RosterPanelProps = {
  project: Project;
  github?: GithubRepoMeta | null;
  index: number;
};

/** One project in the roster: name on end while idle, the card's facts when picked. */
export function RosterPanel({ project, github, index }: RosterPanelProps) {
  const slot = String(index + 1).padStart(2, "0");
  return (
    <SlantPanel
      href={`/projects/${project.slug}`}
      align="center"
      className={cx(styles.panel, styles[`panel--${project.status}`])}
      style={{ "--roster-index": index } as CSSProperties}
    >
      <span className={styles.panel__idle} aria-hidden="true">
        <span className={styles.panel__spine}>
          <span className={styles.panel__slot}>{slot}</span>
          <span className={styles.panel__spineTitle}>{project.title}</span>
          <span className={styles.panel__year}>{project.year}</span>
        </span>
      </span>
      <span className={styles.panel__picked}>
        <span className={styles.panel__meta}>
          <StatusBadge status={project.status} />
          <span className={styles.panel__metaYear}>{project.year}</span>
        </span>
        <span className={styles.panel__title}>{project.title}</span>
        <SlantDetail>
          <span className={styles.panel__description}>{project.description}</span>
          <TagList tags={project.tags} />
          <span className={styles.panel__footer}>
            <span className={styles.panel__language}>{github?.language ?? project.tags[0] ?? "Project"}</span>
            <span className={styles.panel__cta}>{project.liveUrl ? "Details + live →" : "Details →"}</span>
          </span>
        </SlantDetail>
      </span>
    </SlantPanel>
  );
}
