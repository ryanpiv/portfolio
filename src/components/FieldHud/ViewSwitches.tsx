import { PillGroup, type PillOption } from "@components/PillGroup";
import type { FieldViewOptions, NameplateMode } from "@data/lab";

type ViewSwitchesProps = {
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

/** Field-only view toggles: nameplates and tether lines. */
export function ViewSwitches({ view, onViewChange, hasTethers }: ViewSwitchesProps) {
  return (
    <>
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
