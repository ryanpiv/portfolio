import Link from "next/link";

import { cx } from "@utils/cx";

import styles from "./PillGroup.module.scss";

export type PillNavItem = {
  href: string;
  label: string;
  active: boolean;
};

type PillNavProps = {
  /** Accessible name for the `<nav>`. */
  label: string;
  items: ReadonlyArray<PillNavItem>;
};

/** Link flavour of `PillGroup`: same pill bar, `aria-current` on the active page. */
export function PillNav({ label, items }: PillNavProps) {
  return (
    <nav aria-label={label} className={cx(styles.pillGroup, styles.pillGroup__pills)}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cx(styles.pillGroup__pill, item.active && styles["pillGroup__pill--active"])}
          aria-current={item.active ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
