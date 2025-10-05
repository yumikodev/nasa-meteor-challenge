// src/lib/Asteroid.ts
import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { 
  getOrbitPosition, 
  createOrbitLine, 
  mapOrbitalDataToElements,
  createAsteroidMesh,
  toScaledValue
} from "./AsteroidOrbital";
import type { OrbitalElements, OrbitalDataAPI } from "./AsteroidOrbital";
import type { AsteroidDetails, EstimatedDiameter } from "./interfaces/asteroid.interfaces";

interface AsteroidOptions {
  scene?: THREE.Scene;
  orbitalData: OrbitalDataAPI;      
  detail: AsteroidDetails;
  estimatedDiameterKm: EstimatedDiameter;
}

// --- Crear asteroide simplificado ---
export function createAsteroid(options: AsteroidOptions): THREE.Group {
  const { orbitalData, estimatedDiameterKm, detail, scene } = options;

  if (!orbitalData) throw new Error("Debe proveerse orbitalData con los datos del asteroide");
  if (!detail?.name) throw new Error("Debe proveerse el nombre real del asteroide en metadata.name");

  // --- Mapear a OrbitalElements ---
  const orbitalElements: OrbitalElements = mapOrbitalDataToElements(orbitalData);

  // Grupo principal del asteroide
  const asteroidGroup = new THREE.Group();
  asteroidGroup.name = detail.name;

  // --- Crear malla del asteroide ---
  const diameterKm = (estimatedDiameterKm.min + estimatedDiameterKm.max) / 2;
  const initialPosition = getOrbitPosition(orbitalElements, 0) ?? new THREE.Vector3(0,0,0);
  const asteroidMesh = createAsteroidMesh(initialPosition, diameterKm);
  asteroidGroup.add(asteroidMesh);

  // --- Dibujar órbita ---
  if (scene) {
    const orbitLine = createOrbitLine(orbitalElements);
    scene.add(orbitLine);
  }

  // --- Label con nombre ---
  if (scene) {
    const labelDiv = document.createElement("div");
    labelDiv.className = "label";
    labelDiv.textContent = detail.name;
    asteroidGroup.add(new CSS2DObject(labelDiv));
  }

  // --- Guardar referencias ---
  (asteroidGroup as any).orbitalData = orbitalData;
  (asteroidGroup as any).orbitalElements = orbitalElements;

  return asteroidGroup;
}
