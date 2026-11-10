import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@components/PageHeader";
import { LAB_THEMES, labVariants } from "@data/lab";
import { buildLabUrl, defaultLabQuery } from "@utils/labUrl";

import styles from "./lab.module.scss";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Experimental WebGL views of the project registry — spheres with physics, drag and fling, lens flare.",
};

const THEME_LABELS = { dark: "Dark →", light: "Light →" } as const;

export default function LabPage() {
  return (
    <main className={styles.lab}>
      <PageHeader
        eyebrow="Lab"
        title="Physics field"
        lede="The project registry rendered as spheres in a 3D volume: collisions, drag and fling, hover to slow, click to open. Three ways of keeping them on screen, each in a dark and a light lighting preset. A proof-of-concept; the homepage grid is unchanged."
      />

      <ul className={styles.lab__list}>
        {labVariants.map((variant) => (
          <li key={variant.id} className={styles.lab__item}>
            <div>
              <h2 className={styles.lab__itemTitle}>{variant.title}</h2>
              <p className={styles.lab__itemTagline}>{variant.tagline}</p>
              <p className={styles.lab__itemDescription}>{variant.description}</p>
            </div>
            <div className={styles.lab__links}>
              {LAB_THEMES.map((theme) => (
                <Link
                  key={theme}
                  href={buildLabUrl(variant.id, { ...defaultLabQuery, theme })}
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
