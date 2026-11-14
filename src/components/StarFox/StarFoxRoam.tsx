"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { TuningPanel } from "@components/LabScene";
import { STARFOX_ROAM_ID, starFoxRoamConfig, weapons, type LabTheme } from "@data/lab";
import { projects } from "@data/projects";
import { useLabViewState } from "@hooks/useLabViewState";
import { useStore } from "@hooks/useStore";
import { cx } from "@utils/cx";

import { useInput } from "./hooks/useInput";
import { useProgress } from "./progress";
import { PortalTransition } from "./roam/PortalTransition";
import { createRadarFrame } from "./roam/radarFrame";
import { Radar } from "./roam/Radar";
import { consumeReturnPortal, rememberReturnPortal } from "./roam/returnPortal";
import { RoamCallout } from "./roam/RoamCallout";
import { createRoamStore, finishArrival, setSpawnPortal, type PortalTransition as Transition } from "./roam/roamStore";
import { ShieldBar } from "./ShieldBar";
import styles from "./StarFox.module.scss";
import { StarFoxHud } from "./StarFoxHud";

const RoamScene = dynamic(() => import("./roam/RoamScene"), {
  ssr: false,
  loading: () => <p className={styles.starFox__loading}>spooling up the Arwing…</p>,
});

/** Radar covers this much of the arena around the ship. */
const RADAR_RANGE = starFoxRoamConfig.arena.radius * 0.6;

const HINT =
  "WASD / arrows to steer · shift boost · ctrl / X brake · space fires · double-tap A/D to barrel roll · rings open projects · grab pickups for weapons and repairs";

/** Mirrors the LabHud --hud-ink / --hud-muted values so the radar canvas matches the chrome. */
const RADAR_INK: Record<LabTheme, { ink: string; muted: string }> = {
  dark: { ink: "#f2f2f0", muted: "#8a8a92" },
  light: { ink: "#0c0c0e", muted: "#5a5a64" },
};

type StarFoxRoamProps = {
  initialTheme?: LabTheme;
};

/** Full-viewport free-roam arena for `/lab/starfox/roam`. Portals hand off to the project pages. */
export function StarFoxRoam({ initialTheme }: StarFoxRoamProps) {
  const router = useRouter();
  const { theme, setTheme } = useLabViewState({ variantId: STARFOX_ROAM_ID, initialTheme });
  const { input, bind } = useInput();
  const progress = useProgress();
  const [store] = useState(() => createRoamStore(starFoxRoamConfig.hull.healthMax));
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
    <div className={cx(styles.starFox, styles[`starFox--${theme}`])} {...bind}>
      <div className={styles.starFox__canvas}>
        <RoamScene theme={theme} inputRef={input} store={store} progress={progress} radarRef={radarRef} />
      </div>
      <StarFoxHud
        theme={theme}
        onThemeChange={setTheme}
        mode="roam"
        progress={progress}
        readout={[
          { label: "score", value: String(game.score) },
          { label: "kills", value: String(game.kills) },
          { label: "portals", value: String(game.portals) },
          { label: "explored", value: `${explored} / ${projects.length}` },
          { label: "weapon", value: weapons[game.weapon].title },
        ]}
        gauge={
          <>
            <ShieldBar shield={game.health} shieldMax={game.healthMax} label="hull" />
            <Radar radarRef={radarRef} {...RADAR_INK[theme]} />
          </>
        }
        hint={HINT}
        center={game.phase === "dead" && <RoamCallout eyebrow="ship lost" title="Respawning…" />}
        controls={<TuningPanel />}
      />
      <PortalTransition transition={game.transition} onDone={onEntered} />
      <PortalTransition transition={game.arrival} direction="arrive" onDone={onArrived} />
    </div>
  );
}
