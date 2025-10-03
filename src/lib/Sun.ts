import * as THREE from "three";
import { createPlanet } from "./Planet";

export function createSun(): THREE.Group {
  return createPlanet("Sun", 696340, 0xffff00);
}

export function updateSun(sunGroup: THREE.Group) {
  const sunMesh = sunGroup.getObjectByName("SunMesh") as THREE.Mesh;
  if (sunMesh) {
    sunMesh.rotation.y += 0.002; // rotación lenta del sol
  }
}
