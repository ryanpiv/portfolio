import { fireEvent, render, screen } from "@testing-library/react";

import { Nav } from "@components/Nav";

describe("Nav", () => {
  it("toggles the sidebar via the menu button", () => {
    const onToggleSidebar = jest.fn();
    render(<Nav sidebarOpen={false} onToggleSidebar={onToggleSidebar} />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    expect(onToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it("shows Close when sidebar is open", () => {
    render(<Nav sidebarOpen onToggleSidebar={() => undefined} />);
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });
});
