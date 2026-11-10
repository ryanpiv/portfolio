import { cx } from "@utils/cx";

describe("cx", () => {
  it("joins truthy class names with a space", () => {
    expect(cx("a", "b")).toBe("a b");
  });

  it("drops false, null, undefined, and empty strings", () => {
    expect(cx("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("returns an empty string with no classes", () => {
    expect(cx()).toBe("");
    expect(cx(false, undefined)).toBe("");
  });
});
