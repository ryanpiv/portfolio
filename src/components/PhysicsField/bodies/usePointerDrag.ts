"use client";

import { useRef } from "react";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";

/** Screen-space movement (px) below which a press counts as a click. */
const CLICK_SLOP_PX = 6;

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  moved: boolean;
  /** Camera-facing plane through the body at press time. */
  plane: THREE.Plane;
  /** Body position minus the hit point, so the grab point stays under the cursor. */
  offset: THREE.Vector3;
  /** Where the body should be pulled to this frame. */
  target: THREE.Vector3;
};

type UsePointerDragArgs = {
  bodyRef: React.RefObject<RapierRigidBody>;
  onDragStart: () => void;
  onDragEnd: () => void;
  /** Fired on release when the pointer never left the click slop. */
  onClick: () => void;
};

const tmpHit = new THREE.Vector3();

/**
 * Pointer-capture drag on a rigid body. Only tracks the *target* position;
 * `useBodyMotion` turns it into velocity each frame so collisions keep
 * working mid-drag.
 */
export function usePointerDrag({ bodyRef, onDragStart, onDragEnd, onClick }: UsePointerDragArgs) {
  const camera = useThree((state) => state.camera);
  const drag = useRef<DragState | null>(null);

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    (event.target as Element | null)?.setPointerCapture?.(event.pointerId);

    const position = bodyRef.current!.translation();
    const bodyPos = new THREE.Vector3(position.x, position.y, position.z);
    const normal = camera.getWorldDirection(new THREE.Vector3()).negate();
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, bodyPos);
    const hit = event.ray.intersectPlane(plane, new THREE.Vector3()) ?? bodyPos;

    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      plane,
      offset: bodyPos.clone().sub(hit),
      target: bodyPos.clone(),
    };
    bodyRef.current!.wakeUp();
    onDragStart();
  };

  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    const state = drag.current;
    if (!state || state.pointerId !== event.pointerId) return;
    event.stopPropagation();
    const hit = event.ray.intersectPlane(state.plane, tmpHit);
    if (hit) state.target.copy(hit).add(state.offset);
    if (!state.moved) {
      const travelled = Math.hypot(event.clientX - state.startX, event.clientY - state.startY);
      state.moved = travelled > CLICK_SLOP_PX;
    }
  };

  const onPointerUp = (event: ThreeEvent<PointerEvent>) => {
    const state = drag.current;
    if (!state || state.pointerId !== event.pointerId) return;
    event.stopPropagation();
    (event.target as Element | null)?.releasePointerCapture?.(event.pointerId);
    drag.current = null;
    onDragEnd();
    if (!state.moved) onClick();
  };

  return {
    /** Current drag target, or null when idle. Read inside `useFrame`. */
    dragTarget: () => drag.current?.target ?? null,
    isDragging: () => drag.current !== null,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  };
}
