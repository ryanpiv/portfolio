"use client";

import { SlantStage } from "@components/SlantStage";
import type { LandingChoice, LandingChoiceId } from "@data/landing";
import { useDeviceCapability } from "@hooks/useDeviceCapability";
import { classicReasons } from "@utils/deviceCapability";

import styles from "./Landing.module.scss";
import { LandingPanel } from "./LandingPanel";

type LandingProps = {
  choices: LandingChoice[];
};

/** Shear of the divider between the two ways in. */
const SLANT_DEG = 45;
/** How much wider the picked panel gets. */
const EXPAND = 2.4;

const DEFAULT_HINT = "hover to preview · click to choose";

/**
 * Homepage chooser: two slanted panels side by side, like a character-select
 * screen. Hovering (or focusing) one widens it and parts its curtain to show
 * the detail sheet; clicking goes to that way of browsing. Once the device
 * has been probed, the way that suits it gets a "recommended" mark and the
 * hint line says why.
 */
export function Landing({ choices }: LandingProps) {
  const capability = useDeviceCapability();
  const reasons = capability ? classicReasons(capability) : [];
  const recommended: LandingChoiceId | null = reasons.length > 0 ? "classic" : null;
  const hint = recommended ? `classic recommended here: ${reasons.join(", ")}` : DEFAULT_HINT;

  return (
    <section className={styles.landing} aria-label="Choose how to browse the projects">
      <SlantStage slant={SLANT_DEG} expand={EXPAND} height="var(--landing-height)" label="Ways in">
        {choices.map((choice, index) => (
          <LandingPanel
            key={choice.id}
            choice={choice}
            align={index === 0 ? "start" : "end"}
            recommended={choice.id === recommended}
          />
        ))}
      </SlantStage>
      <p className={styles.landing__hint}>{hint}</p>
    </section>
  );
}
