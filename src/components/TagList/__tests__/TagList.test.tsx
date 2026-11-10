import { render, screen } from "@testing-library/react";

import { TagList } from "@components/TagList";

describe("TagList", () => {
  it("renders one item per tag", () => {
    render(<TagList tags={["Next.js", "WoW"]} />);
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "Next.js",
      "WoW",
    ]);
  });

  it("renders nothing for an empty list", () => {
    const { container } = render(<TagList tags={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
