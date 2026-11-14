"use client";

import dynamic from "next/dynamic";

import { TuningPanel } from "@components/LabScene";
import { STARFOX_ID, type LabTheme } from "@data/lab";
import { useLabViewState } from "@hooks/useLabViewState";
import { cx } from "@utils/cx";

import { useInput } from "./hooks/useInput";
import styles from "./StarFox.module.scss";
import { StarFoxHud } from "./StarFoxHud";

const StarFoxScene = dynamic(() => import("./StarFoxScene"), {
  ssr: false,
  loading: () => <p className={styles.starFox__loading}>spooling up the Arwing…</p>,
});

type StarFoxProps = {
  initialTheme?: LabTheme;
};

/** Full-viewport rail shooter for `/lab/starfox`. Owns input and theme; the scene is client-only. */
export function StarFox({ initialTheme }: StarFoxProps) {
  const { theme, setTheme } = useLabViewState({ variantId: STARFOX_ID, initialTheme });
  const { input, bind } = useInput();

  return (
    <div className={cx(styles.starFox, styles[`starFox--${theme}`])} {...bind}>
      <div className={styles.starFox__canvas}>
        <StarFoxScene theme={theme} input={input} />
      </div>
      <StarFoxHud theme={theme} onThemeChange={setTheme} controls={<TuningPanel />} />
    </div>
  );
}
