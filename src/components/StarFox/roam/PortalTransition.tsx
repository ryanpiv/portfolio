"use client";

import { useEffect } from "react";

import { cx } from "@utils/cx";

import styles from "./PortalTransition.module.scss";
import type { PortalTransition as Transition } from "./roamStore";

/** Takeover length before `onDone` fires; the CSS animation matches. */
export const TRANSITION_MS = 1400;
/** Arrival wash length; shorter, since the visitor is coming back to play. */
export const ARRIVAL_MS = 900;

type PortalTransitionProps = {
  transition: Transition | null;
  /** `enter` floods the screen on the way to a project; `arrive` clears it coming back. */
  direction?: "enter" | "arrive";
  /** Called once the animation completes; navigate (enter) or clear the arrival (arrive). */
  onDone: (transition: Transition) => void;
};

/**
 * Full-screen portal effect in the project's status color. Entering: the
 * color irises in from the center, the title lands, then everything washes
 * to the page background so the route change lands on a plain screen.
 * Arriving: the color irises back out to reveal the arena.
 */
export function PortalTransition({ transition, direction = "enter", onDone }: PortalTransitionProps) {
  const duration = direction === "enter" ? TRANSITION_MS : ARRIVAL_MS;

  useEffect(() => {
    if (!transition) return;
    const timer = window.setTimeout(() => onDone(transition), duration);
    return () => window.clearTimeout(timer);
  }, [transition, onDone, duration]);

  if (!transition) return null;
  return (
    <div
      className={cx(styles.takeover, direction === "arrive" && styles["takeover--arrive"])}
      style={{ "--portal-color": transition.color } as React.CSSProperties}
      role="status"
      aria-live="assertive"
    >
      <p className={styles.takeover__eyebrow}>{direction === "enter" ? "entering" : "back from"}</p>
      <p className={styles.takeover__title}>{transition.title}</p>
    </div>
  );
}
