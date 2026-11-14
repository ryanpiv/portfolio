import type { Metadata } from "next";

import { Grid } from "@components/Grid";
import { PageHeader } from "@components/PageHeader";
import { projects } from "@data/projects";
import { fetchGithubMetaBySlug } from "@utils/github";

import styles from "./projects.module.scss";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Projects",
  description: "Every project as a card — status, stack, GitHub activity, and live links where they exist.",
};

/** The traditional browser: the full project grid. */
export default async function ProjectsPage() {
  const githubBySlug = await fetchGithubMetaBySlug(projects);

  return (
    <main className={styles.projects}>
      <PageHeader
        eyebrow="Portfolio"
        title="Projects, live links, and the odd joke."
        lede="A grid of things I have built — apps you can open, code that is being rewritten, and showcase pieces that do not belong on a webpage. Each card leads to a project page; live demos open outward from there."
      />

      <section id="projects" aria-labelledby="projects-heading">
        <h2 id="projects-heading" className={styles.projects__sectionTitle}>
          Projects
        </h2>
        <Grid projects={projects} githubBySlug={githubBySlug} />
      </section>
    </main>
  );
}
