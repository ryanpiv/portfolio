"use client";

import { useMemo } from "react";
import { useControls } from "leva";

import { starFoxConfig, type CombatConfig } from "@data/lab";
import { slider } from "@utils/leva";

/** Leva "Combat" folder shared by both modes; returns the live combat config. */
export function useCombatControls(): CombatConfig {
  const base = starFoxConfig.combat;
  const combat = useControls("Combat", {
    fireRate: slider(base.fireRate, 1, 20, 0.5),
    laserSpeed: slider(base.laserSpeed, 40, 300, 5),
    enemyRadius: slider(base.enemyRadius, 0.5, 4, 0.1),
    spawnDistance: slider(base.spawnDistance, 60, 240, 5),
    ramDamage: slider(base.ramDamage, 0, 100, 5),
    shotDamage: slider(base.shotDamage, 0, 100, 5),
    enemyFireInterval: slider(base.enemyFireInterval, 0.5, 6, 0.1),
    enemyShotSpeed: slider(base.enemyShotSpeed, 20, 200, 5),
  });
  return useMemo(() => ({ ...base, ...combat }), [base, combat]);
}
