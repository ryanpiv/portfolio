"use client";

import { useMemo } from "react";
import { useControls } from "leva";

import { starFoxRoamConfig, type CombatConfig, type RoamConfig } from "@data/lab";
import { slider } from "@utils/leva";

import { useCombatControls } from "../controls/useCombatControls";

/** Leva panel for free roam, seeded from `starFoxRoamConfig`; returns the live config plus combat. */
export function useRoamControls(): { config: RoamConfig; combat: CombatConfig } {
  const base = starFoxRoamConfig;

  const flight = useControls("Flight", {
    cruiseSpeed: slider(base.flight.cruiseSpeed, 5, 80, 1),
    boostSpeed: slider(base.flight.boostSpeed, 10, 140, 1),
    brakeSpeed: slider(base.flight.brakeSpeed, 2, 40, 1),
    turnRate: slider(base.flight.turnRate, 0.3, 4, 0.1),
    maxPitch: slider(base.flight.maxPitch, 0.1, 1.4, 0.05),
    bank: slider(base.flight.bank, 0, 1.5, 0.05),
  });

  const arena = useControls("Arena", {
    buildingCount: slider(base.arena.buildingCount, 0, 200, 5),
    roamerCount: slider(base.arena.roamerCount, 0, 20, 1),
    seed: slider(base.arena.seed, 1, 99, 1),
  });

  const camera = useControls("Camera", {
    distance: slider(base.camera.distance, 4, 40, 0.5),
    height: slider(base.camera.height, 0, 15, 0.25),
    lag: slider(base.camera.lag, 1, 20, 0.5),
    fov: slider(base.camera.fov, 30, 100, 1),
  });

  const combat = useCombatControls();

  const config = useMemo<RoamConfig>(
    () => ({
      ...base,
      flight: { ...base.flight, ...flight },
      arena: { ...base.arena, ...arena },
      camera: { ...base.camera, ...camera },
    }),
    [base, flight, arena, camera],
  );

  return { config, combat };
}
