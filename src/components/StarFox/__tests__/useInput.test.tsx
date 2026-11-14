import { act, fireEvent, render, renderHook } from "@testing-library/react";

import { useInput } from "../hooks/useInput";

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

  it("steers with a held pointer relative to the stage center", () => {
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
    pointer("pointermove", 500, 0);
    expect(input.current.x).toBeCloseTo(0);
    expect(input.current.y).toBe(1);
    pointer("pointerup", 500, 0);
    expect(input.current).toMatchObject({ x: 0, y: 0 });
  });
});
