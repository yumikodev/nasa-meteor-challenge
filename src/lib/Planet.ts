import * as THREE from "three";
import { toScaledValue, getOrbitPosition, createOrbitLine } from "./orbital";
import type { OrbitalElements } from "./orbital";

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

  const radius = 25;
  const geometryX = new THREE.SphereGeometry(radius, 32, 32);
  const materialX = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.25
  });
  const planetPoint = new THREE.Mesh(geometryX, materialX);
  planetPoint.name = `${name}Point`;
  group.add(planetPoint);



// --- En tu update/animate ---
(group as any).update = (camera: THREE.Camera, daysElapsed?: number) => {
  // ... resto de actualización orbital ...

  // hacer que el círculo siempre mire a la cámara
  planetPoint.lookAt(camera.position);
};




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
