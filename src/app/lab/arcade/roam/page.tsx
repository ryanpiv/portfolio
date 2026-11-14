import type { Metadata } from "next";

import { ArcadeRoam } from "@components/Arcade";
import { roamMeta } from "@data/lab";
import { parseLabQuery } from "@utils/labUrl";

type ArcadeRoamRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: `${roamMeta.title} · Lab`,
  description: roamMeta.description,
};

export default async function ArcadeRoamPage({ searchParams }: ArcadeRoamRouteProps) {
  const { theme } = parseLabQuery(await searchParams);
  return (
    <main aria-label={`${roamMeta.title} free roam`}>
      <ArcadeRoam initialTheme={theme} />
    </main>
  );
}
