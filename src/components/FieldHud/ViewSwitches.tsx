import { QualitySwitch, ThemeSwitch } from "@components/LabSwitches";
import { PillGroup, type PillOption } from "@components/PillGroup";
import type { FieldViewOptions, LabTheme, NameplateMode, QualityId } from "@data/lab";

type ViewSwitchesProps = {
  theme: LabTheme;
  onThemeChange: (theme: LabTheme) => void;
  quality: QualityId;
  onQualityChange: (quality: QualityId) => void;
  view: FieldViewOptions;
  onViewChange: (patch: Partial<FieldViewOptions>) => void;
  /** Whether the active variant draws tether lines at all. */
  hasTethers: boolean;
};

const NAMEPLATE_OPTIONS: PillOption<NameplateMode>[] = [
  { value: "always", label: "Always" },
  { value: "hover", label: "Hover" },
  { value: "off", label: "Off" },
];

const LINE_OPTIONS: PillOption<"on" | "off">[] = [
  { value: "on", label: "On" },
  { value: "off", label: "Off" },
];

/** Visitor-facing toggles: theme, quality, nameplates, tether lines. */
export function ViewSwitches({
  theme,
  onThemeChange,
  quality,
  onQualityChange,
  view,
  onViewChange,
  hasTethers,
}: ViewSwitchesProps) {
  return (
    <>
      <ThemeSwitch value={theme} onChange={onThemeChange} />
      <QualitySwitch value={quality} onChange={onQualityChange} />
      <PillGroup
        label="Names"
        options={NAMEPLATE_OPTIONS}
        value={view.nameplates}
        onChange={(nameplates) => onViewChange({ nameplates })}
      />
      {hasTethers && (
        <PillGroup
          label="Lines"
          options={LINE_OPTIONS}
          value={view.tetherLines ? "on" : "off"}
          onChange={(value) => onViewChange({ tetherLines: value === "on" })}
        />
      )}
    </>
  );
}
