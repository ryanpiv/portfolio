import { Grid } from "@components/Grid";
import { projects } from "@data/projects";
import { fetchGithubRepoMeta, type GithubRepoMeta } from "@utils/github";

import styles from "./home.module.scss";

export const revalidate = 86400;

async function loadGithubBySlug(): Promise<
  Record<string, GithubRepoMeta | null>
> {
  const entries = await Promise.all(
    projects.map(async (project) => {
      const meta = await fetchGithubRepoMeta(project.repo);
      return [project.slug, meta] as const;
    }),
  );
  return Object.fromEntries(entries);
}

export default async function HomePage() {
  const githubBySlug = await loadGithubBySlug();

  return (
    <main className={styles.home}>
      <section className={styles.home__hero}>
        <p className={styles.home__eyebrow}>Portfolio</p>
        <h1 className={styles.home__title}>Projects, live links, and the odd joke.</h1>
        <p className={styles.home__lede}>
          A grid of things I have built — apps you can open, code that is being
          rewritten, and showcase pieces that do not belong on a webpage. Each
          card leads to a project page; live demos open outward from there.
        </p>
      </section>

      <section id="projects" aria-labelledby="projects-heading">
        <h2 id="projects-heading" className={styles.home__sectionTitle}>
          Projects
        </h2>
        <Grid projects={projects} githubBySlug={githubBySlug} />
      </section>
    </main>
  );
}
