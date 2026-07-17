"use client";

import { useState, type ReactNode } from "react";

import { BackgroundLayer } from "@components/BackgroundLayer";
import { Nav } from "@components/Nav";
import { SidebarNav } from "@components/SidebarNav";

import styles from "./SiteChrome.module.scss";

type SiteChromeProps = {
  children: ReactNode;
};

export function SiteChrome({ children }: SiteChromeProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <BackgroundLayer />
      <div className={styles.siteChrome}>
        <Nav
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
        />
        <SidebarNav open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className={styles.siteChrome__main}>{children}</div>
      </div>
    </>
  );
}
