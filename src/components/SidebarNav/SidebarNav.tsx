import Link from "next/link";

import styles from "./SidebarNav.module.scss";

type SidebarNavProps = {
  open: boolean;
  onClose: () => void;
};

export function SidebarNav({ open, onClose }: SidebarNavProps) {
  return (
    <aside
      id="site-sidebar"
      className={`${styles.sidebarNav}${open ? ` ${styles["sidebarNav--open"]}` : ""}`}
      aria-hidden={!open}
    >
      <p className={styles.sidebarNav__title}>Navigate</p>
      <ul className={styles.sidebarNav__list}>
        <li>
          <Link
            href="/"
            className={styles.sidebarNav__link}
            onClick={onClose}
            tabIndex={open ? 0 : -1}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            href="/#projects"
            className={styles.sidebarNav__link}
            onClick={onClose}
            tabIndex={open ? 0 : -1}
          >
            Projects
          </Link>
        </li>
        <li>
          <a
            href="https://github.com/ryanpiv"
            className={styles.sidebarNav__link}
            target="_blank"
            rel="noreferrer"
            tabIndex={open ? 0 : -1}
          >
            GitHub
          </a>
        </li>
      </ul>
      <p className={styles.sidebarNav__note}>
        Sidebar is ready for the future star-grid navigation. For now it is a
        quiet menu.
      </p>
    </aside>
  );
}
