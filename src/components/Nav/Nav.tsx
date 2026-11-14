import Link from "next/link";

import styles from "./Nav.module.scss";

type NavProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export function Nav({ sidebarOpen, onToggleSidebar }: NavProps) {
  return (
    <header className={styles.nav}>
      <Link href="/" className={styles.nav__brand}>
        Ryan Piveteau
      </Link>
      <div className={styles.nav__actions}>
        <Link href="/projects" className={styles.nav__link}>
          Projects
        </Link>
        <button
          type="button"
          className={styles.nav__toggle}
          aria-expanded={sidebarOpen}
          aria-controls="site-sidebar"
          onClick={onToggleSidebar}
        >
          {sidebarOpen ? "Close" : "Menu"}
        </button>
      </div>
    </header>
  );
}
