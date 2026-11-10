import { PROJECT_STATUS_LABELS, type ProjectStatus } from "@data/projects";
import { cx } from "@utils/cx";

import styles from "./StatusBadge.module.scss";

type StatusBadgeProps = {
  status: ProjectStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={cx(styles.statusBadge, styles[`statusBadge--${status}`])}>
      {PROJECT_STATUS_LABELS[status]}
    </span>
  );
}
