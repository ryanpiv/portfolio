import Link from "next/link";

import styles from "./SceneFallback.module.scss";

/**
 * Shown in place of a WebGL scene when the browser cannot create a 3D
 * context. Plain HTML, so it always renders; points at the roster, which
 * has every project without needing a GPU.
 */
export function SceneFallback() {
  return (
    <div className={styles.fallback} role="status">
      <p className={styles.fallback__eyebrow}>No WebGL</p>
      <h2 className={styles.fallback__title}>This scene needs a 3D context the browser could not start.</h2>
      <p className={styles.fallback__body}>
        Hardware acceleration may be off, or the device does not support it. Everything here is also on the roster,
        which runs on plain HTML.
      </p>
      <p className={styles.fallback__links}>
        <Link href="/projects" className={styles.fallback__link}>
          Browse the roster →
        </Link>
        <Link href="/lab" className={styles.fallback__link}>
          Back to the lab
        </Link>
      </p>
    </div>
  );
}
