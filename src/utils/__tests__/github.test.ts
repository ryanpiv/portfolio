import { http, HttpResponse } from "msw";

import { server } from "@msw/server";
import { fetchGithubMetaBySlug, fetchGithubRepoMeta, parseGithubRepoUrl } from "@utils/github";

describe("parseGithubRepoUrl", () => {
  it("parses a standard github repo url", () => {
    expect(parseGithubRepoUrl("https://github.com/ryanpiv/parse-ai")).toEqual({
      owner: "ryanpiv",
      name: "parse-ai",
    });
  });

  it("strips .git suffix", () => {
    expect(
      parseGithubRepoUrl("https://github.com/ryanpiv/MurphButton.git"),
    ).toEqual({ owner: "ryanpiv", name: "MurphButton" });
  });

  it("returns null for non-github urls", () => {
    expect(parseGithubRepoUrl("https://example.com/foo")).toBeNull();
  });
});

describe("fetchGithubRepoMeta", () => {
  it("returns language, pushedAt, and stars from the API", async () => {
    const meta = await fetchGithubRepoMeta(
      "https://github.com/ryanpiv/parse-ai",
    );
    expect(meta).toEqual({
      language: "TypeScript",
      pushedAt: "2026-05-02T00:25:44Z",
      stars: 3,
    });
  });

  it("returns empty meta on 404", async () => {
    const meta = await fetchGithubRepoMeta(
      "https://github.com/missing/gone",
    );
    expect(meta).toEqual({
      language: null,
      pushedAt: null,
      stars: null,
    });
  });

  it("returns empty meta when the network throws", async () => {
    server.use(
      http.get("https://api.github.com/repos/:owner/:name", () => {
        return HttpResponse.error();
      }),
    );

    const meta = await fetchGithubRepoMeta(
      "https://github.com/ryanpiv/parse-ai",
    );
    expect(meta).toEqual({
      language: null,
      pushedAt: null,
      stars: null,
    });
  });
});

describe("fetchGithubMetaBySlug", () => {
  it("keys results by slug and isolates failures per repo", async () => {
    const result = await fetchGithubMetaBySlug([
      { slug: "parse-ai", repo: "https://github.com/ryanpiv/parse-ai" },
      { slug: "gone", repo: "https://github.com/missing/gone" },
    ]);
    expect(result["parse-ai"].language).toBe("TypeScript");
    expect(result.gone).toEqual({ language: null, pushedAt: null, stars: null });
  });
});
