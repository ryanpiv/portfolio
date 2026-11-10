"use client";

import { useMemo, useRef, useState } from "react";
import type { RapierRigidBody } from "@react-three/rapier";

import type { Project } from "@data/projects";
import { layoutField } from "@utils/fieldLayout";

import { ProjectSphere } from "./bodies/ProjectSphere";
import { Constraints } from "./constraints/Constraints";
import { FieldContext, type BodyRegistry, type FieldInteraction, type FieldSettings } from "./fieldContext";
import { useFieldBounds } from "./hooks/useFieldBounds";
import { FieldEffects } from "./scene/FieldEffects";
import { FieldLighting } from "./scene/FieldLighting";

type FieldWorldProps = {
  projects: Project[];
  settings: FieldSettings;
  /** Bump to re-layout the field. */
  seed: number;
  interaction: FieldInteraction;
};

/** Keep the initial layout inside the frame with room to drift. */
const LAYOUT_INSET = 0.85;

/** Everything inside `<Physics>`: lighting, constraints, bodies, post effects. */
export function FieldWorld({ projects, settings, seed, interaction }: FieldWorldProps) {
  const [bodies] = useState<BodyRegistry>(() => new Map());
  const coreRef = useRef<RapierRigidBody>(null!);
  const bounds = useFieldBounds(settings.halfDepth);
  const { constraint } = settings;

  const layout = useMemo(
    () =>
      layoutField(projects, {
        seed,
        bounds: {
          halfWidth: bounds.halfWidth * LAYOUT_INSET,
          halfHeight: bounds.halfHeight * LAYOUT_INSET,
          halfDepth: bounds.halfDepth,
        },
        speed: settings.physics.initialSpeed,
      }),
    // Only re-layout on explicit reset or viewport change, not on every tweak.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projects, seed, bounds],
  );

  const { hovered, dragging, setHovered, setDragging, onSelect } = interaction;
  const context = useMemo(
    () => ({ settings, bodies, hovered, dragging, setHovered, setDragging, onSelect }),
    [settings, bodies, hovered, dragging, setHovered, setDragging, onSelect],
  );

  return (
    <FieldContext.Provider value={context}>
      <FieldLighting lighting={settings.lighting} />
      <Constraints constraint={constraint} bounds={bounds} coreRef={coreRef} />

      <group key={`${seed}-${constraint.kind}`}>
        {projects.map((project, index) => (
          <ProjectSphere
            key={project.slug}
            project={project}
            body={layout[index]}
            coreRef={constraint.kind === "tether" ? coreRef : undefined}
          />
        ))}
      </group>

      <FieldEffects lighting={settings.lighting} />
    </FieldContext.Provider>
  );
}
