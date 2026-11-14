import { act, render, screen } from "@testing-library/react";

import { PortalTransition, TRANSITION_MS } from "../roam/PortalTransition";

const transition = { slug: "parse-ai", title: "Parse AI", color: "#a8f0c4" };

describe("PortalTransition", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("renders nothing while flying", () => {
    render(<PortalTransition transition={null} onDone={() => {}} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("announces the project in its color and hands off once the takeover is complete", () => {
    const onDone = jest.fn();
    render(<PortalTransition transition={transition} onDone={onDone} />);

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("entering");
    expect(status).toHaveTextContent("Parse AI");
    expect(status.style.getPropertyValue("--portal-color")).toBe("#a8f0c4");

    act(() => jest.advanceTimersByTime(TRANSITION_MS - 1));
    expect(onDone).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(1));
    expect(onDone).toHaveBeenCalledWith(transition);
  });

  it("cancels the hand-off if unmounted early", () => {
    const onDone = jest.fn();
    const { unmount } = render(<PortalTransition transition={transition} onDone={onDone} />);
    unmount();
    act(() => jest.advanceTimersByTime(TRANSITION_MS));
    expect(onDone).not.toHaveBeenCalled();
  });
});
