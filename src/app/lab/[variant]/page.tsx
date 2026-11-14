import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PhysicsField } from "@components/PhysicsField";
import { getAllLabVariantIds, getLabVariant } from "@data/lab";
import { projects } from "@data/projects";
import { parseLabQuery } from "@utils/labUrl";

type LabVariantRouteProps = {
  params: Promise<{ variant: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return getAllLabVariantIds().map((variant) => ({ variant }));
}

export async function generateMetadata({
  params,
}: LabVariantRouteProps): Promise<Metadata> {
  const { variant: id } = await params;
  const variant = getLabVariant(id);
  if (!variant) return { title: "Lab" };
  return {
    title: `${variant.title} · Lab`,
    description: variant.description,
  };
}

export default async function LabVariantPage({
  params,
  searchParams,
}: LabVariantRouteProps) {
  const [{ variant: id }, query] = await Promise.all([params, searchParams]);
  const variant = getLabVariant(id);
  if (!variant) notFound();

  const { theme, quality, view } = parseLabQuery(query);

  return (
    <main aria-label={`${variant.title} physics field`}>
      <PhysicsField
        projects={projects}
        variant={variant}
        initialTheme={theme}
        initialQuality={quality}
        initialView={view}
      />
    </main>
  );
}
