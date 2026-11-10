import { getProjectPage, hasProjectWriteup } from "@utils/getProjectPage";

// `*.mdx` resolves to jest.mdx-stub.tsx via moduleNameMapper.

describe("getProjectPage", () => {
  it("returns null for an unknown slug", async () => {
    await expect(getProjectPage("nope")).resolves.toBeNull();
  });

  it("returns the project without a writeup when none is registered", async () => {
    const page = await getProjectPage("parse-ai");
    expect(page?.project.slug).toBe("parse-ai");
    expect(page?.Writeup).toBeNull();
    expect(hasProjectWriteup("parse-ai")).toBe(false);
  });

  it("loads the MDX writeup when one is registered", async () => {
    const page = await getProjectPage("murph-button");
    expect(typeof page?.Writeup).toBe("function");
    expect(hasProjectWriteup("murph-button")).toBe(true);
  });
});
