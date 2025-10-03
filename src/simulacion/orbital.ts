import * as THREE from "three";

// --- Constantes de Escala ---
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
  epoch: number;  // Epoch (JD)
  period: number; // Orbital period (days)
}

// --- Tipos de la API de asteroides ---
export interface AsteroidResponse {
  asteroids: Asteroid[];
  metadata: {
    totalCount: number;
    hazardousCount: number;
    sentryCount: number;
  };
}

export interface Asteroid {
  id: string;
  name: string;
  closeApproachData: CloseApproachData[];
  metadata: AsteroidMetadata;
  orbitalElements?: OrbitalElements;
}

export interface CloseApproachData {
  closeApproachDate: string;
  relativeVelocity: {
    kilometersPerSecond: number;
    kilometersPerHour: number;
  };
  missDistance: {
    astronomical: number;
    lunar: number;
    kilometers: number;
    miles: number;
  };
  orbitingBody: string;
}

export interface AsteroidMetadata {
  isPotentiallyHazardous: boolean;
  isSentryObject: boolean;
  missDistance: {
    km: number;
    astronomical: number;
    lunar: number;
  };
  absoluteMagnitude: number;
  estimatedDiameter: {
    min: number;
    max: number;
  };
}

// --- Utilidades de tiempo ---
export function getJulianDateFromSimulatedTime(startDate: Date, daysElapsed: number): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const julianUnixEpoch = 2440587.5;
  return julianUnixEpoch + startDate.getTime() / msPerDay + daysElapsed;
}

// --- Posición en órbita usando elementos orbitales ---
export function getOrbitPosition(elements: OrbitalElements, daysElapsed: number): THREE.Vector3 {
  const AU_SCALED = toScaledValue(KM_PER_AU);

  // --- Anomalía media ---
  const M = (elements.M0 + (360 * daysElapsed / elements.period)) % 360;
  const M_rad = THREE.MathUtils.degToRad(M);

  // --- Ecuación de Kepler (iterativa) ---
  const a = elements.a * AU_SCALED;
  const e = elements.e;
  let E = M_rad;
  for (let i = 0; i < 5; i++) {
    E = E - (E - e * Math.sin(E) - M_rad) / (1 - e * Math.cos(E));
  }

  // Posición en el plano orbital
  const xOrb = a * (Math.cos(E) - e);
  const yOrb = a * Math.sqrt(1 - e * e) * Math.sin(E);

  // Transformación 3D
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

// --- Función para crear líneas de órbita ---
export function createOrbitLine(elements: OrbitalElements, color = 0x888888, segments = 360): THREE.Line {
  const points: THREE.Vector3[] = [];
  for (let j = 0; j <= segments; j++) {
    const days = (j / segments) * elements.period;
    points.push(getOrbitPosition(elements, days));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color });
  return new THREE.Line(geometry, material);
}

// --- Elementos orbitales de la Tierra ---
export const earthOrbitalElements: OrbitalElements = {
  a: 1,
  e: 0.0167,
  i: 0,
  omega: 0,
  w: 102.9372,
  M0: 0,
  epoch: 2451545.0,
  period: 365.25
};

// --- Posición de la Tierra ---
export function getEarthOrbitPosition(daysElapsed: number): THREE.Vector3 {
  return getOrbitPosition(earthOrbitalElements, daysElapsed);
}

// --- Luna ---
export function getMoonPosition(JD: number): THREE.Vector3 {
  const MOON_DISTANCE_KM = 384_399;
  const MOON_SIDEREAL_PERIOD = 27.321661;
  const scaledDistance = toScaledValue(MOON_DISTANCE_KM);
  const angle = (JD % MOON_SIDEREAL_PERIOD) * (2 * Math.PI / MOON_SIDEREAL_PERIOD);
  return new THREE.Vector3(
    scaledDistance * Math.cos(angle),
    0,
    scaledDistance * Math.sin(angle)
  );
}

// --- Asteroides ---
export function getAsteroidPosition(asteroid: Asteroid, daysElapsed?: number): THREE.Vector3 {
  if (asteroid.orbitalElements && daysElapsed !== undefined) {
    return getOrbitPosition(asteroid.orbitalElements, daysElapsed);
  }

  if (!asteroid.closeApproachData.length) return new THREE.Vector3(0, 0, 0);
  const approach = asteroid.closeApproachData[0];
  const missKm = approach.missDistance.kilometers;
  const scaledMiss = toScaledValue(missKm);
  const angle = Math.random() * 2 * Math.PI;

  return new THREE.Vector3(
    scaledMiss * Math.cos(angle),
    (Math.random() - 0.5) * scaledMiss * 0.2,
    scaledMiss * Math.sin(angle)
  );
}
