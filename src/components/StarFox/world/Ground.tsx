"use client";

import { useRef } from "react";
import type * as THREE from "three";

import { useGame } from "../gameContext";
import { useGameFrame } from "../hooks/useGameFrame";

/** Side length of one grid tile; two tiles leapfrog to look endless. */
const TILE = 200;
const DIVISIONS = 50;

/** Scrolling grid floor plus an opaque plane beneath it to hide the starfield below the horizon. */
export function Ground() {
  const { config, lighting } = useGame();
  const tiles = useRef<Array<THREE.GridHelper | null>>([null, null]);
  const { groundY, scrollSpeed } = config.world;

  useGameFrame((_, delta) => {
    for (const tile of tiles.current) {
      if (!tile) continue;
      tile.position.z += scrollSpeed * delta;
      // Once a tile is fully behind the camera, jump it ahead of its partner.
      if (tile.position.z > TILE) tile.position.z -= TILE * 2;
    }
  });

  const line = lighting.core.color;
  return (
    <group position={[0, groundY, 0]}>
      {[0, 1].map((index) => (
        <gridHelper
          key={index}
          ref={(el) => {
            tiles.current[index] = el;
          }}
          args={[TILE, DIVISIONS, line, line]}
          position={[0, 0.01, -index * TILE]}
          material-transparent
          material-opacity={0.28}
          material-depthWrite={false}
        />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -TILE / 2]} receiveShadow>
        <planeGeometry args={[TILE * 3, TILE * 3]} />
        {/* Shadow-receiving but otherwise unlit, so it reads as the horizon color. */}
        <shadowMaterial color={lighting.background} opacity={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, -TILE / 2]}>
        <planeGeometry args={[TILE * 3, TILE * 3]} />
        <meshBasicMaterial color={lighting.background} />
      </mesh>
    </group>
  );
}
