import { fireEvent, render, screen } from "@testing-library/react";

import { SidebarNav } from "@components/SidebarNav";

describe("SidebarNav", () => {
  it("is hidden from assistive tech and the tab order when closed", () => {
    render(<SidebarNav open={false} onClose={() => {}} />);
    const aside = document.getElementById("site-sidebar");
    expect(aside).toHaveAttribute("aria-hidden", "true");
    for (const link of aside!.querySelectorAll("a")) {
      expect(link).toHaveAttribute("tabindex", "-1");
    }
  });

  it("lists internal and external destinations and closes on internal navigation", () => {
    const onClose = jest.fn();
    render(<SidebarNav open onClose={onClose} />);
    expect(screen.getByRole("link", { name: "Lab" })).toHaveAttribute("href", "/lab");
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("target", "_blank");
    fireEvent.click(screen.getByRole("link", { name: "Home" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
