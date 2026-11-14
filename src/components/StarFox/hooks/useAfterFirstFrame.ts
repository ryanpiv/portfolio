"use client";

import { useState } from "react";
import { useFrame } from "@react-three/fiber";

/**
 * False on the initial render, true from the first frame on. Mounting
 * `<Html>`-bearing children behind this keeps their DOM roots from being
 * created and torn down inside the Canvas's own DOM commit (StrictMode
 * double-invokes layout effects there, which React warns about).
 */
export function useAfterFirstFrame(): boolean {
  const [ready, setReady] = useState(false);
  useFrame(() => {
    if (!ready) setReady(true);
  });
  return ready;
}
