import type { ReactNode } from "react";

import styles from "./SlantStage.module.scss";

/** Content that unfurls (0fr → 1fr) when its panel is picked. Place inside a `SlantPanel`. */
export function SlantDetail({ children }: { children: ReactNode }) {
  return (
    <span className={styles.detail}>
      <span className={styles.detail__inner}>{children}</span>
    </span>
  );
}
