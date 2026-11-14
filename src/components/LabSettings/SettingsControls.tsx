import type { ReactNode } from "react";

import { cx } from "@utils/cx";

import styles from "./LabSettingsMenu.module.scss";

type SettingsSectionProps = {
  title: string;
  children: ReactNode;
};

/** A titled group of rows inside the settings panel. */
export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.section__title}>{title}</h2>
      <div className={styles.section__rows}>{children}</div>
    </section>
  );
}

type SettingsToggleProps = {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

/** Label on the left, switch on the right. */
export function SettingsToggle({ label, hint, checked, onChange }: SettingsToggleProps) {
  return (
    <label className={styles.toggle}>
      <span className={styles.toggle__text}>
        <span className={styles.toggle__label}>{label}</span>
        {hint && <span className={styles.toggle__hint}>{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={cx(styles.toggle__switch, checked && styles["toggle__switch--on"])}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.toggle__knob} />
      </button>
    </label>
  );
}
