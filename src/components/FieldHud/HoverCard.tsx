import { StatusBadge } from "@components/StatusBadge";
import type { Project } from "@data/projects";

import styles from "./FieldHud.module.scss";

type HoverCardProps = {
  project: Project | null;
  dragging: boolean;
};

const IDLE_HINT = "hover a sphere to slow it · drag to fling · click to open";
const HOVER_HINT = "click to open · drag to fling";
const DRAG_HINT = "release to fling";

/** Bottom-left card: the hovered project, or usage hints when idle. */
export function HoverCard({ project, dragging }: HoverCardProps) {
  return (
    <div className={styles.fieldHud__card} aria-live="polite">
      {project ? (
        <>
          <div className={styles.fieldHud__cardMeta}>
            <StatusBadge status={project.status} />
            <span className={styles.fieldHud__year}>{project.year}</span>
          </div>
          <p className={styles.fieldHud__cardTitle}>{project.title}</p>
          <p className={styles.fieldHud__cardDescription}>{project.description}</p>
          <p className={styles.fieldHud__hint}>{dragging ? DRAG_HINT : HOVER_HINT}</p>
        </>
      ) : (
        <p className={styles.fieldHud__hint}>{IDLE_HINT}</p>
      )}
    </div>
  );
}
