// src/lib/Asteroid.ts
import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { 
  getOrbitPosition, 
  createOrbitLine, 
  mapOrbitalDataToElements,
  createCloseApproachMarkers,
  createAsteroidMesh,
  toScaledValue
} from "./AsteroidOrbital";
import type { OrbitalElements, OrbitalDataAPI } from "./AsteroidOrbital";
import type { AsteroidDetail, AsteroidMetadataDetail } from "./interfaces/asteroid.interfaces";

interface CloseApproach {
  daysFromEpoch: number;
  label?: string;
}

interface AsteroidOptions {
  scene?: THREE.Scene;
  orbitalData: OrbitalDataAPI;             // Pasamos el orbital_data de la API
  metadata: AsteroidMetadataDetail;       // Nombre real y otros datos
  detail: AsteroidDetail;
  closeApproaches?: CloseApproach[];
}

// --- Crear asteroide realista ---
export function createAsteroid(options: AsteroidOptions): THREE.Group {
  const { orbitalData, metadata, detail, scene, closeApproaches } = options;

  if (!orbitalData) {
    throw new Error("Debe proveerse orbitalData con los datos del asteroide");
  }
  if (!detail?.name) {
    throw new Error("Debe proveerse el nombre real del asteroide en metadata.name");
  }

  // --- Mapear a OrbitalElements ---
  const orbitalElements: OrbitalElements = mapOrbitalDataToElements(orbitalData);

  // Grupo principal del asteroide
  const asteroidGroup = new THREE.Group();
  asteroidGroup.name = detail.name;

  // --- Crear malla del asteroide (blanco) ---
  const diameterKm = (metadata.estimatedDiameterKm.min + metadata.estimatedDiameterKm.max) / 2;
  const asteroidMesh = createAsteroidMesh(
    getOrbitPosition(orbitalElements, 0),
    diameterKm
  );
  asteroidGroup.add(asteroidMesh);

  // --- Dibujar órbita (blanca) ---
  if (scene) {
    const orbitLine = createOrbitLine(orbitalElements);
    scene.add(orbitLine);
  }

  // --- Label con nombre real ---
  if (scene) {
    const labelDiv = document.createElement("div");
    labelDiv.className = "label";
    labelDiv.textContent = detail.name;
    asteroidGroup.add(new CSS2DObject(labelDiv));
  }

  // --- Close Approaches (blanco) ---
  if (scene && closeApproaches) {
    const markers = createCloseApproachMarkers(orbitalElements, closeApproaches);
    markers.forEach(m => {
      const markerMesh = new THREE.Mesh(
        new THREE.SphereGeometry(toScaledValue(0.2), 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
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

  // Guardamos referencia a datos y elementos
  (asteroidGroup as any).orbitalData = orbitalData;
  (asteroidGroup as any).orbitalElements = orbitalElements;

  return asteroidGroup;
}
