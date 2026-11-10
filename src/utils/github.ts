export type GithubRepoMeta = {
  language: string | null;
  pushedAt: string | null;
  stars: number | null;
};

export type EnrichedProjectMeta = GithubRepoMeta & {
  owner: string;
  name: string;
};

const GITHUB_REPO_RE =
  /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/i;

export function parseGithubRepoUrl(
  repoUrl: string,
): { owner: string; name: string } | null {
  const match = repoUrl.trim().match(GITHUB_REPO_RE);
  if (!match) return null;
  return { owner: match[1], name: match[2] };
}

function emptyMeta(): GithubRepoMeta {
  return { language: null, pushedAt: null, stars: null };
}

/**
 * Fetch public GitHub repo metadata. Failures return null fields (silent fallback).
 */
export async function fetchGithubRepoMeta(
  repoUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<GithubRepoMeta> {
  const parsed = parseGithubRepoUrl(repoUrl);
  if (!parsed) return emptyMeta();

  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "ryanpiv-portfolio",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const init: RequestInit & { next?: { revalidate: number } } = {
      headers,
      next: { revalidate: 86400 },
    };
    const res = await fetchImpl(
      `https://api.github.com/repos/${parsed.owner}/${parsed.name}`,
      init,
    );

    if (!res.ok) return emptyMeta();

    const data = (await res.json()) as {
      language?: string | null;
      pushed_at?: string | null;
      stargazers_count?: number;
    };

    return {
      language: data.language ?? null,
      pushedAt: data.pushed_at ?? null,
      stars:
        typeof data.stargazers_count === "number" ? data.stargazers_count : null,
    };
  } catch {
    return emptyMeta();
  }
}

/** Fetch repo metadata for many projects in parallel, keyed by slug. */
export async function fetchGithubMetaBySlug(
  items: ReadonlyArray<{ slug: string; repo: string }>,
  fetchImpl: typeof fetch = fetch,
): Promise<Record<string, GithubRepoMeta>> {
  const entries = await Promise.all(
    items.map(async ({ slug, repo }) => [slug, await fetchGithubRepoMeta(repo, fetchImpl)] as const),
  );
  return Object.fromEntries(entries);
}

export async function enrichProjectRepo(
  repoUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<EnrichedProjectMeta | null> {
  const parsed = parseGithubRepoUrl(repoUrl);
  if (!parsed) return null;
  const meta = await fetchGithubRepoMeta(repoUrl, fetchImpl);
  return { ...parsed, ...meta };
}
