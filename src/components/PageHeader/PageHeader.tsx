import type { ReactNode } from "react";

import styles from "./PageHeader.module.scss";

type PageHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
};

/** Hero block for index pages: eyebrow, display title, optional lede. */
export function PageHeader({ eyebrow, title, lede }: PageHeaderProps) {
  return (
    <header className={styles.pageHeader}>
      <p className={styles.pageHeader__eyebrow}>{eyebrow}</p>
      <h1 className={styles.pageHeader__title}>{title}</h1>
      {lede && <p className={styles.pageHeader__lede}>{lede}</p>}
    </header>
  );
}
