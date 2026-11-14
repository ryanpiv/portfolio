import type { ReactNode } from "react";

import { LabHud, LabHudCard, LabHudHint } from "@components/LabHud";
import { PillGroup, type PillOption } from "@components/PillGroup";
import { starFoxMeta, type LabTheme } from "@data/lab";

type StarFoxHudProps = {
  theme: LabTheme;
  onThemeChange: (theme: LabTheme) => void;
  controls?: ReactNode;
};

const THEME_OPTIONS: PillOption<LabTheme>[] = [
  { value: "dark", label: "dark" },
  { value: "light", label: "light" },
];

export function StarFoxHud({ theme, onThemeChange, controls }: StarFoxHudProps) {
  return (
    <LabHud
      theme={theme}
      eyebrow="Lab · star fox"
      title={starFoxMeta.title}
      tagline={starFoxMeta.tagline}
      switches={<PillGroup label="Theme" options={THEME_OPTIONS} value={theme} onChange={onThemeChange} />}
      controls={controls}
      footer={
        <LabHudCard>
          <LabHudHint>WASD / arrows to steer · or hold the pointer and move it</LabHudHint>
          <LabHudHint>lasers and enemies arrive in the next pass</LabHudHint>
        </LabHudCard>
      }
    />
  );
}
