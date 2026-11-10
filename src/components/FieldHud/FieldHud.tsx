import type { ReactNode } from "react";

import { PillNav } from "@components/PillGroup";
import { StatusLegend } from "@components/StatusLegend";
import { labLighting, type FieldViewOptions, type LabTheme, type LabVariant } from "@data/lab";
import type { Project } from "@data/projects";
import { cx } from "@utils/cx";
import { buildLabUrl } from "@utils/labUrl";

import styles from "./FieldHud.module.scss";
import { HoverCard } from "./HoverCard";
import { ViewSwitches } from "./ViewSwitches";

type FieldHudProps = {
  variant: LabVariant;
  variants: LabVariant[];
  theme: LabTheme;
  onThemeChange: (theme: LabTheme) => void;
  view: FieldViewOptions;
  onViewChange: (patch: Partial<FieldViewOptions>) => void;
  hovered: Project | null;
  dragging: boolean;
  /** Slot for the tuning panel (Leva). */
  controls?: ReactNode;
};

/** DOM overlay for the physics field: variant switcher, theme, view options, hover card, legend. */
export function FieldHud({
  variant,
  variants,
  theme,
  onThemeChange,
  view,
  onViewChange,
  hovered,
  dragging,
  controls,
}: FieldHudProps) {
  const variantLinks = variants.map((item) => ({
    href: buildLabUrl(item.id, { theme, view }),
    label: item.title,
    active: item.id === variant.id,
  }));

  return (
    <div className={cx(styles.fieldHud, styles[`fieldHud--${theme}`])} data-theme={theme}>
      <header className={styles.fieldHud__top}>
        <div>
          <p className={styles.fieldHud__eyebrow}>Lab · physics field</p>
          <h1 className={styles.fieldHud__title}>{variant.title}</h1>
          <p className={styles.fieldHud__tagline}>{variant.tagline}</p>
        </div>

        <div className={styles.fieldHud__switches}>
          <PillNav label="Variants" items={variantLinks} />
          <ViewSwitches
            theme={theme}
            onThemeChange={onThemeChange}
            view={view}
            onViewChange={onViewChange}
            hasTethers={variant.constraint.kind === "tether"}
          />
        </div>
      </header>

      {controls && <div className={styles.fieldHud__controls}>{controls}</div>}

      <footer className={styles.fieldHud__bottom}>
        <HoverCard project={hovered} dragging={dragging} />
        <StatusLegend colors={labLighting[theme].statusColors} />
      </footer>
    </div>
  );
}
