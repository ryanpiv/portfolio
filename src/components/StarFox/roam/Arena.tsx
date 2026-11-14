"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import type { Building } from "@utils/arenaLayout";

import { useRoam } from "./roamContext";

const GRID_DIVISIONS = 60;
/** Ground extends past the playable radius so the edge never shows. */
const GROUND_OVERSHOOT = 1.4;
const BOUNDARY_SEGMENTS = 96;
const BOUNDARY_HEIGHT = 1.5;
/** Towers sit this far from the background toward the text color: present, not loud. */
const TOWER_TINT = 0.1;

const dummy = new THREE.Object3D();

/** Static arena: grid floor, a faint boundary ring at the playable radius, and the instanced towers. */
export function Arena() {
  const { config, lighting, layout } = useRoam();
  const { radius } = config.arena;
  const size = radius * 2 * GROUND_OVERSHOOT;
  const line = lighting.core.color;

  return (
    <group>
      <gridHelper
        args={[size, GRID_DIVISIONS, line, line]}
        position={[0, 0.01, 0]}
        material-transparent
        material-opacity={0.22}
        material-depthWrite={false}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <shadowMaterial color={lighting.background} opacity={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial color={lighting.background} />
      </mesh>
      <mesh position={[0, BOUNDARY_HEIGHT, 0]}>
        <cylinderGeometry args={[radius, radius, BOUNDARY_HEIGHT * 2, BOUNDARY_SEGMENTS, 1, true]} />
        <meshBasicMaterial
          color={lighting.statusColors.showcase}
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <Buildings buildings={layout.buildings} />
    </group>
  );
}

type BuildingsProps = { buildings: ReadonlyArray<Building> };

/** One instanced mesh for every tower; the layout is static so the matrices are written once. */
function Buildings({ buildings }: BuildingsProps) {
  const { lighting } = useRoam();
  const mesh = useRef<THREE.InstancedMesh>(null);
  const hull = useMemo(
    () => new THREE.Color(lighting.background).lerp(new THREE.Color(lighting.text), TOWER_TINT),
    [lighting],
  );

  useEffect(() => {
    const instanced = mesh.current;
    if (!instanced) return;
    buildings.forEach((b, i) => {
      dummy.position.set(b.position[0], b.size[1] / 2, b.position[2]);
      dummy.scale.set(b.size[0], b.size[1], b.size[2]);
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    });
    instanced.count = buildings.length;
    instanced.instanceMatrix.needsUpdate = true;
  }, [buildings]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, Math.max(1, buildings.length)]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hull} roughness={0.85} metalness={0.1} />
    </instancedMesh>
  );
}
