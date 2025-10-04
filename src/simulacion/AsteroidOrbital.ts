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
  tp?: number;    // Time of perihelion (Julian Date), opcional
}

// --- API orbital_data raw ---
export interface OrbitalDataAPI {
  semi_major_axis: string;
  eccentricity: string;
  inclination: string;
  ascending_node_longitude: string;
  perihelion_argument: string;
  mean_anomaly: string;
  epoch_osculation: string;
  orbital_period: string;
  perihelion_time?: string;
}

// --- Mapear orbital_data a OrbitalElements ---
export function mapOrbitalDataToElements(data: OrbitalDataAPI): OrbitalElements {
  return {
    a: parseFloat(data.semi_major_axis),
    e: parseFloat(data.eccentricity),
    i: parseFloat(data.inclination),
    omega: parseFloat(data.ascending_node_longitude),
    w: parseFloat(data.perihelion_argument),
    M0: parseFloat(data.mean_anomaly),
    epoch: parseFloat(data.epoch_osculation),
    period: parseFloat(data.orbital_period),
    tp: data.perihelion_time ? parseFloat(data.perihelion_time) : undefined
  };
}

// --- Posición en órbita usando Kepler ---
export function getOrbitPosition(elements: OrbitalElements, daysElapsed: number): THREE.Vector3 {
  const AU_SCALED = toScaledValue(KM_PER_AU);

  // --- Anomalía media refinada ---
  let M = (elements.M0 + (360 * daysElapsed / elements.period)) % 360;

  // Si tenemos tiempo de perihelio, podemos calcular M0 más preciso
  if (elements.tp) {
    const n = 360 / elements.period; // deg/día
    M = n * (daysElapsed + elements.epoch - elements.tp); // aproximación
  }

  const M_rad = THREE.MathUtils.degToRad(M);

  // --- Ecuación de Kepler iterativa ---
  const a = elements.a * AU_SCALED;
  const e = elements.e;
  let E = M_rad;
  for (let i = 0; i < 10; i++) { // más iteraciones = más precisión
    E = E - (E - e * Math.sin(E) - M_rad) / (1 - e * Math.cos(E));
  }

  // Posición en el plano orbital
  const xOrb = a * (Math.cos(E) - e);
  const yOrb = a * Math.sqrt(1 - e * e) * Math.sin(E);

  // Transformación 3D con inclinación, nodo y argumento
  const i_rad = THREE.MathUtils.degToRad(elements.i);
  const omega_rad = THREE.MathUtils.degToRad(elements.omega);
  const w_rad = THREE.MathUtils.degToRad(elements.w);

  const cosW = Math.cos(w_rad), sinW = Math.sin(w_rad);
  let x1 = xOrb * cosW - yOrb * sinW;
  let y1 = xOrb * sinW + yOrb * cosW;

  const cosOmega = Math.cos(omega_rad), sinOmega = Math.sin(omega_rad);
  let x2 = x1 * cosOmega - y1 * Math.cos(i_rad) * sinOmega;
  let y2 = x1 * sinOmega + y1 * Math.cos(i_rad) * cosOmega;
  let z2 = y1 * Math.sin(i_rad);

  return new THREE.Vector3(x2, z2, y2);
}

// --- Crear línea de órbita ---
export function createOrbitLine(elements: OrbitalElements, color = 0xffaa00, segments = 360): THREE.Line {
  const points: THREE.Vector3[] = [];
  for (let j = 0; j <= segments; j++) {
    const days = (j / segments) * elements.period;
    points.push(getOrbitPosition(elements, days));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color });
  return new THREE.Line(geometry, material);
}
