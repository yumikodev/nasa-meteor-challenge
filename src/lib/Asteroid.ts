import * as THREE from "three";
import { createPlanet } from "./Planet";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import type { OrbitalElements } from "../simulacion/orbital";
import { getOrbitPosition, createOrbitLine } from "../simulacion/orbital";

const defaultAsteroidElements: OrbitalElements = {
  a: 1.3,       // AU
  e: 0.1,
  i: 5,
  omega: 80,
  w: 250,
  M0: 0,
  epoch: 2451545.0,
  period: 500
};

interface AsteroidOptions {
  scene?: THREE.Scene;
  name?: string;
  radiusKm?: number;
  color?: number;
  orbitalElements?: OrbitalElements;
  maxTrailPoints?: number;
}

// --- Crear asteroide ---
export function createAsteroid(options?: AsteroidOptions): THREE.Group {
  const name = options?.name || "Asteroid-1";
  const radiusKm = options?.radiusKm ?? 0.25;
  const color = options?.color ?? 0xffaa00;
  const orbitalElements = options?.orbitalElements ?? defaultAsteroidElements;
  const maxTrailPoints = options?.maxTrailPoints ?? 500;

  // Grupo principal del asteroide
  const asteroid = createPlanet({
    name,
    radiusKm,
    color,
    orbitalElements,
    scene: options?.scene,
    maxTrailPoints
  });

  // Guardamos orbitalElements en el grupo
  (asteroid as any).orbitalElements = orbitalElements;

  // --- Dibujar órbita completa ---
  if (options?.scene) {
    const orbitLine = createOrbitLine(orbitalElements, 0xffaa00, 360);
    options.scene.add(orbitLine);
  }

  // --- Label ---
  if (options?.scene) {
    const labelDiv = document.createElement("div");
    labelDiv.className = "label";
    labelDiv.textContent = name;
    asteroid.add(new CSS2DObject(labelDiv));
  }

  return asteroid;
}

// --- Actualizar asteroide ---
export function updateAsteroid(asteroidGroup: THREE.Group, daysElapsed: number) {
  const orbitalElements = (asteroidGroup as any).orbitalElements as OrbitalElements;
  if (orbitalElements) {
    const pos = getOrbitPosition(orbitalElements, daysElapsed);
    asteroidGroup.position.copy(pos);
  }

  const mesh = asteroidGroup.getObjectByName((asteroidGroup as any).name + "Mesh") as THREE.Mesh;
  if (mesh?.visible) {
    mesh.rotation.y += 0.02;
    mesh.rotation.x += 0.01;
  }

  const point = asteroidGroup.getObjectByName((asteroidGroup as any).name + "Point") as THREE.Points;
  if (point) {
    const cameraDistance = asteroidGroup.parent?.getObjectByProperty("type", "Camera")?.position.distanceTo(asteroidGroup.position) ?? 100;
    point.visible = !mesh.visible;
    (point.material as THREE.PointsMaterial).size = Math.min(cameraDistance * 0.05, 50);
  }
}
