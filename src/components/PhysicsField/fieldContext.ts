import { createContext, useContext, type RefObject } from "react";
import type { RapierRigidBody } from "@react-three/rapier";

import type {
  FieldConstraint,
  FieldViewOptions,
  LightingPreset,
  PhysicsPreset,
} from "@data/lab";

/** Live settings for the scene: variant preset + Leva overrides + HUD view options. */
export type FieldSettings = {
  constraint: FieldConstraint;
  physics: PhysicsPreset;
  lighting: LightingPreset;
  /** Half-depth of the play volume along the camera axis. */
  halfDepth: number;
  view: FieldViewOptions;
};

/** Rigid-body refs by project slug, for constraints that act on every body. */
export type BodyRegistry = Map<string, RefObject<RapierRigidBody>>;

/** Hover/drag/select plumbing shared between the DOM shell and the scene. */
export type FieldInteraction = {
  hovered: string | null;
  dragging: string | null;
  setHovered: (slug: string | null) => void;
  setDragging: (slug: string | null) => void;
  onSelect: (slug: string) => void;
};

export type FieldContextValue = FieldInteraction & {
  settings: FieldSettings;
  bodies: BodyRegistry;
};

export const FieldContext = createContext<FieldContextValue | null>(null);

export function useField(): FieldContextValue {
  const value = useContext(FieldContext);
  if (!value) {
    throw new Error("useField must be used inside <FieldContext.Provider>");
  }
  return value;
}
