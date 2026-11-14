"use client";

import { useEffect } from "react";

import styles from "./PortalTransition.module.scss";
import type { PortalTransition as Transition } from "./roamStore";

/** Total takeover length before `onDone` fires; the CSS animation matches. */
export const TRANSITION_MS = 1400;

type PortalTransitionProps = {
  transition: Transition | null;
  /** Called once the screen is fully covered; navigate here. */
  onDone: (transition: Transition) => void;
};

/**
 * Full-screen takeover after flying through a portal: the project's status
 * color floods in from the center, the title lands, then everything washes
 * to the page background so the route change lands on a plain screen.
 */
export function PortalTransition({ transition, onDone }: PortalTransitionProps) {
  useEffect(() => {
    if (!transition) return;
    const timer = window.setTimeout(() => onDone(transition), TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [transition, onDone]);

  if (!transition) return null;
  return (
    <div
      className={styles.takeover}
      style={{ "--portal-color": transition.color } as React.CSSProperties}
      role="status"
      aria-live="assertive"
    >
      <p className={styles.takeover__eyebrow}>entering</p>
      <p className={styles.takeover__title}>{transition.title}</p>
    </div>
  );
}
