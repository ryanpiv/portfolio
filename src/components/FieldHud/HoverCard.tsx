import { LabHudCard, LabHudHint } from "@components/LabHud";
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
    <LabHudCard live>
      {project ? (
        <>
          <div className={styles.hoverCard__meta}>
            <StatusBadge status={project.status} />
            <span className={styles.hoverCard__year}>{project.year}</span>
          </div>
          <p className={styles.hoverCard__title}>{project.title}</p>
          <p className={styles.hoverCard__description}>{project.description}</p>
          <LabHudHint>{dragging ? DRAG_HINT : HOVER_HINT}</LabHudHint>
        </>
      ) : (
        <LabHudHint>{IDLE_HINT}</LabHudHint>
      )}
    </LabHudCard>
  );
}
