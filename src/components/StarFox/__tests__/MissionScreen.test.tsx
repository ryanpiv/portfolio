import { fireEvent, render, screen } from "@testing-library/react";

import { starFoxWaves } from "@data/lab";

import { initialGameState, type GameState } from "../rail/gameStore";
import { MissionScreen } from "../rail/MissionScreen";

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

  it("links every downed fighter to its project page", () => {
    render(
      <MissionScreen
        game={{ ...base, phase: "complete", hits: 2, downed: ["parse-ai", "chattynator", "not-a-project"] }}
        onRetry={() => {}}
      />,
    );
    expect(screen.getByRole("link", { name: "Parse AI" })).toHaveAttribute("href", "/projects/parse-ai");
    expect(screen.getByRole("link", { name: "Chattynator" })).toHaveAttribute("href", "/projects/chattynator");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("omits the list when nothing was shot down", () => {
    render(<MissionScreen game={{ ...base, phase: "failed" }} onRetry={() => {}} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("shows the failure state", () => {
    render(<MissionScreen game={{ ...base, phase: "failed", shield: 0 }} onRetry={() => {}} />);
    expect(screen.getByText(/mission failed/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /shield gone/i })).toBeInTheDocument();
  });
});
