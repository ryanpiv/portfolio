import { act, fireEvent, render, renderHook } from "@testing-library/react";

import { DOUBLE_TAP_MS, useInput } from "../hooks/useInput";

function press(code: string) {
  fireEvent.keyDown(window, { code });
}
function release(code: string) {
  fireEvent.keyUp(window, { code });
}

describe("useInput", () => {
  it("maps WASD and arrows to steering axes and clamps opposing keys", () => {
    const { result } = renderHook(() => useInput());
    act(() => press("KeyD"));
    expect(result.current.input.current).toMatchObject({ x: 1, y: 0 });
    act(() => press("ArrowUp"));
    expect(result.current.input.current).toMatchObject({ x: 1, y: 1 });
    act(() => press("ArrowLeft"));
    expect(result.current.input.current.x).toBe(0);
    act(() => {
      release("KeyD");
      release("ArrowUp");
      release("ArrowLeft");
    });
    expect(result.current.input.current).toMatchObject({ x: 0, y: 0 });
  });

  it("reports fire while space is held", () => {
    const { result } = renderHook(() => useInput());
    act(() => press("Space"));
    expect(result.current.input.current.fire).toBe(true);
    act(() => release("Space"));
    expect(result.current.input.current.fire).toBe(false);
  });

  it("maps shift to boost and X / ctrl to brake, cancelling when both are held", () => {
    const { result } = renderHook(() => useInput());
    const input = result.current.input;
    act(() => press("ShiftLeft"));
    expect(input.current.throttle).toBe(1);
    act(() => press("KeyX"));
    expect(input.current.throttle).toBe(0);
    act(() => release("ShiftLeft"));
    expect(input.current.throttle).toBe(-1);
    act(() => release("KeyX"));
    expect(input.current.throttle).toBe(0);
  });

  it("requests a barrel roll from Q / E and from a lateral double-tap", () => {
    const { result } = renderHook(() => useInput());
    const input = result.current.input;

    act(() => press("KeyE"));
    expect(input.current.roll).toBe(1);
    input.current.roll = 0;
    act(() => release("KeyE"));

    // KeyboardEvent.timeStamp is read-only; fake the clock with defineProperty.
    const tapAt = (code: string, time: number) => {
      const event = new KeyboardEvent("keydown", { code });
      Object.defineProperty(event, "timeStamp", { value: time });
      fireEvent(window, event);
      fireEvent.keyUp(window, { code });
    };

    act(() => {
      tapAt("ArrowLeft", 1000);
      tapAt("ArrowLeft", 1000 + DOUBLE_TAP_MS + 50);
    });
    expect(input.current.roll).toBe(0);

    act(() => {
      tapAt("ArrowLeft", 3000);
      tapAt("ArrowLeft", 3000 + DOUBLE_TAP_MS - 50);
    });
    expect(input.current.roll).toBe(-1);
  });

  it("ignores key auto-repeat for roll detection", () => {
    const { result } = renderHook(() => useInput());
    act(() => {
      fireEvent.keyDown(window, { code: "KeyD" });
      fireEvent.keyDown(window, { code: "KeyD", repeat: true });
      fireEvent.keyDown(window, { code: "KeyD", repeat: true });
    });
    expect(result.current.input.current.roll).toBe(0);
    expect(result.current.input.current.x).toBe(1);
  });

  it("steers and fires with a held pointer relative to the stage center", () => {
    const { result } = renderHook(() => useInput());
    const { bind, input } = result.current;
    const { container } = render(<div data-testid="stage" {...bind} />);
    const stage = container.firstElementChild as HTMLElement;
    stage.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 1000, height: 1000, right: 1000, bottom: 1000, x: 0, y: 0, toJSON() {} }) as DOMRect;
    stage.setPointerCapture = () => {};

    // jsdom's PointerEvent drops clientX/Y; dispatch MouseEvents under pointer type names instead.
    const pointer = (type: string, clientX: number, clientY: number) =>
      fireEvent(stage, new MouseEvent(type, { clientX, clientY, bubbles: true }));

    pointer("pointerdown", 1000, 500);
    expect(input.current.x).toBe(1);
    expect(input.current.y).toBeCloseTo(0);
    expect(input.current.fire).toBe(true);
    pointer("pointermove", 500, 0);
    expect(input.current.x).toBeCloseTo(0);
    expect(input.current.y).toBe(1);
    pointer("pointerup", 500, 0);
    expect(input.current).toMatchObject({ x: 0, y: 0, fire: false });
  });

  it("leaves presses on HUD controls alone so they stay clicks", () => {
    const { result } = renderHook(() => useInput());
    const { bind, input } = result.current;
    const { getByRole } = render(
      <div {...bind}>
        <button type="button">theme</button>
      </div>,
    );
    const capture = jest.fn();
    (getByRole("button").parentElement as HTMLElement).setPointerCapture = capture;

    fireEvent(getByRole("button"), new MouseEvent("pointerdown", { clientX: 10, clientY: 10, bubbles: true }));
    expect(capture).not.toHaveBeenCalled();
    expect(input.current.fire).toBe(false);
  });
});
