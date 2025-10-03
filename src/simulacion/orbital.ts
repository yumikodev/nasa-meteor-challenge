import * as THREE from 'three';

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
  M0: number;     // Mean anomaly (deg)
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

// --- Tierra (órbita simplificada en torno al Sol en el origen) ---
export function getEarthOrbitPosition(daysElapsed: number): THREE.Vector3 {
  const AU_KM = KM_PER_AU;
  const earthOrbitRadius = toScaledValue(AU_KM); // 1 AU en escala
  const earthOrbitPeriod = 365.25; // días

  const angle = (daysElapsed / earthOrbitPeriod) * 2 * Math.PI;

  return new THREE.Vector3(
    earthOrbitRadius * Math.cos(angle),
    0,
    earthOrbitRadius * Math.sin(angle)
  );
}


// --- Luna (posición relativa simplificada) ---
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
// Coloca el asteroide como un "snapshot" a la distancia mínima
export function getAsteroidPosition(asteroid: Asteroid): THREE.Vector3 {
  if (!asteroid.closeApproachData.length) {
    return new THREE.Vector3(0, 0, 0);
  }

  // Tomamos el primer evento de aproximación
  const approach = asteroid.closeApproachData[0];

  const missKm = approach.missDistance.kilometers;
  const scaledMiss = toScaledValue(missKm);

  // Ángulo aleatorio para distribuirlos alrededor de la Tierra
  const angle = Math.random() * 2 * Math.PI;

  return new THREE.Vector3(
    scaledMiss * Math.cos(angle),
    (Math.random() - 0.5) * scaledMiss * 0.2, // pequeña variación en eje Y
    scaledMiss * Math.sin(angle)
  );
}
