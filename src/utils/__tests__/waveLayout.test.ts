import { railWaves, type WaveSpec } from "@data/lab";
import { projects } from "@data/projects";

import { dealIntoWaves, formationOffsets, totalEnemies } from "../waveLayout";

const wave = (count: number): WaveSpec => ({
  count,
  formation: "line",
  spacing: 1,
  approach: 0,
  weave: { amplitude: 0, frequency: 0 },
});

describe("formationOffsets", () => {
  it("centres a line on the anchor", () => {
    expect(formationOffsets("line", 3, 4)).toEqual([
      [-4, 0, 0],
      [0, 0, 0],
      [4, 0, 0],
    ]);
  });

  it("trails vee wingmen behind the leader", () => {
    const [left, leader, right] = formationOffsets("vee", 3, 5);
    expect(leader[2]).toBe(0);
    expect(left[2]).toBeLessThan(0);
    expect(left[2]).toBe(right[2]);
  });

  it("stacks a column single file, each further back", () => {
    const zs = formationOffsets("column", 4, 6).map((o) => o[2]);
    expect(zs).toEqual([0, -6, -12, -18]);
  });

  it("alternates wall rows above and below", () => {
    const ys = formationOffsets("wall", 4, 2).map((o) => Math.sign(o[1]));
    expect(ys).toEqual([1, -1, 1, -1]);
  });
});

describe("dealIntoWaves", () => {
  it("hands items out in order across waves", () => {
    expect(dealIntoWaves(["a", "b", "c", "d", "e"], [wave(2), wave(3)])).toEqual([
      ["a", "b"],
      ["c", "d", "e"],
    ]);
  });

  it("wraps when the table asks for more than exist", () => {
    expect(dealIntoWaves(["a", "b"], [wave(3)])).toEqual([["a", "b", "a"]]);
  });

  it("yields empty waves for empty input", () => {
    expect(dealIntoWaves([], [wave(2)])).toEqual([[]]);
  });
});

describe("railWaves", () => {
  it("fields every project exactly once", () => {
    expect(totalEnemies(railWaves)).toBe(projects.length);
    const dealt = dealIntoWaves(projects, railWaves).flat();
    expect(new Set(dealt.map((p) => p.slug)).size).toBe(projects.length);
  });
});
