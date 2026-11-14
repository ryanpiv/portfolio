/**
 * Star Fox lab, free roam: an open arena with buildings, one portal per
 * project, and fighters to chase. All-range flight: the ship always moves
 * forward; steering yaws and pitches it. Shares `combat` with rail mode.
 */

export const STARFOX_ROAM_ID = "starfox/roam";

export const starFoxRoamMeta = {
  id: STARFOX_ROAM_ID,
  title: "Corneria, all-range",
  tagline: "Free roam the same ship.",
  description:
    "An open arena of towers with a portal for every project. Fly through one and it takes over the screen on the way to the project page; chase the fighters for points; milestones unlock achievements shared with the rail mission.",
} as const;

export type RoamConfig = {
  flight: {
    /** Forward speed with no throttle input, world units / s. */
    cruiseSpeed: number;
    boostSpeed: number;
    brakeSpeed: number;
    /** How quickly speed chases the throttle target (1/s). */
    acceleration: number;
    /** Yaw rate at full lateral input, rad / s. */
    turnRate: number;
    /** Pitch angle at full vertical input, rad, and how fast it is reached (1/s). */
    maxPitch: number;
    pitchResponse: number;
    /** Visual roll at full lateral input, rad. */
    bank: number;
  };
  arena: {
    /** Playable radius; past it the ship is steered back. */
    radius: number;
    minAltitude: number;
    maxAltitude: number;
    buildingCount: number;
    roamerCount: number;
    /** Deterministic layout seed. */
    seed: number;
  };
  camera: {
    /** Behind and above the ship, along its own axes. */
    distance: number;
    height: number;
    lag: number;
    lookAhead: number;
    fov: number;
  };
  scoring: {
    kill: number;
    portal: number;
    /** Extra for a project's first visit. */
    firstVisit: number;
  };
};

export const starFoxRoamConfig: RoamConfig = {
  flight: {
    cruiseSpeed: 30,
    boostSpeed: 55,
    brakeSpeed: 12,
    acceleration: 3,
    turnRate: 1.5,
    maxPitch: 0.8,
    pitchResponse: 4,
    bank: 1,
  },
  arena: {
    radius: 230,
    minAltitude: 2.5,
    maxAltitude: 70,
    buildingCount: 90,
    roamerCount: 8,
    seed: 11,
  },
  camera: {
    distance: 14,
    height: 4.5,
    lag: 5,
    lookAhead: 30,
    fov: 65,
  },
  scoring: {
    kill: 100,
    portal: 250,
    firstVisit: 500,
  },
};
