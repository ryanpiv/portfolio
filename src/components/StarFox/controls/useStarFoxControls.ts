"use client";

import { useMemo } from "react";
import { useControls } from "leva";

import { starFoxConfig, type StarFoxConfig } from "@data/lab";
import { slider } from "@utils/leva";

import { useCombatControls } from "./useCombatControls";

/** Leva panel for rail mode, seeded from `starFoxConfig`; returns the live config. */
export function useStarFoxControls(): StarFoxConfig {
  const base = starFoxConfig;

  const ship = useControls("Ship", {
    speed: slider(base.ship.speed, 4, 40, 0.5),
    responsiveness: slider(base.ship.responsiveness, 1, 20, 0.5),
    halfWidth: slider(base.ship.halfWidth, 4, 20, 0.5),
    halfHeight: slider(base.ship.halfHeight, 2, 12, 0.5),
    bank: slider(base.ship.bank, 0, 1.5, 0.05),
    pitch: slider(base.ship.pitch, 0, 1, 0.05),
  });

  const world = useControls("World", {
    scrollSpeed: slider(base.world.scrollSpeed, 0, 120, 1),
    fogNear: slider(base.world.fogNear, 0, 200, 5),
    fogFar: slider(base.world.fogFar, 50, 400, 5),
  });

  const camera = useControls("Camera", {
    height: slider(base.camera.offset[1], 0, 12, 0.25),
    distance: slider(base.camera.offset[2], 4, 30, 0.5),
    follow: slider(base.camera.follow, 0, 1, 0.05),
    lag: slider(base.camera.lag, 1, 20, 0.5),
    lookAhead: slider(base.camera.lookAhead, 5, 100, 1),
    fov: slider(base.camera.fov, 30, 100, 1),
  });

  const combat = useCombatControls();

  return useMemo<StarFoxConfig>(
    () => ({
      ship: { ...base.ship, ...ship },
      world: { ...base.world, ...world },
      camera: {
        ...base.camera,
        offset: [base.camera.offset[0], camera.height, camera.distance],
        follow: camera.follow,
        lag: camera.lag,
        lookAhead: camera.lookAhead,
        fov: camera.fov,
      },
      combat,
      scoring: base.scoring,
    }),
    [base, ship, world, camera, combat],
  );
}
