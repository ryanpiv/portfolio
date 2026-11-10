import type { FieldViewOptions, LabTheme, NameplateMode } from "./types";

export const defaultViewOptions: FieldViewOptions = {
  nameplates: "always",
  tetherLines: true,
};

export const LAB_THEMES: readonly LabTheme[] = ["dark", "light"];
export const NAMEPLATE_MODES: readonly NameplateMode[] = ["always", "hover", "off"];

export function isLabTheme(value: unknown): value is LabTheme {
  return (LAB_THEMES as readonly unknown[]).includes(value);
}

export function isNameplateMode(value: unknown): value is NameplateMode {
  return (NAMEPLATE_MODES as readonly unknown[]).includes(value);
}
