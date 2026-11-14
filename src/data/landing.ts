import { projects } from "./projects";

export type LandingChoiceId = "arcade" | "classic";

export type LandingChoice = {
  id: LandingChoiceId;
  /** Picker slot label, like a character-select roster number. */
  slot: string;
  eyebrow: string;
  title: string;
  tagline: string;
  description: string;
  /** Revealed on hover, like a character's stat sheet. */
  stats: { label: string; value: string }[];
  href: string;
  cta: string;
};

/** The two ways into the portfolio, offered side by side on the homepage. */
export const landingChoices: LandingChoice[] = [
  {
    id: "arcade",
    slot: "01",
    eyebrow: "Game mode",
    title: "Arcade",
    tagline: "Fly a ship through an arena where every project is a portal.",
    description:
      "An all-range arcade flight arena. Steer with WASD, boost freely, shoot the roaming fighters, grab weapon power-ups, and fly through a ring to open that project. Crashing just respawns you.",
    stats: [
      { label: "Controls", value: "WASD · shift · space" },
      { label: "Pace", value: "Portal in ~20 s" },
      { label: "Extras", value: "Achievements, power-ups" },
      { label: "Needs", value: "WebGL, keyboard" },
    ],
    href: "/lab/arcade/roam",
    cta: "Launch",
  },
  {
    id: "classic",
    slot: "02",
    eyebrow: "Traditional",
    title: "Classic",
    tagline: "A grid of cards with status, stack, and live links.",
    description:
      "The straightforward version. Every project on one page with its status, languages, GitHub activity, and a link to the live app when there is one. Works everywhere, loads instantly.",
    stats: [
      { label: "Controls", value: "Scroll, click" },
      { label: "Pace", value: "Instant" },
      { label: "Projects", value: String(projects.length) },
      { label: "Needs", value: "Nothing special" },
    ],
    href: "/projects",
    cta: "Browse",
  },
];
