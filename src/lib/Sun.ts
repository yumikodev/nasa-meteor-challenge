import * as THREE from "three";
import { createPlanet } from "./Planet";

// --- Crear Sol ---
export function createSun(): THREE.Group {
  return createPlanet({
    name: "Sun",
    radiusKm: 696_340,
    color: 0xffff00
    // No necesita orbitalElements; el sol queda fijo en el origen
  });
}

// --- Actualizar Sol ---
export function updateSun(sunGroup: THREE.Group) {
  const sunMesh = sunGroup.getObjectByName("SunMesh") as THREE.Mesh;
  if (sunMesh) {
    sunMesh.rotation.y += 0.002; // rotación lenta del sol
  }
}
