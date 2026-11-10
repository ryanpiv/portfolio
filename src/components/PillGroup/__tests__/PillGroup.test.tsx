import { fireEvent, render, screen } from "@testing-library/react";

import { PillGroup } from "@components/PillGroup";

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
] as const;

describe("PillGroup", () => {
  it("marks the active option and reports clicks", () => {
    const onChange = jest.fn();
    render(<PillGroup label="Mode" options={options} value="a" onChange={onChange} />);
    expect(screen.getByRole("group", { name: "Mode" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Alpha" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Beta" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("can hide the visible label while keeping the group name", () => {
    render(<PillGroup label="Mode" options={options} value="a" onChange={() => {}} hideLabel />);
    expect(screen.getByRole("group", { name: "Mode" })).toBeInTheDocument();
    expect(screen.queryByText("Mode")).not.toBeInTheDocument();
  });
});
