import { fireEvent, render, screen } from "@testing-library/react";

import { starFoxWaves } from "@data/lab";

import { initialGameState, type GameState } from "../game/gameStore";
import { MissionScreen } from "../MissionScreen";

const base: GameState = initialGameState({ waves: starFoxWaves, shieldMax: 100 });

describe("MissionScreen", () => {
  it("renders nothing while the run is live", () => {
    const { container } = render(<MissionScreen game={base} onRetry={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the completion summary and retries", () => {
    const onRetry = jest.fn();
    render(
      <MissionScreen
        game={{ ...base, phase: "complete", hits: 12, escaped: 4, shield: 55 }}
        onRetry={onRetry}
      />,
    );
    expect(screen.getByRole("dialog", { name: /corneria is clear/i })).toBeInTheDocument();
    expect(screen.getByText(/12 of 16 fighters down · 4 got past · 55% shield left/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /fly again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows the failure state", () => {
    render(<MissionScreen game={{ ...base, phase: "failed", shield: 0 }} onRetry={() => {}} />);
    expect(screen.getByText(/mission failed/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /shield gone/i })).toBeInTheDocument();
  });
});
