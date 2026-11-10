import {
  LAB_THEMES,
  getAllLabVariantIds,
  getLabVariant,
  isLabTheme,
  isNameplateMode,
  labLighting,
  labVariants,
} from "@data/lab";

describe("lab variants", () => {
  it("exposes every variant id and resolves them back", () => {
    const ids = getAllLabVariantIds();
    expect(ids).toEqual(labVariants.map((v) => v.id));
    for (const id of ids) expect(getLabVariant(id)?.id).toBe(id);
    expect(getLabVariant("nope")).toBeUndefined();
  });

  it("has a lighting preset for every theme", () => {
    for (const theme of LAB_THEMES) expect(labLighting[theme]).toBeDefined();
  });
});

describe("lab guards", () => {
  it("accepts only known themes and nameplate modes", () => {
    expect(isLabTheme("dark")).toBe(true);
    expect(isLabTheme("sepia")).toBe(false);
    expect(isNameplateMode("hover")).toBe(true);
    expect(isNameplateMode(undefined)).toBe(false);
  });
});
