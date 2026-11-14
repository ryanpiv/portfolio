"use client";

import { useSyncExternalStore } from "react";

import { browserEnvironment, detectDeviceCapability, type DeviceCapability } from "@utils/deviceCapability";

/** Probed once per page load; the answer does not change while the tab is open. */
let cached: DeviceCapability | null = null;

function getSnapshot(): DeviceCapability {
  cached ??= detectDeviceCapability(browserEnvironment(window));
  return cached;
}

const getServerSnapshot = (): DeviceCapability | null => null;

/** Nothing to subscribe to: the probe is static for the life of the page. */
const subscribe = () => () => {};

/**
 * What this device can do. `null` during SSR and hydration so markup
 * matches; callers fall back to `optimisticCapability` or wait.
 */
export function useDeviceCapability(): DeviceCapability | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
