"use client";

import { useState, type ReactNode } from "react";

import { PillGroup, type PillOption } from "@components/PillGroup";
import { cx } from "@utils/cx";

import styles from "./ProjectsBrowser.module.scss";

export type ProjectsView = "roster" | "grid";

type ProjectsBrowserProps = {
  roster: ReactNode;
  grid: ReactNode;
  defaultView?: ProjectsView;
};

const VIEW_OPTIONS: PillOption<ProjectsView>[] = [
  { value: "roster", label: "roster" },
  { value: "grid", label: "grid" },
];

/**
 * Switch between the roster (default, wide screens) and the plain grid.
 * Both are server-rendered and passed in; this only toggles which shows.
 * Below the medium breakpoint the roster hides itself and the grid always
 * shows, so the switch is hidden there too.
 */
export function ProjectsBrowser({ roster, grid, defaultView = "roster" }: ProjectsBrowserProps) {
  const [view, setView] = useState<ProjectsView>(defaultView);
  return (
    <div className={styles.browser}>
      <div className={styles.browser__switch}>
        <PillGroup label="View" options={VIEW_OPTIONS} value={view} onChange={setView} />
      </div>
      <div className={cx(styles.browser__view, view !== "roster" && styles["browser__view--hidden"])}>{roster}</div>
      <div className={cx(styles.browser__view, styles["browser__view--grid"], view !== "grid" && styles["browser__view--hidden"])}>
        {grid}
      </div>
    </div>
  );
}
