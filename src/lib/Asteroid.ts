// src/lib/Asteroid.ts
import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { 
  getOrbitPosition, 
  createOrbitLine,
  createAsteroidMesh
} from "./AsteroidOrbital";
import type { OrbitalElements } from "./AsteroidOrbital";
import type { AsteroidDetails, EstimatedDiameter, OrbitalData } from "./interfaces/asteroid.interfaces";

interface AsteroidOptions {
  scene?: THREE.Scene;
  orbitalData: OrbitalData;      
  detail: AsteroidDetails;
  estimatedDiameterKm: EstimatedDiameter;
}

// --- Crear asteroide simplificado ---
export function createAsteroid(options: AsteroidOptions): THREE.Group {
  const { orbitalData, estimatedDiameterKm, detail, scene } = options;

  if (!orbitalData) throw new Error("Debe proveerse orbitalData con los datos del asteroide");
  if (!detail?.name) throw new Error("Debe proveerse el nombre real del asteroide en metadata.name");

  // Nose
  const orbitalElements: OrbitalElements = {
    a: orbitalData.semiMajorAxis,                     // AU
    e: orbitalData.eccentricity,                      // adimensional
    i: orbitalData.inclination,                       // grados
    omega: orbitalData.ascendingNodeLongitude,        // grados
    w: orbitalData.perihelionArgument,               // grados
    M0: orbitalData.meanAnomaly,                      // grados
    epoch: orbitalData.epochOsculation,               // JD
    period: orbitalData.orbitalPeriod                 // días
  };

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
