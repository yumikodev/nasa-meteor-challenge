import * as THREE from "three";
import { toScaledValue, getOrbitPosition, createOrbitLine } from "../simulacion/orbital";
import type { OrbitalElements } from "../simulacion/orbital";

interface PlanetOptions {
  name: string;
  radiusKm: number;
  color: number;
  orbitalElements?: OrbitalElements;
  scene?: THREE.Scene;
  maxTrailPoints?: number; // número de puntos que conserva la trayectoria
}

export function createPlanet({
  name,
  radiusKm,
  color,
  orbitalElements,
  scene,
  maxTrailPoints = 500
}: PlanetOptions): THREE.Group {
  const group = new THREE.Group();
  const radiusScaled = toScaledValue(radiusKm);

  // --- Esfera del planeta con brillo ---
  const geometry = new THREE.SphereGeometry(radiusScaled, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.7
  });
  const planetMesh = new THREE.Mesh(geometry, material);
  planetMesh.name = `${name}Mesh`;
  group.add(planetMesh);

  // --- Punto de referencia ---
  const pointGeometry = new THREE.SphereGeometry(16, 16, 16);
  pointGeometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0], 3));
  const pointMaterial = new THREE.PointsMaterial({ color, size: 10, sizeAttenuation: true });
  const planetPoint = new THREE.Points(pointGeometry, pointMaterial);
  planetPoint.name = `${name}Point`;
  group.add(planetPoint);

  // --- Trayectoria dinámica (trail) ---
  let trailPositions: THREE.Vector3[] = [];
  let trailLine: THREE.Line | undefined;
  if (scene) {
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
    trailLine = new THREE.Line(trailGeometry, trailMaterial);
    trailLine.name = `${name}TrailLine`;
    scene.add(trailLine);

    // --- Dibuja la órbita completa fija ---
    if (orbitalElements) {
      const orbitLine = createOrbitLine(orbitalElements, color, 360);
      scene.add(orbitLine);
    }
  }

  // --- Actualización ---
  (group as any).update = (camera: THREE.Camera, daysElapsed?: number) => {
    const distance = camera.position.distanceTo(group.position);

    // Mostrar esfera si está cerca, punto si está lejos
    planetMesh.visible = distance < radiusScaled * 20;
    planetPoint.visible = !planetMesh.visible;
    if (planetPoint.visible) {
      (pointMaterial as THREE.PointsMaterial).size = Math.min(distance * 0.05, 50);
    }

    // Actualizar posición orbital
    if (orbitalElements && daysElapsed !== undefined) {
      const pos = getOrbitPosition(orbitalElements, daysElapsed);
      group.position.copy(pos);

      // --- Actualizar trayecto dinámico ---
      if (trailLine) {
        trailPositions.push(pos.clone());
        if (trailPositions.length > maxTrailPoints) trailPositions.shift();

        const array = new Float32Array(trailPositions.length * 3);
        trailPositions.forEach((v, i) => {
          array[i * 3] = v.x;
          array[i * 3 + 1] = v.y;
          array[i * 3 + 2] = v.z;
        });
        (trailLine.geometry as THREE.BufferGeometry).setAttribute(
          "position",
          new THREE.BufferAttribute(array, 3)
        );
        (trailLine.geometry as THREE.BufferGeometry).computeBoundingSphere();
      }
    }
  };

  return group;
}
