import { weapons, type WeaponId } from "@data/lab";

import styles from "./WeaponReadout.module.scss";

type WeaponReadoutProps = {
  weapon: WeaponId;
  /** Status color the HUD uses for this weapon. */
  color: string;
};

/** Bottom-right weapon line: name in the weapon's color, with its damage and bolt count. */
export function WeaponReadout({ weapon, color }: WeaponReadoutProps) {
  const spec = weapons[weapon];
  return (
    <div className={styles.weapon} style={{ "--weapon-color": color } as React.CSSProperties}>
      <span className={styles.weapon__label}>weapon</span>
      <span className={styles.weapon__name}>{spec.title}</span>
      <span className={styles.weapon__spec}>
        {spec.damage} dmg · {spec.bolts === 1 ? "single" : `${spec.bolts} bolts`}
        {spec.heavy ? " · breaks towers" : ""}
      </span>
    </div>
  );
}
