import type { Metadata } from "next";

import { ArcadeRail } from "@components/Arcade";
import { railMeta } from "@data/lab";
import { parseLabQuery } from "@utils/labUrl";

type ArcadeRailRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: `${railMeta.title} · Lab`,
  description: railMeta.description,
};

export default async function ArcadeRailPage({ searchParams }: ArcadeRailRouteProps) {
  const { theme } = parseLabQuery(await searchParams);
  return (
    <main aria-label={`${railMeta.title} rail shooter`}>
      <ArcadeRail initialTheme={theme} />
    </main>
  );
}
