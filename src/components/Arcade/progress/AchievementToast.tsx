"use client";

import { useEffect, useState } from "react";

import { achievements, type Achievement } from "@data/lab";
import type { ProgressStore } from "@utils/progressStore";

import styles from "./progress.module.scss";

/** How long a toast stays up. */
export const TOAST_MS = 4000;
/** Unlocks older than this (e.g. restored from storage) are not announced. */
const FRESH_MS = 1000;

/** Announces an achievement the moment it unlocks. */
export function AchievementToast({ store }: { store: ProgressStore }) {
  const [toast, setToast] = useState<Achievement | null>(null);

  useEffect(() => {
    let seen = store.get().unlocked.length;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = store.subscribe(() => {
      const { unlocked } = store.get();
      const grew = unlocked.length > seen;
      seen = unlocked.length;
      if (!grew) return;
      const latest = unlocked[unlocked.length - 1];
      if (Date.now() - latest.at > FRESH_MS) return;
      const achievement = achievements.find((a) => a.id === latest.id);
      if (!achievement) return;
      setToast(achievement);
      clearTimeout(timer);
      timer = setTimeout(() => setToast(null), TOAST_MS);
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [store]);

  if (!toast) return null;
  return (
    <div className={styles.toast} role="status">
      <p className={styles.toast__eyebrow}>achievement unlocked</p>
      <p className={styles.toast__title}>{toast.title}</p>
      <p className={styles.toast__description}>{toast.description}</p>
    </div>
  );
}
