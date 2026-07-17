import type { ProjectStatus } from "@data/projects";

import styles from "./StatusBadge.module.scss";

const LABELS: Record<ProjectStatus, string> = {
  live: "Live",
  "in-progress": "In progress",
  "rewrite-planned": "Rewrite planned",
  showcase: "Showcase",
};

type StatusBadgeProps = {
  status: ProjectStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`${styles.statusBadge} ${styles[`statusBadge--${status}`]}`}
    >
      {LABELS[status]}
    </span>
  );
}
