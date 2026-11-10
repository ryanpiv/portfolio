"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { defaultViewOptions, type FieldViewOptions, type LabTheme } from "@data/lab";
import { useSystemTheme } from "@hooks/useSystemTheme";
import { buildLabUrl } from "@utils/labUrl";

type UseLabViewStateArgs = {
  variantId: string;
  /** From `?theme=`; when absent the system preference decides. */
  initialTheme?: LabTheme;
  /** From `?names=` / `?lines=`. */
  initialView?: FieldViewOptions;
};

/**
 * Visitor-facing lab state (theme + view options). Every change is mirrored
 * into the URL with `router.replace` so it survives variant switches and can
 * be shared as a link.
 */
export function useLabViewState({
  variantId,
  initialTheme,
  initialView = defaultViewOptions,
}: UseLabViewStateArgs) {
  const router = useRouter();
  const systemTheme = useSystemTheme();
  const [override, setOverride] = useState<LabTheme | undefined>(initialTheme);
  const [view, setView] = useState<FieldViewOptions>(initialView);
  const theme = override ?? systemTheme;

  const syncUrl = useCallback(
    (nextTheme: LabTheme | undefined, nextView: FieldViewOptions) => {
      router.replace(buildLabUrl(variantId, { theme: nextTheme, view: nextView }), {
        scroll: false,
      });
    },
    [router, variantId],
  );

  const setTheme = useCallback(
    (next: LabTheme) => {
      setOverride(next);
      syncUrl(next, view);
    },
    [syncUrl, view],
  );

  const patchView = useCallback(
    (patch: Partial<FieldViewOptions>) => {
      const next = { ...view, ...patch };
      setView(next);
      syncUrl(override, next);
    },
    [syncUrl, view, override],
  );

  return { theme, setTheme, view, patchView };
}
