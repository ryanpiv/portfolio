import type { ReactNode } from "react";

import { LabHud } from "@components/LabHud";
import { PillNav } from "@components/PillGroup";
import { StatusLegend } from "@components/StatusLegend";
import { labLighting, type FieldViewOptions, type LabTheme, type LabVariant } from "@data/lab";
import type { Project } from "@data/projects";
import { buildLabUrl } from "@utils/labUrl";

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

/** HUD for the physics field: variant switcher, theme, view options, hover card, legend. */
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
    <LabHud
      theme={theme}
      eyebrow="Lab · physics field"
      title={variant.title}
      tagline={variant.tagline}
      switches={
        <>
          <PillNav label="Variants" items={variantLinks} />
          <ViewSwitches
            theme={theme}
            onThemeChange={onThemeChange}
            view={view}
            onViewChange={onViewChange}
            hasTethers={variant.constraint.kind === "tether"}
          />
        </>
      }
      controls={controls}
      footer={
        <>
          <HoverCard project={hovered} dragging={dragging} />
          <StatusLegend colors={labLighting[theme].statusColors} />
        </>
      }
    />
  );
}
