"use client";

import styles from "./RoamCallout.module.scss";

type RoamCalloutProps = {
  eyebrow: string;
  title: string;
};

/** Centre-screen notice for free roam (going down, respawning). */
export function RoamCallout({ eyebrow, title }: RoamCalloutProps) {
  return (
    <div className={styles.callout} role="status">
      <p className={styles.callout__eyebrow}>{eyebrow}</p>
      <p className={styles.callout__title}>{title}</p>
    </div>
  );
}
