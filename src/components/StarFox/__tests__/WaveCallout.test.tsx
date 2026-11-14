import { act, render, screen } from "@testing-library/react";

import { starFoxWaves } from "@data/lab";

import { CALLOUT_MS, WaveCallout } from "../rail/WaveCallout";

describe("WaveCallout", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("stays hidden during the briefing", () => {
    render(<WaveCallout game={{ phase: "briefing", wave: 0 }} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("announces a wave with its size and formation, then fades", () => {
    render(<WaveCallout game={{ phase: "wave", wave: 1 }} />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/wave 2/i);
    expect(status).toHaveTextContent(new RegExp(`${starFoxWaves[1].count} fighters · ${starFoxWaves[1].formation}`));

    act(() => jest.advanceTimersByTime(CALLOUT_MS));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("re-announces when the next wave spawns", () => {
    const { rerender } = render(<WaveCallout game={{ phase: "wave", wave: 0 }} />);
    act(() => jest.advanceTimersByTime(CALLOUT_MS));
    rerender(<WaveCallout game={{ phase: "wave", wave: 1 }} />);
    expect(screen.getByRole("status")).toHaveTextContent(/wave 2/i);
  });
});
