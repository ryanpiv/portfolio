"use client";

import { useEffect, useMemo, useRef } from "react";
import { BallCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";

import { Nameplate } from "@components/LabScene";
import type { Project } from "@data/projects";
import type { FieldBody } from "@utils/fieldLayout";

import { useField } from "../fieldContext";
import { Tether } from "../constraints/Tether";
import { StarHalo } from "./StarHalo";
import { useBodyMotion } from "./useBodyMotion";
import { usePointerDrag } from "./usePointerDrag";

type ProjectSphereProps = {
  project: Project;
  body: FieldBody;
  coreRef?: React.RefObject<RapierRigidBody>;
};

/** Stable per-body twinkle phase derived from the slug. */
function phaseFor(slug: string): number {
  return [...slug].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % (Math.PI * 2);
}

/** One project as a physical, grabbable, glowing sphere. */
export function ProjectSphere({ project, body, coreRef }: ProjectSphereProps) {
  const { settings, bodies, hovered, dragging, setHovered, setDragging, onSelect } = useField();
  const { physics, lighting, constraint, view } = settings;

  const rigid = useRef<RapierRigidBody>(null!);
  const material = useRef<THREE.MeshPhysicalMaterial>(null!);

  const isHovered = hovered === project.slug;
  const isDragging = dragging === project.slug;
  const lit = isHovered || isDragging;
  const color = lighting.statusColors[project.status];
  const emissive = useMemo(() => new THREE.Color(color), [color]);
  const phase = useMemo(() => phaseFor(project.slug), [project.slug]);
  const showNameplate = view.nameplates === "always" || (view.nameplates === "hover" && lit);

  useEffect(() => {
    bodies.set(project.slug, rigid);
    return () => {
      bodies.delete(project.slug);
    };
  }, [bodies, project.slug]);

  const drag = usePointerDrag({
    bodyRef: rigid,
    onDragStart: () => setDragging(project.slug),
    onDragEnd: () => setDragging(null),
    onClick: () => onSelect(project.slug),
  });

  useBodyMotion({
    bodyRef: rigid,
    materialRef: material,
    physics,
    sphere: lighting.sphere,
    dragTarget: drag.dragTarget,
    hovered: isHovered,
    lit,
  });

  return (
    <RigidBody
      ref={rigid}
      colliders={false}
      position={body.position}
      linearVelocity={body.velocity}
      linearDamping={physics.linearDamping}
      angularDamping={physics.angularDamping}
      restitution={physics.restitution}
      friction={physics.friction}
      canSleep={false}
      ccd
    >
      <BallCollider args={[body.radius]} mass={body.mass} />
      <mesh
        castShadow
        receiveShadow
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(project.slug);
        }}
        onPointerOut={() => {
          if (!drag.isDragging()) setHovered(null);
        }}
        {...drag.handlers}
      >
        <sphereGeometry args={[body.radius, 48, 48]} />
        <meshPhysicalMaterial
          ref={material}
          color={color}
          emissive={emissive}
          emissiveIntensity={lighting.sphere.emissiveIntensity}
          roughness={lighting.sphere.roughness}
          metalness={lighting.sphere.metalness}
          clearcoat={lighting.sphere.clearcoat}
          clearcoatRoughness={0.2}
        />
      </mesh>
      <StarHalo radius={body.radius} color={color} halo={lighting.halo} phase={phase} boosted={lit} />
      {showNameplate && (
        <Nameplate label={project.title} radius={body.radius} color={lighting.text} emphasized={isHovered} />
      )}
      {constraint.kind === "tether" && coreRef && (
        <Tether bodyRef={rigid} coreRef={coreRef} constraint={constraint} />
      )}
    </RigidBody>
  );
}
