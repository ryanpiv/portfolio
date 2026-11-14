import Link from "next/link";

import { ExternalLink } from "@components/ExternalLink";
import { cx } from "@utils/cx";

import styles from "./SidebarNav.module.scss";

type SidebarNavProps = {
  open: boolean;
  onClose: () => void;
};

type NavItem = { href: string; label: string; external?: boolean };

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/lab", label: "Lab" },
  { href: "https://github.com/ryanpiv", label: "GitHub", external: true },
];

export function SidebarNav({ open, onClose }: SidebarNavProps) {
  // Keep links out of the tab order while the drawer is closed.
  const tabIndex = open ? 0 : -1;

  return (
    <aside
      id="site-sidebar"
      className={cx(styles.sidebarNav, open && styles["sidebarNav--open"])}
      aria-hidden={!open}
    >
      <p className={styles.sidebarNav__title}>Navigate</p>
      <ul className={styles.sidebarNav__list}>
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            {item.external ? (
              <ExternalLink href={item.href} className={styles.sidebarNav__link} tabIndex={tabIndex}>
                {item.label}
              </ExternalLink>
            ) : (
              <Link href={item.href} className={styles.sidebarNav__link} onClick={onClose} tabIndex={tabIndex}>
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
