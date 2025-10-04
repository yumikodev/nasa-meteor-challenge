// Asteroid.ts
import * as THREE from "three";
import { createPlanet } from "./Planet";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { getOrbitPosition, createOrbitLine } from "../simulacion/AsteroidOrbital";
import type { OrbitalDataAPI, OrbitalElements } from "../simulacion/AsteroidOrbital";

interface AsteroidOptions {
  scene?: THREE.Scene;
  name?: string;
  radiusKm?: number;
  color?: number;
  orbitalData?: OrbitalDataAPI; // Pasamos el orbital_data de la API
  maxTrailPoints?: number;
}

// --- Crear asteroide ---
export function createAsteroid(options?: AsteroidOptions): THREE.Group {
  const name = options?.name || "Asteroid-1";
  const radiusKm = options?.radiusKm ?? 0.25;
  const color = options?.color ?? 0xffaa00;
  const orbitalData = options?.orbitalData;

  if (!orbitalData) {
    throw new Error("Debe proveerse orbitalData con los datos del asteroide");
  }

  // --- Mapear a OrbitalElements para precisión ---
  const orbitalElements: OrbitalElements = {
    a: parseFloat(orbitalData.semi_major_axis),
    e: parseFloat(orbitalData.eccentricity),
    i: parseFloat(orbitalData.inclination),
    omega: parseFloat(orbitalData.ascending_node_longitude),
    w: parseFloat(orbitalData.perihelion_argument),
    M0: parseFloat(orbitalData.mean_anomaly),
    epoch: parseFloat(orbitalData.epoch_osculation),
    period: parseFloat(orbitalData.orbital_period),
    tp: orbitalData.perihelion_time ? parseFloat(orbitalData.perihelion_time) : undefined
  };

  // Grupo principal
  const asteroid = createPlanet({
    name,
    radiusKm,
    color,
    orbitalElements,
    scene: options?.scene,
    maxTrailPoints: options?.maxTrailPoints ?? 500
  });

  // Guardamos orbitalData para referencia
  (asteroid as any).orbitalData = orbitalData;

  // --- Dibujar órbita completa ---
  if (options?.scene) {
    const orbitLine = createOrbitLine(orbitalElements, color, 360);
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

// --- Actualizar posición ---
export function updateAsteroid(asteroidGroup: THREE.Group, daysElapsed: number) {
  const orbitalData = (asteroidGroup as any).orbitalData as OrbitalDataAPI;
  if (!orbitalData) return;

  const elements: OrbitalElements = {
    a: parseFloat(orbitalData.semi_major_axis),
    e: parseFloat(orbitalData.eccentricity),
    i: parseFloat(orbitalData.inclination),
    omega: parseFloat(orbitalData.ascending_node_longitude),
    w: parseFloat(orbitalData.perihelion_argument),
    M0: parseFloat(orbitalData.mean_anomaly),
    epoch: parseFloat(orbitalData.epoch_osculation),
    period: parseFloat(orbitalData.orbital_period),
    tp: orbitalData.perihelion_time ? parseFloat(orbitalData.perihelion_time) : undefined
  };

  const pos = getOrbitPosition(elements, daysElapsed);
  asteroidGroup.position.copy(pos);

  const mesh = asteroidGroup.getObjectByName(asteroidGroup.name + "Mesh") as THREE.Mesh;
  if (mesh?.visible) {
    mesh.rotation.y += 0.02;
    mesh.rotation.x += 0.01;
  }

  const point = asteroidGroup.getObjectByName(asteroidGroup.name + "Point") as THREE.Points;
  if (point) {
    const cameraDistance = asteroidGroup.parent?.getObjectByProperty("type", "Camera")?.position.distanceTo(asteroidGroup.position) ?? 100;
    point.visible = !mesh.visible;
    (point.material as THREE.PointsMaterial).size = Math.min(cameraDistance * 0.05, 50);
  }
}
