import type { Metadata } from "next";

import { StarFoxRoam } from "@components/StarFox";
import { starFoxRoamMeta } from "@data/lab";
import { parseLabQuery } from "@utils/labUrl";

type StarFoxRoamRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: `${starFoxRoamMeta.title} · Lab`,
  description: starFoxRoamMeta.description,
};

export default async function StarFoxRoamPage({ searchParams }: StarFoxRoamRouteProps) {
  const { theme } = parseLabQuery(await searchParams);
  return (
    <main aria-label={`${starFoxRoamMeta.title} free roam`}>
      <StarFoxRoam initialTheme={theme} />
    </main>
  );
}
