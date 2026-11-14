"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { weapons } from "@data/lab";
import type { Building, Park, Tree } from "@utils/arenaLayout";
import { segmentHitsAabb } from "@utils/collision";
import { recordStat } from "@utils/progressStore";

import { useGameFrame } from "../hooks/useGameFrame";
import { useRoam } from "./roamContext";
import { recordTower } from "./roamStore";
import { createTowerGeometry, createTowerMaterial, towerAttributes } from "./towerMaterial";

/** Grid cells are about this wide, whatever the arena size. */
const GRID_CELL = 14;
/** Ground extends past the playable radius so the edge never shows. */
const GROUND_OVERSHOOT = 1.4;
const BOUNDARY_SEGMENTS = 128;
const BOUNDARY_HEIGHT = 1.5;
/** Towers sit this far from the background toward the text color before their palette tint. */
const TOWER_TINT: [number, number] = [0.08, 0.16];
/** By night the floor sits below the background so the key light brings it back to it, not past it. */
const GROUND_NIGHT_DARKEN = 0.55;
const GROUND_DAY_TINT = 0.03;
/** Lit windows glow this much on a dark preset; by day they barely read. */
const WINDOW_GLOW_NIGHT = 1.7;
const WINDOW_GLOW_DAY = 0.25;
/** Fraction of the "dense" tree count planted at "sparse". */
const SPARSE_TREES = 0.4;

const dummy = new THREE.Object3D();
const scratchColor = new THREE.Color();

/** Static arena: ground and grid, a faint boundary ring, the parks and trees, and the instanced towers. */
export function Arena() {
  const { config, lighting, layout, effects } = useRoam();
  const { radius } = config.arena;
  const size = radius * 2 * GROUND_OVERSHOOT;
  const line = lighting.core.color;
  const ground = useMemo(() => {
    const background = new THREE.Color(lighting.background);
    return luminance(lighting.background) < 0.5
      ? background.lerp(new THREE.Color("#000000"), GROUND_NIGHT_DARKEN)
      : background.lerp(new THREE.Color(lighting.text), GROUND_DAY_TINT);
  }, [lighting]);
  const treeCount =
    effects.foliage === "off" ? 0 : effects.foliage === "sparse" ? Math.round(layout.trees.length * SPARSE_TREES) : layout.trees.length;

  return (
    <group>
      <gridHelper
        args={[size, Math.round(size / GRID_CELL), line, line]}
        position={[0, 0.01, 0]}
        material-transparent
        material-opacity={0.2}
        material-depthWrite={false}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color={ground} roughness={1} metalness={0} />
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
      {treeCount > 0 && <Parks parks={layout.parks} />}
      {treeCount > 0 && <Trees trees={layout.trees} count={treeCount} />}
      <Buildings buildings={layout.buildings} />
    </group>
  );
}

/** Towers shrink out over this long when destroyed. */
const COLLAPSE_S = 0.5;
/** Debris size for a felled tower, relative to a fighter. */
const COLLAPSE_BURST = 4;

type BuildingsProps = { buildings: ReadonlyArray<Building> };

/**
 * One instanced mesh for every tower, each with its district's hue and a
 * procedural facade. Bolts stop on towers; heavy ones (plasma) take health
 * off them (the facade darkens, its lights go out) and a tower with none
 * left collapses.
 */
function Buildings({ buildings }: BuildingsProps) {
  const { lighting, effects, simRef, progress, config, arenaRef, store } = useRoam();
  const mesh = useRef<THREE.InstancedMesh>(null);
  /** Per-tower collapse progress in [0, 1]; absent while standing. */
  const collapsing = useRef(new Map<number, number>());
  const { world } = config;

  const night = luminance(lighting.background) < 0.5;
  const windowGlow = effects.windows ? (night ? WINDOW_GLOW_NIGHT : WINDOW_GLOW_DAY) : 0;
  const material = useMemo(
    () =>
      createTowerMaterial({
        windowColor: world.windowColor,
        windowGlow,
        litFraction: world.windowLitFraction,
        cellSize: world.windowCell,
      }),
    [world, windowGlow],
  );
  useEffect(() => () => material.dispose(), [material]);

  const geometry = useMemo(() => createTowerGeometry(Math.max(1, buildings.length)), [buildings.length]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    const instanced = mesh.current;
    if (!instanced) return;
    const attrs = towerAttributes(instanced.geometry);
    const base = new THREE.Color(lighting.background);
    const ink = new THREE.Color(lighting.text);
    buildings.forEach((b, i) => {
      writeTower(instanced, i, b, 1);
      attrs.size.setXYZ(i, b.size[0], b.size[1], b.size[2]);
      attrs.seed.setX(i, b.seed);
      attrs.damage.setX(i, 0);
      const palette = world.towerPalette[Math.floor(b.tint * world.towerPalette.length) % world.towerPalette.length];
      scratchColor
        .copy(base)
        .lerp(ink, TOWER_TINT[0] + (TOWER_TINT[1] - TOWER_TINT[0]) * b.seed)
        .lerp(new THREE.Color(palette), world.towerPaletteMix);
      instanced.setColorAt(i, scratchColor);
    });
    instanced.count = buildings.length;
    instanced.instanceMatrix.needsUpdate = true;
    attrs.size.needsUpdate = true;
    attrs.seed.needsUpdate = true;
    attrs.damage.needsUpdate = true;
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
  }, [buildings, lighting, world]);

  useGameFrame((_, delta) => {
    const instanced = mesh.current;
    if (!instanced) return;
    const attrs = towerAttributes(instanced.geometry);
    const sim = simRef.current;
    const { towers } = arenaRef.current;
    let dirty = false;
    let damaged = false;

    for (let b = 0; b < sim.lasers.length; b++) {
      const bolt = sim.lasers[b];
      if (!bolt.active) continue;
      for (let i = 0; i < towers.length; i++) {
        const tower = towers[i];
        if (!tower.alive) continue;
        const hit = segmentHitsAabb(bolt.prev, bolt.position, tower.box);
        if (!hit) continue;
        bolt.active = false;
        const color = lighting.statusColors[weapons[bolt.weapon].color];
        if (bolt.heavy) {
          const dealt = Math.min(bolt.damage, tower.health);
          tower.health -= dealt;
          recordStat(progress, "damageDealt", dealt);
          sim.bursts.push({ position: hit, color, size: 1 });
          attrs.damage.setX(i, 1 - tower.health / tower.maxHealth);
          damaged = true;
          if (tower.health <= 0) {
            tower.alive = false;
            collapsing.current.set(i, 0);
            sim.bursts.push({ position: tower.center, color, size: COLLAPSE_BURST });
            recordTower(store, config.scoring.tower);
            recordStat(progress, "towersDestroyed");
            recordStat(progress, "points", config.scoring.tower);
          }
        } else {
          sim.bursts.push({ position: hit, color, size: 0.2 });
        }
        break;
      }
    }

    collapsing.current.forEach((t, i) => {
      const next = Math.min(1, t + delta / COLLAPSE_S);
      writeTower(instanced, i, buildings[i], 1 - next);
      dirty = true;
      if (next >= 1) collapsing.current.delete(i);
      else collapsing.current.set(i, next);
    });
    if (dirty) instanced.instanceMatrix.needsUpdate = true;
    if (damaged) attrs.damage.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, material, Math.max(1, buildings.length)]}
      castShadow
      receiveShadow
      frustumCulled={false}
    />
  );
}

