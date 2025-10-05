// src/lib/AsteroidOrbital.ts
import * as THREE from "three";

// --- Constantes ---
const SCALE_FACTOR = 1_000_000; // Escala para Three.js
export const KM_PER_AU = 149_597_870.7; // km por Unidad Astronómica

export function toScaledValue(realMeasure: number): number {
  return realMeasure / SCALE_FACTOR;
}

// --- Types ---
export interface OrbitalElements {
  a: number;      // Semi-major axis (AU)
  e: number;      // Eccentricity
  i: number;      // Inclination (deg)
  omega: number;  // Longitude of ascending node (deg)
  w: number;      // Argument of periapsis (deg)
  M0: number;     // Mean anomaly at epoch (deg)
  epoch: number;  // Epoch (Julian Date)
  period: number; // Orbital period (days)
}

export interface AsteroidPosition {
  position: THREE.Vector3;
  label?: string;
}

// --- Posición en órbita ---
export function getOrbitPosition(elements: OrbitalElements, daysElapsed: number): THREE.Vector3 {
  const AU_SCALED = toScaledValue(KM_PER_AU);
  const a = elements.a * AU_SCALED;
  const e = elements.e;

  let M = THREE.MathUtils.degToRad((elements.M0 + (360 * daysElapsed / elements.period)) % 360);

  // Ecuación de Kepler iterativa
  let E = M;
  for (let i = 0; i < 20; i++) {
    E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }

  const xOrb = a * (Math.cos(E) - e);
  const yOrb = a * Math.sqrt(1 - e * e) * Math.sin(E);

  const iRad = THREE.MathUtils.degToRad(elements.i);
  const omegaRad = THREE.MathUtils.degToRad(elements.omega);
  const wRad = THREE.MathUtils.degToRad(elements.w);

  const cosW = Math.cos(wRad), sinW = Math.sin(wRad);
  const x1 = xOrb * cosW - yOrb * sinW;
  const y1 = xOrb * sinW + yOrb * cosW;

  const cosOmega = Math.cos(omegaRad), sinOmega = Math.sin(omegaRad);
  const cosI = Math.cos(iRad), sinI = Math.sin(iRad);

  const x = x1 * cosOmega - y1 * cosI * sinOmega;
  const y = x1 * sinOmega + y1 * cosI * cosOmega;
  const z = y1 * sinI;

  return new THREE.Vector3(x, z, y);
}

// --- Crear línea de órbita ---
export function createOrbitLine(elements: OrbitalElements, segments = 360): THREE.Line {
  const points: THREE.Vector3[] = [];
  for (let j = 0; j <= segments; j++) {
    points.push(getOrbitPosition(elements, (j / segments) * elements.period));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0xffffff });
  return new THREE.Line(geometry, material);
}

// --- Crear asteroide ---
export function createAsteroidMesh(position: THREE.Vector3, diameterKm: number): THREE.Mesh {
  const radius = toScaledValue(diameterKm * 500);
  const geometry = new THREE.SphereGeometry(radius, 16, 16);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  return mesh;
}

// --- Crear marcadores ---
export function createCloseApproachMarkers(
  elements: OrbitalElements,
  closeApproaches: { daysFromEpoch: number; label?: string }[]
): AsteroidPosition[] {
  return closeApproaches.map(ca => ({
    position: getOrbitPosition(elements, ca.daysFromEpoch),
    label: ca.label
  }));
}
