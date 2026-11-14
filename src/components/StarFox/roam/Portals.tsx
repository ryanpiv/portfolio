"use client";

import { useEffect, useRef } from "react";

import { segmentCrossesDisc } from "@utils/collision";
import type { Vec3 } from "@utils/fieldLayout";
import { recordExplored, recordStat } from "@utils/progressStore";

import { useGameFrame } from "../hooks/useGameFrame";
import { Portal, PORTAL_RADIUS } from "./Portal";
import { useRoam } from "./roamContext";
import { enterPortal } from "./roamStore";

/** Renders every portal and watches for the ship crossing one. */
export function Portals() {
  const { config, lighting, shipRef, simRef, progress, store, layout, radarRef } = useRoam();
  const prev = useRef<Vec3 | null>(null);
  const { scoring } = config;

  useEffect(() => {
    radarRef.current.portals = layout.portals.map((p) => ({
      x: p.position[0],
      z: p.position[2],
      color: lighting.statusColors[p.project.status],
    }));
  }, [layout, lighting, radarRef]);

  useGameFrame(() => {
    const ship = shipRef.current;
    if (!ship) return;
    const now: Vec3 = [ship.position.x, ship.position.y, ship.position.z];
    const before = prev.current;
    prev.current = now;
    if (!before) return;

    for (const spot of layout.portals) {
      if (!segmentCrossesDisc(before, now, spot.position, spot.normal, PORTAL_RADIUS)) continue;
      const { slug, title, status } = spot.project;
      const color = lighting.statusColors[status];
      const firstVisit = !progress.get().stats.projectsExplored.includes(slug);
      const points = scoring.portal + (firstVisit ? scoring.firstVisit : 0);
      if (!enterPortal(store, { slug, title, color }, points)) return;

      simRef.current.bursts.push({ position: [...spot.position], color, size: 2 });
      recordStat(progress, "portalsFlown");
      recordStat(progress, "points", points);
      recordExplored(progress, slug);
      return;
    }
  });

  return (
    <>
      {layout.portals.map((spot) => (
        <Portal key={spot.project.slug} spot={spot} />
      ))}
    </>
  );
}
