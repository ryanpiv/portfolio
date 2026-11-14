"use client";

import { useCallback, useRef } from "react";
import type * as THREE from "three";

export type RegisterGroup = (id: string, group: THREE.Group | null) => void;

/**
 * Id → mounted `THREE.Group` map for systems that render a list of entities
 * but move them from a frame loop. Pass `register` to each entity's ref
 * callback; read `groups.current` inside `useGameFrame`.
 */
export function useGroupRegistry() {
  const groups = useRef(new Map<string, THREE.Group>());
  const register = useCallback<RegisterGroup>((id, group) => {
    if (group) groups.current.set(id, group);
    else groups.current.delete(id);
  }, []);
  return { groups, register };
}
