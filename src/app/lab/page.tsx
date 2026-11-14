import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@components/PageHeader";
import { LAB_THEMES, labVariants, railMeta, roamMeta } from "@data/lab";
import { buildLabUrl, defaultLabQuery } from "@utils/labUrl";

import styles from "./lab.module.scss";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Experimental WebGL views of the project registry — spheres with physics, drag and fling, lens flare — plus a rail shooter and a free-roam arena with portals into the projects.",
};

const THEME_LABELS = { dark: "Dark →", light: "Light →" } as const;

/** Every lab experience gets the same card; variants and the game differ only in route. */
const experiments = [
  ...labVariants.map(({ id, title, tagline, description }) => ({ id, title, tagline, description })),
  railMeta,
  roamMeta,
];

export default function LabPage() {
  return (
    <main className={styles.lab}>
      <PageHeader
        eyebrow="Lab"
        title="Experiments"
        lede="The project registry rendered as spheres in a 3D volume — collisions, drag and fling, hover to slow, click to open — in three containment variants, plus a arcade rail shooter and a free-roam arena whose portals open the projects. Each has a dark and a light lighting preset. Proofs of concept; the classic grid at /projects is unchanged."
      />

      <ul className={styles.lab__list}>
        {experiments.map((item) => (
          <li key={item.id} className={styles.lab__item}>
            <div>
              <h2 className={styles.lab__itemTitle}>{item.title}</h2>
              <p className={styles.lab__itemTagline}>{item.tagline}</p>
              <p className={styles.lab__itemDescription}>{item.description}</p>
            </div>
            <div className={styles.lab__links}>
              {LAB_THEMES.map((theme) => (
                <Link
                  key={theme}
                  href={buildLabUrl(item.id, { ...defaultLabQuery, theme })}
                  className={styles.lab__link}
                >
                  {THEME_LABELS[theme]}
                </Link>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <p className={styles.lab__note}>
        Built with three.js, react-three-fiber, Rapier (physics), and postprocessing (bloom + lens
        flare). Tune everything live from the panel on each page.
      </p>
    </main>
  );
}
