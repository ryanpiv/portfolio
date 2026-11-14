"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import {
  defaultViewOptions,
  stepQualityDown,
  type EffectSettings,
  type FieldViewOptions,
  type LabTheme,
  type QualityId,
} from "@data/lab";
import { useDeviceCapability } from "@hooks/useDeviceCapability";
import { useLabSettings } from "@hooks/useLabSettings";
import { useSystemTheme } from "@hooks/useSystemTheme";
import { optimisticCapability, suggestQuality } from "@utils/deviceCapability";
import { buildLabUrl, type LabQuery } from "@utils/labUrl";

type UseLabViewStateArgs = {
  variantId: string;
  /** From `?theme=`; when absent the remembered pick, then the system preference, decides. */
  initialTheme?: LabTheme;
  /** From `?quality=`; when absent the remembered pick, then the device, decides. */
  initialQuality?: QualityId;
  /** From `?names=` / `?lines=`. */
  initialView?: FieldViewOptions;
};

/**
 * Visitor-facing lab state: theme, render quality, effect toggles, view
 * options. Theme and quality precedence is URL → remembered setting →
 * system / device suggestion; picks are remembered in the settings store
 * and mirrored into the URL with `router.replace` so links can be shared.
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
  const { settings, patch, patchEffects } = useLabSettings();
  const [fromUrl, setFromUrl] = useState<{ theme?: LabTheme; quality?: QualityId }>({
    theme: initialTheme,
    quality: initialQuality,
  });
  const [view, setView] = useState<FieldViewOptions>(initialView);

  const theme = fromUrl.theme ?? settings.theme ?? systemTheme;
  const quality = fromUrl.quality ?? settings.quality ?? suggestQuality(capability ?? optimisticCapability);

  const syncUrl = useCallback(
    (next: LabQuery) => {
      router.replace(buildLabUrl(variantId, next), { scroll: false });
    },
    [router, variantId],
  );

  const setTheme = useCallback(
    (next: LabTheme) => {
      const picks = { ...fromUrl, theme: next };
      setFromUrl(picks);
      patch({ theme: next });
      syncUrl({ ...picks, view });
    },
    [syncUrl, view, fromUrl, patch],
  );

  const setQuality = useCallback(
    (next: QualityId) => {
      const picks = { ...fromUrl, quality: next };
      setFromUrl(picks);
      patch({ quality: next });
      syncUrl({ ...picks, view });
    },
    [syncUrl, view, fromUrl, patch],
  );

  /** For the frame-rate monitor: one tier cheaper, remembered like a manual pick. */
  const degradeQuality = useCallback(() => setQuality(stepQualityDown(quality)), [quality, setQuality]);

  const patchView = useCallback(
    (next: Partial<FieldViewOptions>) => {
      const merged = { ...view, ...next };
      setView(merged);
      syncUrl({ ...fromUrl, view: merged });
    },
    [syncUrl, view, fromUrl],
  );

  const effects: EffectSettings = settings.effects;

  return { theme, setTheme, quality, setQuality, degradeQuality, effects, patchEffects, view, patchView, capability };
}
