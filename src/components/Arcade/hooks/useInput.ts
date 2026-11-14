"use client";

import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type RefObject } from "react";

import type { RollDirection } from "../game/barrelRoll";

export type InputState = {
  /** Steering axes in [-1, 1]; +x right, +y up. */
  x: number;
  y: number;
  fire: boolean;
  /** +1 boost, −1 brake (free roam). */
  throttle: -1 | 0 | 1;
  /** One-shot barrel-roll request; the ship zeroes it once consumed. */
  roll: RollDirection | 0;
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
const BOOST_KEYS = new Set(["ShiftLeft", "ShiftRight"]);
const BRAKE_KEYS = new Set(["ControlLeft", "ControlRight", "KeyX"]);
/** Dedicated roll keys; double-tapping a lateral steer key rolls that way too. */
const ROLL_KEYS: Record<string, RollDirection> = { KeyQ: -1, KeyE: 1 };
/** Two presses of the same lateral key within this window count as a double-tap. */
export const DOUBLE_TAP_MS = 260;

/** Pointer travel (as a fraction of the stage) that maps to full deflection. */
const POINTER_RANGE = 0.35;

function clamp1(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

function isHandled(code: string): boolean {
  return code in KEY_AXES || FIRE_KEYS.has(code) || BOOST_KEYS.has(code) || BRAKE_KEYS.has(code) || code in ROLL_KEYS;
}

/**
 * Keyboard + pointer input, written into a ref so the render loop can read
 * it without re-rendering React. Keys win while pressed; otherwise a held
 * pointer steers toward where it sits relative to the stage center. Holding
 * the pointer also fires, so touch gets a one-finger control scheme.
 */
export function useInput() {
  const input = useRef<InputState>({ x: 0, y: 0, fire: false, throttle: 0, roll: 0 });
  const keys = useRef(new Set<string>());
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const lastTap = useRef<{ code: string; time: number } | null>(null);

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
    const held = [...keys.current];
    input.current.x = clamp1(x);
    input.current.y = clamp1(y);
    input.current.fire = pointer.current !== null || held.some((code) => FIRE_KEYS.has(code));
    const boost = held.some((code) => BOOST_KEYS.has(code));
    const brake = held.some((code) => BRAKE_KEYS.has(code));
    input.current.throttle = boost === brake ? 0 : boost ? 1 : -1;
  };

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (!isHandled(event.code)) return;
      event.preventDefault();
      if (event.repeat) return;

      if (event.code in ROLL_KEYS) input.current.roll = ROLL_KEYS[event.code];
      const lateral = KEY_AXES[event.code]?.x;
      if (lateral) {
        const now = event.timeStamp;
        const last = lastTap.current;
        if (last?.code === event.code && now - last.time < DOUBLE_TAP_MS) {
          input.current.roll = lateral as RollDirection;
          lastTap.current = null;
        } else {
          lastTap.current = { code: event.code, time: now };
        }
      }

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
