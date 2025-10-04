// src/lib/Asteroid.ts
import * as THREE from "three";
import { createPlanet } from "./Planet";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { 
  getOrbitPosition, 
  createOrbitLine, 
  mapOrbitalDataToElements,
  createCloseApproachMarkers,
  createAsteroidMesh,
  toScaledValue
} from "../simulacion/AsteroidOrbital";
import type { OrbitalElements, OrbitalDataAPI } from "../simulacion/AsteroidOrbital";

interface CloseApproach {
  daysFromEpoch: number;
  label?: string;
}

interface AsteroidOptions {
  scene?: THREE.Scene;
  name?: string;
  radiusKm?: number;
  color?: number;
  orbitalData?: OrbitalDataAPI; // Pasamos el orbital_data de la API
  closeApproaches?: CloseApproach[];
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

  // --- Mapear a OrbitalElements usando utilitario ---
  const orbitalElements: OrbitalElements = mapOrbitalDataToElements(orbitalData);

  // Grupo principal
  const asteroidGroup = new THREE.Group();
  asteroidGroup.name = name;

  // --- Crear malla del asteroide ---
  const asteroidMesh = createAsteroidMesh(
    getOrbitPosition(orbitalElements, 0),
    radiusKm,
    color
  );
  asteroidGroup.add(asteroidMesh);

  // --- Dibujar órbita ---
  if (options?.scene) {
    const orbitLine = createOrbitLine(orbitalElements, color, 360);
    options.scene.add(orbitLine);
  }

  // --- Labels ---
  if (options?.scene) {
    const labelDiv = document.createElement("div");
    labelDiv.className = "label";
    labelDiv.textContent = name;
    asteroidGroup.add(new CSS2DObject(labelDiv));
  }

  // --- Close Approaches ---
  if (options?.scene && options.closeApproaches) {
    const markers = createCloseApproachMarkers(orbitalElements, options.closeApproaches, 0x00ff00, 0.5);
    markers.forEach(m => {
      const markerMesh = new THREE.Mesh(
        new THREE.SphereGeometry(toScaledValue(0.2), 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x00ff00 })
      );
      markerMesh.position.copy(m.position);
      asteroidGroup.add(markerMesh);

      if (m.label) {
        const labelDiv = document.createElement("div");
        labelDiv.className = "label";
        labelDiv.textContent = m.label;
        markerMesh.add(new CSS2DObject(labelDiv));
      }
    });
  }

  // Guardamos orbitalData para referencia
  (asteroidGroup as any).orbitalData = orbitalData;
  (asteroidGroup as any).orbitalElements = orbitalElements;

  return asteroidGroup;
}
