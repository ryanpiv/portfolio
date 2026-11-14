"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { defaultViewOptions, stepQualityDown, type FieldViewOptions, type LabTheme, type QualityId } from "@data/lab";
import { useDeviceCapability } from "@hooks/useDeviceCapability";
import { useSystemTheme } from "@hooks/useSystemTheme";
import { optimisticCapability, suggestQuality } from "@utils/deviceCapability";
import { buildLabUrl, type LabQuery } from "@utils/labUrl";

type UseLabViewStateArgs = {
  variantId: string;
  /** From `?theme=`; when absent the system preference decides. */
  initialTheme?: LabTheme;
  /** From `?quality=`; when absent the device decides. */
  initialQuality?: QualityId;
  /** From `?names=` / `?lines=`. */
  initialView?: FieldViewOptions;
};

/**
 * Visitor-facing lab state (theme, render quality, view options). Every
 * change is mirrored into the URL with `router.replace` so it survives
 * variant switches and can be shared as a link. Quality defaults from the
 * device probe until the visitor (or the frame-rate monitor) picks one.
 */
export function useLabViewState({
  variantId,
  initialTheme,
  initialQuality,
  initialView = defaultViewOptions,
}: UseLabViewStateArgs) {
  const router = useRouter();
  const systemTheme = useSystemTheme();
  const capability = useDeviceCapability();
  const [overrides, setOverrides] = useState<{ theme?: LabTheme; quality?: QualityId }>({
    theme: initialTheme,
    quality: initialQuality,
  });
  const [view, setView] = useState<FieldViewOptions>(initialView);
  const theme = overrides.theme ?? systemTheme;
  const quality = overrides.quality ?? suggestQuality(capability ?? optimisticCapability);

  const syncUrl = useCallback(
    (next: LabQuery) => {
      router.replace(buildLabUrl(variantId, next), { scroll: false });
    },
    [router, variantId],
  );

  const setTheme = useCallback(
    (next: LabTheme) => {
      const nextOverrides = { ...overrides, theme: next };
      setOverrides(nextOverrides);
      syncUrl({ ...nextOverrides, view });
    },
    [syncUrl, view, overrides],
  );

  const setQuality = useCallback(
    (next: QualityId) => {
      const nextOverrides = { ...overrides, quality: next };
      setOverrides(nextOverrides);
      syncUrl({ ...nextOverrides, view });
    },
    [syncUrl, view, overrides],
  );

  /** For the frame-rate monitor: one tier cheaper, and remembered like a manual pick. */
  const degradeQuality = useCallback(() => setQuality(stepQualityDown(quality)), [quality, setQuality]);

  const patchView = useCallback(
    (patch: Partial<FieldViewOptions>) => {
      const next = { ...view, ...patch };
      setView(next);
      syncUrl({ ...overrides, view: next });
    },
    [syncUrl, view, overrides],
  );

  return { theme, setTheme, quality, setQuality, degradeQuality, view, patchView, capability };
}
