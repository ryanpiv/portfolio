/** Leva number-slider input spec. */
export function slider(value: number, min: number, max: number, step: number) {
  return { value, min, max, step };
}

export function num(value: unknown, fallback: number): number {
  return typeof value === "number" ? value : fallback;
}
