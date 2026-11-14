"use client";

import { useState } from "react";
import { Leva } from "leva";

/**
 * The Leva dev panel, rendered inline inside the HUD. Collapse state is
 * controlled so HUD re-renders never pop it open.
 */
export function TuningPanel() {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <Leva
      fill
      flat
      hideCopyButton
      collapsed={{ collapsed, onChange: setCollapsed }}
      titleBar={{ title: "Tuning", drag: false, filter: false }}
    />
  );
}
