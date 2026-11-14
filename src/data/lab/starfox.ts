/**
 * Star Fox lab: a short rail shooter. The ship stays near the origin and
 * the world streams toward the camera along +z. Numbers here seed the Leva
 * panel; promote tuned values back into this file.
 */

export const STARFOX_ID = "starfox";

export const starFoxMeta = {
  id: STARFOX_ID,
  title: "Corneria-lite",
  tagline: "A very short rail shooter.",
  description:
    "Fly an Arwing-ish wedge down a scrolling grid. Steer with the keyboard or by holding the pointer; shooting and enemies land in the next pass.",
} as const;

export type StarFoxConfig = {
  ship: {
    /** Top lateral speed, world units / s. */
    speed: number;
    /** How fast velocity chases the input (1/s; higher = twitchier). */
    responsiveness: number;
    /** Half-extents of the steering box in the view plane. */
    halfWidth: number;
    halfHeight: number;
    /** Resting altitude above the ground. */
    altitude: number;
    /** Roll (rad) at full lateral speed; pitch (rad) at full vertical speed. */
    bank: number;
    pitch: number;
  };
  world: {
    /** Forward speed: how fast scenery streams toward the camera. */
    scrollSpeed: number;
    groundY: number;
    /** Scenery spawns this far ahead and recycles once behind the camera. */
    drawDistance: number;
    sceneryCount: number;
    fogNear: number;
    fogFar: number;
  };
  camera: {
    /** Camera position relative to the ship's rest point. */
    offset: [x: number, y: number, z: number];
    /** Fraction of the ship's lateral offset the camera follows (SF64 moves less than the ship). */
    follow: number;
    /** Follow smoothing (1/s; higher = tighter). */
    lag: number;
    /** Distance ahead of the ship the camera looks at. */
    lookAhead: number;
    fov: number;
  };
};

export const starFoxConfig: StarFoxConfig = {
  ship: {
    speed: 16,
    responsiveness: 7,
    halfWidth: 10,
    halfHeight: 5,
    altitude: 5,
    bank: 0.95,
    pitch: 0.3,
  },
  world: {
    scrollSpeed: 45,
    groundY: 0,
    drawDistance: 240,
    sceneryCount: 40,
    fogNear: 50,
    fogFar: 220,
  },
  camera: {
    offset: [0, 3.5, 13],
    follow: 0.55,
    lag: 6,
    lookAhead: 40,
    fov: 62,
  },
};
