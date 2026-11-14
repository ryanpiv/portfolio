"use client";

import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type RefObject } from "react";

export type InputState = {
  /** Steering axes in [-1, 1]; +x right, +y up. */
  x: number;
  y: number;
  fire: boolean;
};

export type InputRef = RefObject<InputState>;

const KEY_AXES: Record<string, Partial<Pick<InputState, "x" | "y">>> = {
  ArrowLeft: { x: -1 },
  KeyA: { x: -1 },
  ArrowRight: { x: 1 },
  KeyD: { x: 1 },
  ArrowUp: { y: 1 },
  KeyW: { y: 1 },
  ArrowDown: { y: -1 },
  KeyS: { y: -1 },
};

const FIRE_KEYS = new Set(["Space", "KeyJ"]);

/** Pointer travel (as a fraction of the stage) that maps to full deflection. */
const POINTER_RANGE = 0.35;

function clamp1(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

/**
 * Keyboard + pointer steering, written into a ref so the render loop can
 * read it without re-rendering React. Keys win while pressed; otherwise a
 * held pointer steers toward where it sits relative to the stage center.
 */
export function useInput() {
  const input = useRef<InputState>({ x: 0, y: 0, fire: false });
  const keys = useRef(new Set<string>());
  const pointer = useRef<{ x: number; y: number } | null>(null);

  const recompute = () => {
    let x = 0;
    let y = 0;
    for (const code of keys.current) {
      const axis = KEY_AXES[code];
      if (axis?.x) x += axis.x;
      if (axis?.y) y += axis.y;
    }
    if (x === 0 && y === 0 && pointer.current) {
      x = pointer.current.x;
      y = pointer.current.y;
    }
    input.current.x = clamp1(x);
    input.current.y = clamp1(y);
    input.current.fire = [...keys.current].some((code) => FIRE_KEYS.has(code));
  };

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (!(event.code in KEY_AXES) && !FIRE_KEYS.has(event.code)) return;
      event.preventDefault();
      keys.current.add(event.code);
      recompute();
    };
    const up = (event: KeyboardEvent) => {
      keys.current.delete(event.code);
      recompute();
    };
    const blur = () => {
      keys.current.clear();
      pointer.current = null;
      recompute();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  });

  const readPointer = (event: ReactPointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = ((event.clientX - rect.left) / rect.width - 0.5) / POINTER_RANGE;
    const ny = -((event.clientY - rect.top) / rect.height - 0.5) / POINTER_RANGE;
    pointer.current = { x: clamp1(nx), y: clamp1(ny) };
    recompute();
  };

  const releasePointer = () => {
    pointer.current = null;
    recompute();
  };

  /** Spread onto the stage element. */
  const bind = {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      readPointer(event);
    },
    onPointerMove: (event: ReactPointerEvent<HTMLElement>) => {
      if (pointer.current) readPointer(event);
    },
    onPointerUp: releasePointer,
    onPointerCancel: releasePointer,
  };

  return { input, bind };
}
