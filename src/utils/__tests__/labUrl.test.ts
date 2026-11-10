import { defaultViewOptions } from "@data/lab";
import { buildLabUrl, parseLabQuery } from "@utils/labUrl";

describe("parseLabQuery", () => {
  it("falls back to defaults for missing or junk values", () => {
    expect(parseLabQuery({})).toEqual({ theme: undefined, view: defaultViewOptions });
    expect(parseLabQuery({ theme: "neon", names: "sometimes", lines: "maybe" })).toEqual({
      theme: undefined,
      view: defaultViewOptions,
    });
  });

  it("reads valid values and takes the first of repeated params", () => {
    expect(parseLabQuery({ theme: ["light", "dark"], names: "hover", lines: "off" })).toEqual({
      theme: "light",
      view: { nameplates: "hover", tetherLines: false },
    });
  });
});

describe("buildLabUrl", () => {
  it("omits default view options", () => {
    expect(buildLabUrl("caged", { theme: "dark", view: defaultViewOptions })).toBe(
      "/lab/caged?theme=dark",
    );
    expect(buildLabUrl("caged", { view: defaultViewOptions })).toBe("/lab/caged");
  });

  it("writes non-default view options", () => {
    expect(
      buildLabUrl("tethered", {
        theme: "light",
        view: { nameplates: "off", tetherLines: false },
      }),
    ).toBe("/lab/tethered?theme=light&names=off&lines=off");
  });

  it("round-trips through parseLabQuery", () => {
    const query = { theme: "dark" as const, view: { nameplates: "hover" as const, tetherLines: false } };
    const url = new URL(buildLabUrl("attractor", query), "http://x");
    expect(parseLabQuery(Object.fromEntries(url.searchParams))).toEqual(query);
  });
});
