import { render, screen } from "@testing-library/react";

import { PageHeader } from "@components/PageHeader";

describe("PageHeader", () => {
  it("renders eyebrow, h1 title, and lede", () => {
    render(<PageHeader eyebrow="Lab" title="Physics field" lede="Intro." />);
    expect(screen.getByText("Lab")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Physics field");
    expect(screen.getByText("Intro.")).toBeInTheDocument();
  });

  it("omits the lede when not provided", () => {
    render(<PageHeader eyebrow="Lab" title="Physics field" />);
    expect(screen.getAllByRole("paragraph")).toHaveLength(1);
  });
});
