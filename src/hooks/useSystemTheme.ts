"use client";

import { useSyncExternalStore } from "react";

export type SystemTheme = "dark" | "light";

const LIGHT_QUERY = "(prefers-color-scheme: light)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(LIGHT_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSnapshot(): SystemTheme {
  return window.matchMedia(LIGHT_QUERY).matches ? "light" : "dark";
}

const getServerSnapshot = (): SystemTheme => "dark";

/** The OS color-scheme preference, live-updating. Always "dark" during SSR. */
export function useSystemTheme(): SystemTheme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
