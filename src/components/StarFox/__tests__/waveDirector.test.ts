import { createDirector, stepDirector, type DirectorState, type DirectorStep } from "../rail/waveDirector";

const timing = { briefing: 2, between: 1 };

/** Advances `seconds` in 0.1s ticks with a fixed `waveActive`, returning the last step. */
function run(state: DirectorState, seconds: number, waveActive: boolean, waveCount = 3): DirectorStep {
  let step: DirectorStep = { state };
  for (let t = 0; t < seconds; t += 0.1) {
    step = stepDirector(step.state, 0.1, waveActive, timing, waveCount);
  }
  return step;
}

describe("stepDirector", () => {
  it("spawns wave 0 after the briefing", () => {
    const before = run(createDirector(), 1.9, false);
    expect(before.state.phase).toBe("briefing");
    expect(before.spawn).toBeUndefined();

    const at = stepDirector(before.state, 0.2, false, timing, 3);
    expect(at.spawn).toBe(0);
    expect(at.state).toMatchObject({ phase: "wave", wave: 0 });
  });

  it("holds the wave while enemies are in play", () => {
    const start: DirectorState = { phase: "wave", wave: 0, timer: 0 };
    const held = run(start, 10, true);
    expect(held.state.phase).toBe("wave");
    expect(held.spawn).toBeUndefined();
  });

  it("waits `between` seconds after a clear, then spawns the next wave", () => {
    const cleared = stepDirector({ phase: "wave", wave: 0, timer: 5 }, 0.1, false, timing, 3);
    expect(cleared.state).toMatchObject({ phase: "between", wave: 0 });

    const waiting = run(cleared.state, 0.9, false);
    expect(waiting.state.phase).toBe("between");

    const next = stepDirector(waiting.state, 0.2, false, timing, 3);
    expect(next.spawn).toBe(1);
    expect(next.state).toMatchObject({ phase: "wave", wave: 1 });
  });

  it("completes once the last wave clears", () => {
    const done = stepDirector({ phase: "wave", wave: 2, timer: 1 }, 0.1, false, timing, 3);
    expect(done.state).toMatchObject({ phase: "complete", wave: 2 });
    expect(stepDirector(done.state, 1, false, timing, 3).state).toBe(done.state);
  });

  it("completes immediately with an empty wave table", () => {
    expect(stepDirector(createDirector(), 0.1, false, timing, 0).state.phase).toBe("complete");
  });
});
