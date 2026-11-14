"use client";

import { useState } from "react";
import { Leva } from "leva";

type TuningPanelProps = {
  /** Keep the panel mounted but out of sight. Leva otherwise floats a default panel of its own. */
  hidden?: boolean;
};

/**
 * The Leva dev panel, rendered inline inside the HUD. Collapse state is
 * controlled so HUD re-renders never pop it open.
 */
export function TuningPanel({ hidden = false }: TuningPanelProps) {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <Leva
      fill
      flat
      hidden={hidden}
      hideCopyButton
      collapsed={{ collapsed, onChange: setCollapsed }}
      titleBar={{ title: "Tuning", drag: false, filter: false }}
    />
  );
}
