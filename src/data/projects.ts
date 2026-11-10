export type ProjectStatus =
  | "live"
  | "in-progress"
  | "rewrite-planned"
  | "showcase";

/** Display order for statuses (most alive first). */
export const PROJECT_STATUSES: readonly ProjectStatus[] = [
  "live",
  "in-progress",
  "rewrite-planned",
  "showcase",
];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  live: "Live",
  "in-progress": "In progress",
  "rewrite-planned": "Rewrite planned",
  showcase: "Showcase",
};

export type Project = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  repo: string;
  legacyRepo?: string;
  liveUrl?: string;
  status: ProjectStatus;
  year: number;
};

export const projects: Project[] = [
  {
    slug: "parse-ai",
    title: "Parse AI",
    description:
      "AI-assisted Warcraft Logs analysis with fight context, talent comparison, and coaching prompts.",
    tags: ["Next.js", "TypeScript", "WoW", "AI"],
    repo: "https://github.com/ryanpiv/parse-ai",
    liveUrl: "https://parse-ai-eta.vercel.app",
    status: "live",
    year: 2026,
  },
  {
    slug: "wow-tools",
    title: "WoW Tools",
    description:
      "Hub for focused Warcraft utilities. First tool: How did I die? — WCL death recaps as plain text.",
    tags: ["Next.js", "TypeScript", "WoW", "WCL"],
    repo: "https://github.com/ryanpiv/wow-tools",
    status: "in-progress",
    year: 2026,
  },
  {
    slug: "wcl-meta",
    title: "WCL Meta",
    description:
      "Aggregate Warcraft Logs talent popularity by raid tier — early exploration.",
    tags: ["WoW", "WCL", "data"],
    repo: "https://github.com/ryanpiv/wcl-meta",
    status: "in-progress",
    year: 2026,
  },
  {
    slug: "family-cookbook",
    title: "Family Cookbook",
    description:
      "A shared family cookbook app — recipes, stories, and the dishes that stick around.",
    tags: ["TypeScript", "recipes"],
    repo: "https://github.com/ryanpiv/family-cookbook",
    status: "in-progress",
    year: 2025,
  },
  {
    slug: "loot-history",
    title: "Loot History",
    description:
      "Loot analytics for WoW raiding guilds from RC Loot Council / Big Dumb Loot Council exports. PHP original; rewrite planned.",
    tags: ["WoW", "PHP", "rewrite"],
    repo: "https://github.com/ryanpiv/LootHistory",
    status: "rewrite-planned",
    year: 2018,
  },
  {
    slug: "willothewick",
    title: "Will o' the Wick",
    description:
      "Candle shop built with Next.js, Strapi, Magic, and Stripe. Revival / rewrite candidate.",
    tags: ["Next.js", "Stripe", "commerce", "rewrite"],
    repo: "https://github.com/ryanpiv/willothewick",
    liveUrl: "https://willothewick.vercel.app",
    status: "rewrite-planned",
    year: 2021,
  },
  {
    slug: "video-game-title-screens",
    title: "Video Game Title Screens",
    description:
      "Looping HTML5 title-screen videos with game audio. Fair use; rewrite planned for a cleaner player.",
    tags: ["JavaScript", "video", "rewrite"],
    repo: "https://github.com/ryanpiv/VideoGameTitleScreens",
    status: "rewrite-planned",
    year: 2019,
  },
  {
    slug: "color-sorter",
    title: "Color Sorter",
    description: "A small color-sorting experiment. Due for a modern rebuild.",
    tags: ["JavaScript", "rewrite"],
    repo: "https://github.com/ryanpiv/color-sorter",
    status: "rewrite-planned",
    year: 2020,
  },
  {
    slug: "press-start",
    title: "Press Start",
    description: "Game-inspired web experiment. Rewrite planned.",
    tags: ["JavaScript", "rewrite"],
    repo: "https://github.com/ryanpiv/press-start",
    status: "rewrite-planned",
    year: 2021,
  },
  {
    slug: "chattynator",
    title: "Chattynator",
    description:
      "A revamp of the World of Warcraft chat interface (addon). Showcased as shipped software, not a web demo.",
    tags: ["Lua", "WoW", "addon"],
    repo: "https://github.com/ryanpiv/Chattynator",
    liveUrl: "https://www.curseforge.com/wow/addons/chattynator",
    status: "showcase",
    year: 2026,
  },
  {
    slug: "disappointedloa",
    title: "Disappointed LOA",
    description:
      "Discord bot for tracking leaves of absence for a WoW guild.",
    tags: ["JavaScript", "Discord", "bot"],
    repo: "https://github.com/ryanpiv/disappointedloa",
    status: "showcase",
    year: 2017,
  },
  {
    slug: "guildsongbot",
    title: "Guild Song Bot",
    description: "Discord bot experiments for guild song / voice antics.",
    tags: ["JavaScript", "Discord", "bot"],
    repo: "https://github.com/ryanpiv/guildsongbot",
    status: "showcase",
    year: 2017,
  },
  {
    slug: "twitch-gift-autoclicker",
    title: "Twitch Gift Autoclicker",
    description:
      "Chrome extension that autoclicks the occasional Twitch channel-points gift button.",
    tags: ["JavaScript", "Chrome", "extension"],
    repo: "https://github.com/ryanpiv/twitch-gift-autoclicker-chrome",
    status: "showcase",
    year: 2021,
  },
  {
    slug: "my-first-chrome-extension",
    title: "My First Chrome Extension",
    description: "Early Chrome extension experiments — kept for the timeline.",
    tags: ["JavaScript", "Chrome", "extension"],
    repo: "https://github.com/ryanpiv/MyFirstChromeExtension",
    status: "showcase",
    year: 2014,
  },
  {
    slug: "protonvpn-win-app",
    title: "ProtonVPN Windows (fork)",
    description:
      "Fork notes around ProtonVPN Windows with qBittorrent port-forwarding hooks.",
    tags: ["C++", "fork", "VPN"],
    repo: "https://github.com/ryanpiv/ProtonVPN-win-app",
    status: "showcase",
    year: 2023,
  },
  {
    slug: "murph-button",
    title: "Murph Button",
    description: "murrrrph.",
    tags: ["CSS", "fun"],
    repo: "https://github.com/ryanpiv/MurphButton",
    status: "showcase",
    year: 2015,
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getAllProjectSlugs(): string[] {
  return projects.map((project) => project.slug);
}
