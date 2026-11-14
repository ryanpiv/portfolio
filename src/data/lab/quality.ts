/**
 * Render-quality tiers for the WebGL lab scenes. Each tier is a complete
 * description of what the canvas may spend: device-pixel ratio, shadows,
 * and the post-processing pass. The HUD exposes the tier as a switch and
 * the canvas steps down a tier on its own when frames start dropping.
 */

export type QualityId = "low" | "balanced" | "high";

export type QualityPreset = {
  id: QualityId;
  label: string;
  /** `[min, max]` device-pixel ratio the canvas may render at. */
  dpr: [number, number];
  shadows: boolean;
  /** Bloom + lens flare. The single most expensive thing in these scenes. */
  effects: boolean;
  /** MSAA samples for the effect composer; ignored when effects are off. */
  multisampling: number;
};

/** Ordered cheapest to richest so stepping down is `index - 1`. */
export const QUALITY_ORDER: readonly QualityId[] = ["low", "balanced", "high"];

export const qualityPresets: Record<QualityId, QualityPreset> = {
  low: { id: "low", label: "low", dpr: [1, 1], shadows: false, effects: false, multisampling: 0 },
  balanced: { id: "balanced", label: "balanced", dpr: [1, 1.5], shadows: false, effects: true, multisampling: 0 },
  high: { id: "high", label: "high", dpr: [1, 2], shadows: true, effects: true, multisampling: 4 },
};

export function isQualityId(value: unknown): value is QualityId {
  return (QUALITY_ORDER as readonly unknown[]).includes(value);
}

/** The next cheaper tier, or the same one when already at the bottom. */
export function stepQualityDown(id: QualityId): QualityId {
  const index = QUALITY_ORDER.indexOf(id);
  return QUALITY_ORDER[Math.max(0, index - 1)];
}
