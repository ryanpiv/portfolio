import { render, screen } from "@testing-library/react";

import { landingChoices } from "@data/landing";
import { useDeviceCapability } from "@hooks/useDeviceCapability";
import { optimisticCapability } from "@utils/deviceCapability";

import { Landing } from "../Landing";

jest.mock("@hooks/useDeviceCapability");
const mockCapability = jest.mocked(useDeviceCapability);

describe("Landing", () => {
  beforeEach(() => mockCapability.mockReturnValue(null));

  it("offers both ways in as links with their detail sheets", () => {
    render(<Landing choices={landingChoices} />);
    const arcade = screen.getByRole("link", { name: /arcade/i });
    const classic = screen.getByRole("link", { name: /classic/i });
    expect(arcade).toHaveAttribute("href", "/lab/arcade/roam");
    expect(classic).toHaveAttribute("href", "/projects");
    expect(arcade).toHaveTextContent("Launch");
    expect(classic).toHaveTextContent("Browse");
    expect(screen.getAllByRole("term")).toHaveLength(landingChoices.reduce((n, c) => n + c.stats.length, 0));
    expect(screen.queryByText("recommended")).not.toBeInTheDocument();
  });

  it("recommends nothing on a capable device", () => {
    mockCapability.mockReturnValue(optimisticCapability);
    render(<Landing choices={landingChoices} />);
    expect(screen.queryByText("recommended")).not.toBeInTheDocument();
    expect(screen.getByText(/hover to preview/)).toBeInTheDocument();
  });

  it("recommends classic, with the reason, when the device cannot run the arcade well", () => {
    mockCapability.mockReturnValue({ ...optimisticCapability, webgl: false });
    render(<Landing choices={landingChoices} />);
    const classic = screen.getByRole("link", { name: /classic/i });
    expect(classic).toHaveTextContent("recommended");
    expect(screen.getByText(/no WebGL/)).toBeInTheDocument();
  });
});
