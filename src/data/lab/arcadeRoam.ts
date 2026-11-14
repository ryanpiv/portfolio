/**
 * arcade lab, free roam: an open arena with buildings, one portal per
 * project, and fighters to chase. All-range flight: the ship always moves
 * forward; steering yaws and pitches it. Shares `combat` with rail mode.
 */

export const ARCADE_ROAM_ID = "arcade/roam";

export const roamMeta = {
  id: ARCADE_ROAM_ID,
  title: "Free roam",
  tagline: "Free roam the same ship.",
  description:
    "An open arena of towers with a portal for every project. Fly through one and it takes over the screen on the way to the project page; chase the fighters for points, grab power-ups to swap weapons, and level a tower with the plasma cannon. Crashing costs a hull bar and a respawn, nothing more. Milestones unlock achievements shared with the rail mission.",
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
    tower: number;
    pickup: number;
  };
  /** Arcade survival: a health bar, death, and coming back. */
  hull: {
    healthMax: number;
    /** Fighter health; weapons chip at it per bolt. */
    roamerHealth: number;
    /** Seconds the wreck lingers before you respawn. */
    respawnDelay: number;
    /** Seconds of invulnerability after a respawn or an arrival. */
    immunity: number;
    /** Open space needed around a respawn point. */
    respawnClearance: number;
  };
  /**
   * Hitting a tower. Severity is how head-on the hit was: the fraction of
   * your speed pointing into the wall (1 = nose first, 0 = a graze).
   */
  collision: {
    /** At or above this severity the ship is destroyed outright. */
    fatalAbove: number;
    /** Between this and `fatalAbove` take `heavyDamage`; below it `lightDamage`. */
    heavyAbove: number;
    heavyDamage: number;
    lightDamage: number;
    /** Seconds after a hit before towers can hurt again (stops a slide from stacking damage). */
    grace: number;
  };
  towers: {
    /** Health per unit of tower height; plasma chews through it. */
    healthPerMetre: number;
  };
  /** The wandering fighters: harmless until spooked, then they run and shoot back. */
  roamers: {
    /** Altitude band they cruise in, above the towers. */
    minAltitude: number;
    maxAltitude: number;
    cruiseSpeed: number;
    scatterSpeed: number;
    /** Yaw rates, rad / s. */
    cruiseTurn: number;
    scatterTurn: number;
    /** Within this of a waypoint counts as arrived. */
    waypointReach: number;
    /** The ship this close, or a bolt this close, spooks a roamer. */
    scareDistance: number;
    boltScareDistance: number;
    /** How long a spooked roamer keeps running. */
    alarmSeconds: number;
    /** Spooked roamers shoot back while the ship is within this range. */
    fireRange: number;
    /** Head start before a freshly spooked roamer opens fire. */
    firstShotDelay: number;
    /** Downtime between a kill and the fighter re-entering. */
    respawnDelay: number;
    /** Fresh spawns and scatter targets land in this fraction of the arena. */
    playFraction: number;
    /** How far a scatter waypoint is pushed away from the threat. */
    scatterDistance: number;
    /** Respawns appear at least this far from the ship. */
    respawnMinDistance: number;
  };
  pickups: {
    count: number;
    /** Seconds before a collected pickup reappears elsewhere. */
    respawnDelay: number;
    /** Altitude band pickups float in. */
    minAltitude: number;
    maxAltitude: number;
    /** Pickup radius for fly-through collection. */
    radius: number;
  };
};

export const roamConfig: RoamConfig = {
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
    tower: 150,
    pickup: 50,
  },
  hull: {
    healthMax: 100,
    roamerHealth: 100,
    respawnDelay: 1.6,
    immunity: 5,
    respawnClearance: 12,
  },
  collision: {
    fatalAbove: 0.5,
    heavyAbove: 0.25,
    heavyDamage: 40,
    lightDamage: 10,
    grace: 0.6,
  },
  towers: {
    healthPerMetre: 10,
  },
  roamers: {
    minAltitude: 22,
    maxAltitude: 58,
    cruiseSpeed: 14,
    scatterSpeed: 34,
    cruiseTurn: 1.2,
    scatterTurn: 2.6,
    waypointReach: 10,
    scareDistance: 32,
    boltScareDistance: 8,
    alarmSeconds: 3,
    fireRange: 120,
    firstShotDelay: 0.6,
    respawnDelay: 4,
    playFraction: 0.85,
    scatterDistance: 70,
    respawnMinDistance: 90,
  },
  pickups: {
    count: 6,
    respawnDelay: 12,
    minAltitude: 8,
    maxAltitude: 40,
    radius: 3,
  },
};
