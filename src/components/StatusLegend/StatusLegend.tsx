import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  type ProjectStatus,
} from "@data/projects";

import styles from "./StatusLegend.module.scss";

type StatusLegendProps = {
  /** Swatch color per status (e.g. from a lighting preset). */
  colors: Record<ProjectStatus, string>;
};

/** Horizontal key: color dot + status label for every project status. */
export function StatusLegend({ colors }: StatusLegendProps) {
  return (
    <ul className={styles.statusLegend} aria-label="Status legend">
      {PROJECT_STATUSES.map((status) => (
        <li key={status} className={styles.statusLegend__item}>
          <span className={styles.statusLegend__dot} style={{ background: colors[status] }} />
          {PROJECT_STATUS_LABELS[status]}
        </li>
      ))}
    </ul>
  );
}
