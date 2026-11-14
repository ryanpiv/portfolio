import { render, screen } from "@testing-library/react";

import { SlantDetail, SlantPanel, SlantStage } from "..";

describe("SlantStage", () => {
  it("exposes the shear as custom properties and links each panel", () => {
    render(
      <SlantStage slant={30} expand={3} height="20rem" label="Picks">
        <SlantPanel href="/a" align="start">
          A<SlantDetail>more about A</SlantDetail>
        </SlantPanel>
        <SlantPanel href="/b" align="end" unpickedShift="10%">
          B
        </SlantPanel>
      </SlantStage>,
    );
    const stage = screen.getByRole("group", { name: "Picks" });
    expect(stage.style.getPropertyValue("--slant")).toBe("30deg");
    expect(stage.style.getPropertyValue("--expand")).toBe("3");
    const b = screen.getByRole("link", { name: "B" });
    expect(b).toHaveAttribute("href", "/b");
    expect(b.style.getPropertyValue("--unpicked-shift")).toBe("10%");
    expect(screen.getByRole("link", { name: /more about A/ })).toBeInTheDocument();
  });
});
