"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { FieldHud } from "@components/FieldHud";
import { TuningPanel } from "@components/LabScene";
import { LabStage, SceneLoading } from "@components/LabStage";
import { labVariants, qualityPresets, type FieldViewOptions, type LabTheme, type LabVariant, type QualityId } from "@data/lab";
import type { Project } from "@data/projects";
import { useLabViewState } from "@hooks/useLabViewState";

const PhysicsFieldScene = dynamic(() => import("./PhysicsFieldScene"), {
  ssr: false,
  loading: () => <SceneLoading>warming up the field…</SceneLoading>,
});

type PhysicsFieldProps = {
  projects: Project[];
  variant: LabVariant;
  initialTheme?: LabTheme;
  initialQuality?: QualityId;
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
export function PhysicsField({ projects, variant, initialTheme, initialQuality, initialView }: PhysicsFieldProps) {
  const router = useRouter();
  const { theme, setTheme, quality, setQuality, degradeQuality, view, patchView, capability } = useLabViewState({
    variantId: variant.id,
    initialTheme,
    initialQuality,
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
    <LabStage
      theme={theme}
      capability={capability}
      style={{ cursor: cursorFor(dragging, hovered) }}
      scene={
        <PhysicsFieldScene
          projects={projects}
          variant={variant}
          theme={theme}
          view={view}
          quality={qualityPresets[quality]}
          onDegrade={degradeQuality}
          hovered={hovered}
          dragging={dragging}
          setHovered={setHovered}
          setDragging={setDragging}
          onSelect={handleSelect}
        />
      }
    >
      <FieldHud
        variant={variant}
        variants={labVariants}
        theme={theme}
        onThemeChange={setTheme}
        quality={quality}
        onQualityChange={setQuality}
        view={view}
        onViewChange={patchView}
        hovered={hoveredProject}
        dragging={dragging !== null}
        controls={<TuningPanel />}
      />
    </LabStage>
  );
}
