import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import { SiteChrome } from "@components/SiteChrome";

import "@/styles/globals.scss";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ryan Piveteau",
    template: "%s · Ryan Piveteau",
  },
  description:
    "Portfolio of software projects — live apps, rewrites in progress, and a few things that just exist.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className={plexSans.className}>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
