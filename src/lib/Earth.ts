import * as THREE from "three";
import { createPlanet } from "./Planet";
import { earthOrbitalElements, getOrbitPosition } from "./orbital";

interface EarthOptions {
  scene?: THREE.Scene;
}

// --- Crear Tierra ---
export function createEarth(options?: EarthOptions): THREE.Group {
  const earth = createPlanet({
    name: "Earth",
    radiusKm: 6371,
    color: 0x0000ff,
    orbitalElements: earthOrbitalElements,
    scene: options?.scene,        // <-- pasar scene para que cree la trayectoria dinámica
    maxTrailPoints: 1000          // <-- opcional: más puntos para una trayectoria más larga
  });

  // --- Inclinación axial ---
  const earthMesh = earth.getObjectByName("EarthMesh") as THREE.Mesh;
  if (earthMesh) {
    earthMesh.rotation.z = THREE.MathUtils.degToRad(23.44);
    // Brillo propio
    (earthMesh.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0x1111ff);
    (earthMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5;
  }

  return earth;
}

// --- Actualizar ---
export function updateEarth(earthGroup: THREE.Group, daysElapsed: number) {
  const earthMesh = earthGroup.getObjectByName("EarthMesh") as THREE.Mesh;

  // Posición orbital
  earthGroup.position.copy(getOrbitPosition(earthOrbitalElements, daysElapsed));

  // Rotación axial
  if (earthMesh?.visible) earthMesh.rotation.y += 0.01;
}