/** Writes a tower's matrix at `scale` of its full height (1 = standing, 0 = gone). */
function writeTower(instanced: THREE.InstancedMesh, index: number, b: Building, scale: number) {
  dummy.position.set(b.position[0], (b.size[1] * scale) / 2, b.position[2]);
  dummy.scale.set(b.size[0] * scale, b.size[1] * scale, b.size[2] * scale);
  dummy.updateMatrix();
  instanced.setMatrixAt(index, dummy.matrix);
}

function luminance(hex: string): number {
  const c = new THREE.Color(hex);
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}

/** Grass discs under the tree clusters. */
function Parks({ parks }: { parks: ReadonlyArray<Park> }) {
  const { config } = useRoam();
  return (
    <>
      {parks.map((park, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[park.position[0], 0.03, park.position[2]]} receiveShadow>
          <circleGeometry args={[park.radius, 48]} />
          <meshStandardMaterial color={config.world.grassColor} roughness={1} />
        </mesh>
      ))}
    </>
  );
}

/** Canopy footprint relative to tree height. */
const CANOPY_WIDTH = 0.5;
const CANOPY_HEIGHT = 0.62;
const TRUNK_RADIUS = 0.2;

type TreesProps = { trees: ReadonlyArray<Tree>; count: number };

/** Two instanced meshes (trunks, canopies) for the first `count` trees of the layout. */
function Trees({ trees, count }: TreesProps) {
  const { config } = useRoam();
  const trunks = useRef<THREE.InstancedMesh>(null);
  const canopies = useRef<THREE.InstancedMesh>(null);
  const { canopyPalette } = config.world;

  useEffect(() => {
    const trunkMesh = trunks.current;
    const canopyMesh = canopies.current;
    if (!trunkMesh || !canopyMesh) return;
    for (let i = 0; i < count; i++) {
      const tree = trees[i];
      const trunkHeight = tree.height * (1 - CANOPY_HEIGHT * 0.7);
      dummy.position.set(tree.position[0], trunkHeight / 2, tree.position[2]);
      dummy.scale.set(TRUNK_RADIUS, trunkHeight, TRUNK_RADIUS);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      trunkMesh.setMatrixAt(i, dummy.matrix);

      const canopyHeight = tree.height * CANOPY_HEIGHT;
      dummy.position.set(tree.position[0], tree.height - canopyHeight / 2, tree.position[2]);
      dummy.scale.set(tree.height * CANOPY_WIDTH, canopyHeight, tree.height * CANOPY_WIDTH);
      dummy.rotation.set(0, tree.tint * Math.PI * 2, 0);
      dummy.updateMatrix();
      canopyMesh.setMatrixAt(i, dummy.matrix);
      canopyMesh.setColorAt(i, scratchColor.set(canopyPalette[Math.floor(tree.tint * canopyPalette.length) % canopyPalette.length]));
    }
    trunkMesh.count = count;
    canopyMesh.count = count;
    trunkMesh.instanceMatrix.needsUpdate = true;
    canopyMesh.instanceMatrix.needsUpdate = true;
    if (canopyMesh.instanceColor) canopyMesh.instanceColor.needsUpdate = true;
  }, [trees, count, canopyPalette]);

  const capacity = Math.max(1, trees.length);
  return (
    <>
      <instancedMesh ref={trunks} args={[undefined, undefined, capacity]} frustumCulled={false}>
        <cylinderGeometry args={[0.7, 1, 1, 5]} />
        <meshStandardMaterial color={config.world.trunkColor} roughness={1} />
      </instancedMesh>
      <instancedMesh ref={canopies} args={[undefined, undefined, capacity]} castShadow frustumCulled={false}>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial roughness={0.95} flatShading />
      </instancedMesh>
    </>
  );
}
