"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { FieldHud } from "@components/FieldHud";
import { labVariants, type FieldViewOptions, type LabTheme, type LabVariant } from "@data/lab";
import type { Project } from "@data/projects";
import { cx } from "@utils/cx";

import { TuningPanel } from "@components/LabScene";
import { useLabViewState } from "@hooks/useLabViewState";
import styles from "./PhysicsField.module.scss";

const PhysicsFieldScene = dynamic(() => import("./PhysicsFieldScene"), {
  ssr: false,
  loading: () => <p className={styles.physicsField__loading}>warming up the field…</p>,
});

type PhysicsFieldProps = {
  projects: Project[];
  variant: LabVariant;
  initialTheme?: LabTheme;
  initialView?: FieldViewOptions;
};

function cursorFor(dragging: string | null, hovered: string | null): string {
  if (dragging) return "grabbing";
  if (hovered) return "grab";
  return "default";
}

/**
 * Full-viewport physics playground for `/lab/[variant]`. Owns DOM-side state
 * (theme, view options, hovered/dragging slug) and renders the HUD; the
 * WebGL scene is loaded client-only.
 */
export function PhysicsField({ projects, variant, initialTheme, initialView }: PhysicsFieldProps) {
  const router = useRouter();
  const { theme, setTheme, view, patchView } = useLabViewState({
    variantId: variant.id,
    initialTheme,
    initialView,
  });
  const [hovered, setHovered] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const handleSelect = useCallback((slug: string) => router.push(`/projects/${slug}`), [router]);

  const hoveredProject = useMemo(
    () => projects.find((project) => project.slug === hovered) ?? null,
    [projects, hovered],
  );

  return (
    <div
      className={cx(styles.physicsField, styles[`physicsField--${theme}`])}
      style={{ cursor: cursorFor(dragging, hovered) }}
    >
      <div className={styles.physicsField__canvas}>
        <PhysicsFieldScene
          projects={projects}
          variant={variant}
          theme={theme}
          view={view}
          hovered={hovered}
          dragging={dragging}
          setHovered={setHovered}
          setDragging={setDragging}
          onSelect={handleSelect}
        />
      </div>
      <FieldHud
        variant={variant}
        variants={labVariants}
        theme={theme}
        onThemeChange={setTheme}
        view={view}
        onViewChange={patchView}
        hovered={hoveredProject}
        dragging={dragging !== null}
        controls={<TuningPanel />}
      />
    </div>
  );
}
