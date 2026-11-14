import { render, screen } from "@testing-library/react";

import { ShieldBar } from "../rail/ShieldBar";

describe("ShieldBar", () => {
  it("exposes the shield as a meter percentage", () => {
    render(<ShieldBar shield={45} shieldMax={100} />);
    const meter = screen.getByRole("meter", { name: /shield/i });
    expect(meter).toHaveAttribute("aria-valuenow", "45");
    expect(meter.firstElementChild).toHaveStyle({ width: "45%" });
  });

  it("changes tone as the shield drops", () => {
    const { rerender } = render(<ShieldBar shield={100} shieldMax={100} />);
    const fill = () => screen.getByRole("meter").firstElementChild as HTMLElement;
    expect(fill().className).not.toMatch(/warn|critical/);

    rerender(<ShieldBar shield={50} shieldMax={100} />);
    expect(fill().className).toMatch(/warn/);

    rerender(<ShieldBar shield={20} shieldMax={100} />);
    expect(fill().className).toMatch(/critical/);
  });
});
