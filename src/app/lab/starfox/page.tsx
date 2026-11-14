import type { Metadata } from "next";

import { StarFox } from "@components/StarFox";
import { starFoxMeta } from "@data/lab";
import { parseLabQuery } from "@utils/labUrl";

type StarFoxRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: `${starFoxMeta.title} · Lab`,
  description: starFoxMeta.description,
};

export default async function StarFoxPage({ searchParams }: StarFoxRouteProps) {
  const { theme } = parseLabQuery(await searchParams);
  return (
    <main aria-label={`${starFoxMeta.title} rail shooter`}>
      <StarFox initialTheme={theme} />
    </main>
  );
}
