import { PillGroup, type PillOption } from "@components/PillGroup";
import type { FieldViewOptions, LabTheme, NameplateMode } from "@data/lab";

type ViewSwitchesProps = {
  theme: LabTheme;
  onThemeChange: (theme: LabTheme) => void;
  view: FieldViewOptions;
  onViewChange: (patch: Partial<FieldViewOptions>) => void;
  /** Whether the active variant draws tether lines at all. */
  hasTethers: boolean;
};

const THEME_OPTIONS: PillOption<LabTheme>[] = [
  { value: "dark", label: "dark" },
  { value: "light", label: "light" },
];

const NAMEPLATE_OPTIONS: PillOption<NameplateMode>[] = [
  { value: "always", label: "Always" },
  { value: "hover", label: "Hover" },
  { value: "off", label: "Off" },
];

const LINE_OPTIONS: PillOption<"on" | "off">[] = [
  { value: "on", label: "On" },
  { value: "off", label: "Off" },
];

/** Visitor-facing toggles: theme, nameplates, tether lines. */
export function ViewSwitches({ theme, onThemeChange, view, onViewChange, hasTethers }: ViewSwitchesProps) {
  return (
    <>
      <PillGroup label="Theme" options={THEME_OPTIONS} value={theme} onChange={onThemeChange} />
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
