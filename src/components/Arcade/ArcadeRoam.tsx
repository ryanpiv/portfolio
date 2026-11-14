"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { TuningPanel } from "@components/LabScene";
import { LabStage, SceneLoading } from "@components/LabStage";
import { ARCADE_ROAM_ID, labLighting, qualityPresets, roamConfig, weapons, type LabTheme, type QualityId } from "@data/lab";
import { projects } from "@data/projects";
import { useLabViewState } from "@hooks/useLabViewState";
import { useStore } from "@hooks/useStore";

import { useInput } from "./hooks/useInput";
import { useProgress } from "./progress";
import { PortalTransition } from "./roam/PortalTransition";
import { createRadarFrame } from "./roam/radarFrame";
import { Radar } from "./roam/Radar";
import { consumeReturnPortal, rememberReturnPortal } from "./roam/returnPortal";
import { RoamCallout } from "./roam/RoamCallout";
import { WeaponReadout } from "./roam/WeaponReadout";
import { createRoamStore, finishArrival, setSpawnPortal, type PortalTransition as Transition } from "./roam/roamStore";
import { ShieldBar } from "./ShieldBar";
import { ArcadeHud } from "./ArcadeHud";

const RoamScene = dynamic(() => import("./roam/RoamScene"), {
  ssr: false,
  loading: () => <SceneLoading>spooling up the ship…</SceneLoading>,
});

/** Radar covers this much of the arena around the ship. */
const RADAR_RANGE = roamConfig.arena.radius * 0.6;

const HINT = {
  keys: "WASD / arrows to steer · shift boost · ctrl / X brake · space fires · double-tap A/D to barrel roll · rings open projects · grab pickups for weapons and repairs",
  touch: "hold to steer toward your finger and fire · rings open projects · grab pickups for weapons and repairs",
} as const;

/** Mirrors the LabHud --hud-ink / --hud-muted values so the radar canvas matches the chrome. */
const RADAR_INK: Record<LabTheme, { ink: string; muted: string }> = {
  dark: { ink: "#f2f2f0", muted: "#8a8a92" },
  light: { ink: "#0c0c0e", muted: "#5a5a64" },
};

type ArcadeRoamProps = {
  initialTheme?: LabTheme;
  initialQuality?: QualityId;
};

/** Full-viewport free-roam arena for `/lab/arcade/roam`. Portals hand off to the project pages. */
export function ArcadeRoam({ initialTheme, initialQuality }: ArcadeRoamProps) {
  const router = useRouter();
  const { theme, setTheme, quality, setQuality, degradeQuality, effects, patchEffects, capability } = useLabViewState({
    variantId: ARCADE_ROAM_ID,
    initialTheme,
    initialQuality,
  });
  const { input, bind } = useInput();
  const progress = useProgress();
  const [store] = useState(() => createRoamStore(roamConfig.hull.healthMax));
  const radarRef = useRef(createRadarFrame(RADAR_RANGE));
  const game = useStore(store);
  const explored = useStore(progress).stats.projectsExplored.length;

  // Back from a project: the ship should emerge from the portal it took.
  useEffect(() => {
    const slug = consumeReturnPortal();
    if (slug) setSpawnPortal(store, slug);
  }, [store]);

  const onEntered = useCallback(
    (transition: Transition) => {
      rememberReturnPortal(transition.slug);
      router.push(`/projects/${transition.slug}`);
    },
    [router],
  );
  const onArrived = useCallback(() => finishArrival(store), [store]);

  return (
    <LabStage
      theme={theme}
      capability={capability}
      scene={
        <RoamScene
          quality={qualityPresets[quality]}
          onDegrade={degradeQuality}
          effects={effects}
          theme={theme}
          inputRef={input}
          store={store}
          progress={progress}
          radarRef={radarRef}
        />
      }
      {...bind}
    >
      <ArcadeHud
        theme={theme}
        onThemeChange={setTheme}
        quality={quality}
        onQualityChange={setQuality}
        effects={effects}
        onEffectsChange={patchEffects}
        mode="roam"
        progress={progress}
        gauge={<ShieldBar shield={game.health} shieldMax={game.healthMax} label="hull" />}
        tracker={<Radar radarRef={radarRef} {...RADAR_INK[theme]} />}
        weapon={<WeaponReadout weapon={game.weapon} color={labLighting[theme].statusColors[weapons[game.weapon].color]} />}
        readout={[
          { label: "score", value: String(game.score) },
          { label: "explored", value: `${explored} / ${projects.length}` },
        ]}
        hint={HINT[capability?.touchOnly ? "touch" : "keys"]}
        center={game.phase === "dead" && <RoamCallout eyebrow="ship lost" title="Respawning…" />}
        controls={(hidden) => <TuningPanel hidden={hidden} />}
      />
      <PortalTransition transition={game.transition} onDone={onEntered} />
      <PortalTransition transition={game.arrival} direction="arrive" onDone={onArrived} />
    </LabStage>
  );
}
