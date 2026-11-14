import * as THREE from "three";

/**
 * Standard material for the instanced towers with a procedural facade:
 * a grid of windows on the side faces, a fraction of them lit (emissive,
 * so bloom catches them), thin floor bands, and a per-instance damage
 * value that darkens the hull and puts the lights out. Per-instance data
 * rides on three instanced attributes next to the instance matrix:
 *
 * - `aSize`   full extents, so the window grid is in world units whatever the box scale
 * - `aSeed`   hashes the lit-window pattern
 * - `aDamage` 0 standing, 1 wrecked
 *
 * Instance color (`setColorAt`) supplies the hull tint.
 */

type TowerUniforms = {
  uWindowColor: { value: THREE.Color };
  uWindowGlow: { value: number };
  uLitFraction: { value: number };
  uCellSize: { value: THREE.Vector2 };
};

export type TowerMaterialOptions = {
  windowColor: string;
  /** Emissive strength; above the bloom threshold it glows. */
  windowGlow: number;
  litFraction: number;
  cellSize: [width: number, height: number];
};

const VERTEX_HEAD = /* glsl */ `
attribute vec3 aSize;
attribute float aSeed;
attribute float aDamage;
varying vec3 vTowerLocal;
varying vec3 vTowerNormal;
varying vec3 vTowerSize;
varying float vTowerSeed;
varying float vTowerDamage;
`;

const VERTEX_BODY = /* glsl */ `
vTowerLocal = position * aSize;
vTowerNormal = normal;
vTowerSize = aSize;
vTowerSeed = aSeed;
vTowerDamage = aDamage;
`;

const FRAGMENT_HEAD = /* glsl */ `
uniform vec3 uWindowColor;
uniform float uWindowGlow;
uniform float uLitFraction;
uniform vec2 uCellSize;
varying vec3 vTowerLocal;
varying vec3 vTowerNormal;
varying vec3 vTowerSize;
varying float vTowerSeed;
varying float vTowerDamage;

// Integer-friendly hash (no sin): interpolated varyings carry tiny per-fragment
// error, and a sin-based hash turns that into pixel noise. Inputs are rounded
// to whole numbers first so every fragment in a cell agrees.
float towerHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
`;

const FRAGMENT_BODY = /* glsl */ `
{
  vec3 n = abs(vTowerNormal);
  float side = step(n.y, 0.5);
  bool xFace = n.x > 0.5;
  vec2 p = xFace ? vec2(vTowerLocal.z, vTowerLocal.y) : vec2(vTowerLocal.x, vTowerLocal.y);
  vec2 extent = xFace ? vec2(vTowerSize.z, vTowerSize.y) : vec2(vTowerSize.x, vTowerSize.y);
  p += extent * 0.5;
  vec2 cells = floor(extent / uCellSize);
  vec2 cell = floor(p / uCellSize);
  vec2 f = fract(p / uCellSize);
  float pane = step(0.24, f.x) * step(f.x, 0.76) * step(0.3, f.y) * step(f.y, 0.74);
  float margin = step(0.5, cell.x) * step(cell.x, cells.x - 1.5) * step(0.5, cell.y) * step(cell.y, cells.y - 1.5);
  float window = side * pane * margin;
  float faceId = xFace ? sign(vTowerNormal.x) : sign(vTowerNormal.z) * 2.0;
  float seed = floor(vTowerSeed * 1024.0 + 0.5);
  float h = towerHash(cell + vec2(seed, floor(faceId + 0.5) * 13.0));
  float lit = step(1.0 - uLitFraction, h);
  float band = 1.0 - 0.14 * side * step(0.92, f.y);
  diffuseColor.rgb *= band * (1.0 - 0.55 * vTowerDamage) * (1.0 - 0.4 * window);
  totalEmissiveRadiance += uWindowColor * uWindowGlow * window * lit * (1.0 - vTowerDamage) * (0.65 + 0.35 * h);
}
`;

export function createTowerMaterial({
  windowColor,
  windowGlow,
  litFraction,
  cellSize,
}: TowerMaterialOptions): THREE.MeshStandardMaterial {
  const uniforms: TowerUniforms = {
    uWindowColor: { value: new THREE.Color(windowColor) },
    uWindowGlow: { value: windowGlow },
    uLitFraction: { value: litFraction },
    uCellSize: { value: new THREE.Vector2(cellSize[0], cellSize[1]) },
  };
  const material = new THREE.MeshStandardMaterial({ roughness: 0.82, metalness: 0.12 });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${VERTEX_HEAD}`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>\n${VERTEX_BODY}`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${FRAGMENT_HEAD}`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>\n${FRAGMENT_BODY}`);
  };
  material.customProgramCacheKey = () => "tower-facade";
  return material;
}

/** A unit box carrying the per-instance attributes the facade shader reads. */
export function createTowerGeometry(count: number): THREE.BoxGeometry {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const damage = new THREE.InstancedBufferAttribute(new Float32Array(count), 1);
  damage.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("aSize", new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute("aSeed", new THREE.InstancedBufferAttribute(new Float32Array(count), 1));
  geometry.setAttribute("aDamage", damage);
  return geometry;
}

/** The facade attributes back off a geometry made by `createTowerGeometry`. */
export function towerAttributes(geometry: THREE.BufferGeometry): TowerAttributes {
  return {
    size: geometry.getAttribute("aSize") as THREE.InstancedBufferAttribute,
    seed: geometry.getAttribute("aSeed") as THREE.InstancedBufferAttribute,
    damage: geometry.getAttribute("aDamage") as THREE.InstancedBufferAttribute,
  };
}

export type TowerAttributes = {
  size: THREE.InstancedBufferAttribute;
  seed: THREE.InstancedBufferAttribute;
  damage: THREE.InstancedBufferAttribute;
};
