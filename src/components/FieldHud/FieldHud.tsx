import type { ReactNode } from "react";

import { LabHud } from "@components/LabHud";
import { LabSettingsMenu, SettingsSection } from "@components/LabSettings";
import { PillNav } from "@components/PillGroup";
import { StatusLegend } from "@components/StatusLegend";
import {
  labLighting,
  type EffectSettings,
  type FieldViewOptions,
  type LabTheme,
  type LabVariant,
  type QualityId,
} from "@data/lab";
import type { Project } from "@data/projects";
import { buildLabUrl } from "@utils/labUrl";

import { HoverCard } from "./HoverCard";
import { ViewSwitches } from "./ViewSwitches";

type FieldHudProps = {
  variant: LabVariant;
  variants: LabVariant[];
  theme: LabTheme;
  onThemeChange: (theme: LabTheme) => void;
  quality: QualityId;
  onQualityChange: (quality: QualityId) => void;
  effects: EffectSettings;
  onEffectsChange: (patch: Partial<EffectSettings>) => void;
  view: FieldViewOptions;
  onViewChange: (patch: Partial<FieldViewOptions>) => void;
  hovered: Project | null;
  dragging: boolean;
  /** Leva host; the settings menu owns its visibility. */
  controls?: (hidden: boolean) => ReactNode;
};

/** HUD for the physics field: title, hover card, legend; variants and every switch behind the gear. */
export function FieldHud({
  variant,
  variants,
  theme,
  onThemeChange,
  quality,
  onQualityChange,
  effects,
  onEffectsChange,
  view,
  onViewChange,
  hovered,
  dragging,
  controls,
}: FieldHudProps) {
  const variantLinks = variants.map((item) => ({
    href: buildLabUrl(item.id, { theme, quality, view }),
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
        <LabSettingsMenu
          theme={theme}
          onThemeChange={onThemeChange}
          quality={quality}
          onQualityChange={onQualityChange}
          effects={effects}
          onEffectsChange={onEffectsChange}
          scope="field"
          tuning={controls}
        >
          <SettingsSection title="Variant">
            <PillNav label="Variants" items={variantLinks} />
          </SettingsSection>
          <SettingsSection title="View">
            <ViewSwitches view={view} onViewChange={onViewChange} hasTethers={variant.constraint.kind === "tether"} />
          </SettingsSection>
        </LabSettingsMenu>
      }
      footer={
        <>
          <HoverCard project={hovered} dragging={dragging} />
          <StatusLegend colors={labLighting[theme].statusColors} />
        </>
      }
    />
  );
}
