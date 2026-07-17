import { render, screen } from "@testing-library/react";

import { StatusBadge } from "@components/StatusBadge";

describe("StatusBadge", () => {
  it("renders the live label", () => {
    render(<StatusBadge status="live" />);
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("renders showcase label", () => {
    render(<StatusBadge status="showcase" />);
    expect(screen.getByText("Showcase")).toBeInTheDocument();
  });
});
