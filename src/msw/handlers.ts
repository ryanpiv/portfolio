import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("https://api.github.com/repos/:owner/:name", ({ params }) => {
    const { owner, name } = params;

    if (owner === "missing" || name === "gone") {
      return HttpResponse.json({ message: "Not Found" }, { status: 404 });
    }

    return HttpResponse.json({
      language: "TypeScript",
      pushed_at: "2026-05-02T00:25:44Z",
      stargazers_count: 3,
      full_name: `${owner}/${name}`,
    });
  }),
];
