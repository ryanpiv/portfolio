import { cx } from "@utils/cx";

import styles from "./PillGroup.module.scss";

export type PillOption<T extends string> = {
  value: T;
  label: string;
};

type PillGroupProps<T extends string> = {
  /** Accessible group name; also rendered as a small leading label unless `hideLabel`. */
  label: string;
  options: ReadonlyArray<PillOption<T>>;
  value: T;
  onChange: (value: T) => void;
  hideLabel?: boolean;
};

/**
 * Segmented control: one pill per option, `aria-pressed` on the active one.
 * Colors come from `--pill-*` custom properties so a parent can retheme it.
 */
export function PillGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  hideLabel = false,
}: PillGroupProps<T>) {
  return (
    <div role="group" aria-label={label} className={styles.pillGroup}>
      {!hideLabel && <span className={styles.pillGroup__label}>{label}</span>}
      <div className={styles.pillGroup__pills}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={cx(styles.pillGroup__pill, option.value === value && styles["pillGroup__pill--active"])}
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
