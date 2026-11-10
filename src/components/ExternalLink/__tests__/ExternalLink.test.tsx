import { render, screen } from "@testing-library/react";

import { ExternalLink } from "@components/ExternalLink";

describe("ExternalLink", () => {
  it("opens in a new tab with noreferrer and passes through props", () => {
    render(
      <ExternalLink href="https://example.com" className="x" tabIndex={-1}>
        Out
      </ExternalLink>,
    );
    const link = screen.getByRole("link", { name: "Out" });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
    expect(link).toHaveClass("x");
    expect(link).toHaveAttribute("tabindex", "-1");
  });
});
