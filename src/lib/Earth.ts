import * as THREE from "three";
import { getEarthOrbitPosition } from "../simulacion/orbital";
import { createPlanet } from "./Planet";

export function createEarth(): THREE.Group {
  return createPlanet("Earth", 6371, 0x0000ff);
}

export function updateEarth(earthGroup: THREE.Group, daysElapsed: number) {
  const earthMesh = earthGroup.getObjectByName("EarthMesh") as THREE.Mesh;

  // Orbita alrededor del Sol
  earthGroup.position.copy(getEarthOrbitPosition(daysElapsed));

  // Rotación sobre su eje
  if (earthMesh?.visible) {
    earthMesh.rotation.y += 0.01;
  }
}
