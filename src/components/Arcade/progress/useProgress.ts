"use client";

import { useEffect } from "react";

import { createProgressStore, hydrateProgress, type ProgressStore } from "@utils/progressStore";

/** Module singleton so progress carries across client-side navigation between modes. */
const progressStore: ProgressStore = createProgressStore();

/** Hydrates the shared progression from localStorage on mount and mirrors changes back. */
export function useProgress(): ProgressStore {
  useEffect(() => hydrateProgress(progressStore), []);
  return progressStore;
}
