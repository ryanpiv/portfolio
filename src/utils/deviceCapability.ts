import type { QualityId } from "@data/lab";

/** What this device can comfortably do, as far as a browser will tell us. */
export type DeviceCapability = {
  /** A WebGL context could be created. Without it the lab scenes cannot run. */
  webgl: boolean;
  /** Primary input is a coarse pointer with no hover: phones and tablets. */
  touchOnly: boolean;
  reducedMotion: boolean;
  /** Few cores, little memory, or a data-saver request: assume a weak GPU too. */
  lowPower: boolean;
};

/** The subset of `navigator` the heuristics read; typed loosely because the memory fields are non-standard. */
type NavigatorHints = {
  hardwareConcurrency?: number;
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

/** The subset of `window` the detector needs, so tests can hand in a fake. */
export type CapabilityEnvironment = {
  matchMedia: (query: string) => { matches: boolean };
  navigator: NavigatorHints;
  createCanvas: () => { getContext: (id: string) => unknown } | null;
};

/** At or below this many logical cores the device counts as low-power. */
const LOW_POWER_CORES = 4;
/** At or below this many GiB (per `navigator.deviceMemory`) the device counts as low-power. */
const LOW_POWER_MEMORY_GB = 4;

/** The capability every device is assumed to have until it is actually probed. */
export const optimisticCapability: DeviceCapability = {
  webgl: true,
  touchOnly: false,
  reducedMotion: false,
  lowPower: false,
};

/** Try WebGL2 then WebGL1; a thrown or null context means no WebGL. */
export function probeWebgl(createCanvas: CapabilityEnvironment["createCanvas"]): boolean {
  try {
    const canvas = createCanvas();
    if (!canvas) return false;
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function detectDeviceCapability(env: CapabilityEnvironment): DeviceCapability {
  const { hardwareConcurrency, deviceMemory, connection } = env.navigator;
  const lowPower =
    (hardwareConcurrency !== undefined && hardwareConcurrency <= LOW_POWER_CORES) ||
    (deviceMemory !== undefined && deviceMemory <= LOW_POWER_MEMORY_GB) ||
    connection?.saveData === true;

  return {
    webgl: probeWebgl(env.createCanvas),
    touchOnly: env.matchMedia("(pointer: coarse)").matches && env.matchMedia("(hover: none)").matches,
    reducedMotion: env.matchMedia("(prefers-reduced-motion: reduce)").matches,
    lowPower,
  };
}

/** Adapt the real `window` to the detector's environment. */
export function browserEnvironment(win: Window): CapabilityEnvironment {
  return {
    matchMedia: (query) => win.matchMedia(query),
    navigator: win.navigator as unknown as NavigatorHints,
    createCanvas: () => win.document.createElement("canvas"),
  };
}

/** Starting render tier for a device; the canvas may still step down from here. */
export function suggestQuality(capability: DeviceCapability): QualityId {
  if (capability.lowPower) return "low";
  if (capability.touchOnly) return "balanced";
  return "high";
}

/**
 * Plain-language reasons the classic (non-WebGL) way in suits this device
 * better. Empty when the arcade should run fine.
 */
export function classicReasons(capability: DeviceCapability): string[] {
  const reasons: string[] = [];
  if (!capability.webgl) reasons.push("this browser has no WebGL");
  if (capability.touchOnly) reasons.push("the arcade wants a keyboard");
  if (capability.lowPower) reasons.push("this device looks low-power");
  if (capability.reducedMotion) reasons.push("you prefer reduced motion");
  return reasons;
}
