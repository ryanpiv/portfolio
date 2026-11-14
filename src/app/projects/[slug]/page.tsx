import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectHeader } from "@components/ProjectHeader";
import { getAllProjectSlugs } from "@data/projects";
import { fetchGithubRepoMeta } from "@utils/github";
import { getProjectPage } from "@utils/getProjectPage";

import styles from "../projectPage.module.scss";

export const revalidate = 86400;

type ProjectRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProjectRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProjectPage(slug);
  if (!data) return { title: "Project" };
  return {
    title: data.project.title,
    description: data.project.description,
  };
}

export default async function ProjectPage({ params }: ProjectRouteProps) {
  const { slug } = await params;
  const data = await getProjectPage(slug);
  if (!data) notFound();

  const { project, Writeup } = data;
  const github = await fetchGithubRepoMeta(project.repo);

  return (
    <main className={styles.projectPage}>
      <Link href="/projects" className={styles.projectPage__back}>
        ← Projects
      </Link>
      <ProjectHeader project={project} github={github} />
      {Writeup ? (
        <article className={styles.projectPage__writeup}>
          <Writeup />
        </article>
      ) : (
        <p className={styles.projectPage__fallback}>
          No long writeup yet — use the links above for the live app, GitHub
          repo, or archived original when one exists. History notes land here
          when a rewrite gets a story.
        </p>
      )}
    </main>
  );
}
