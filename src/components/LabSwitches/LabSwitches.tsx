import { PillGroup, type PillOption } from "@components/PillGroup";
import { LAB_THEMES, QUALITY_ORDER, qualityPresets, type LabTheme, type QualityId } from "@data/lab";

const THEME_OPTIONS: PillOption<LabTheme>[] = LAB_THEMES.map((theme) => ({ value: theme, label: theme }));

const QUALITY_OPTIONS: PillOption<QualityId>[] = QUALITY_ORDER.map((id) => ({
  value: id,
  label: qualityPresets[id].label,
}));

type ThemeSwitchProps = {
  value: LabTheme;
  onChange: (theme: LabTheme) => void;
};

/** Dark / light lighting preset. */
export function ThemeSwitch({ value, onChange }: ThemeSwitchProps) {
  return <PillGroup label="Theme" options={THEME_OPTIONS} value={value} onChange={onChange} />;
}

type QualitySwitchProps = {
  value: QualityId;
  onChange: (quality: QualityId) => void;
};

/** Render tier: how much the canvas may spend. */
export function QualitySwitch({ value, onChange }: QualitySwitchProps) {
  return <PillGroup label="Quality" options={QUALITY_OPTIONS} value={value} onChange={onChange} />;
}
