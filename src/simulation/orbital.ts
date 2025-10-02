import * as THREE from 'three';

const SCALE_FACTOR: number = 100_000;
export function toScaledValue(realMeasure: number): number {
  return realMeasure / SCALE_FACTOR;
}
export function toRealValue(scaledValue: number): number {
  return scaledValue * SCALE_FACTOR;
}

const KM_PER_AU: number = 149597870.7;

export interface OrbitalElements {
  a: number;
  e: number;
  i: number;
  omega: number;
  w: number;
  M0: number;
  epoch: number;
  period: number;
}

function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function solveKepler(M: number, e: number, tolerance: number = 1e-6): number {
  let E = M;
  let delta = 1;
  // Usar un loop 'do/while' es ligeramente más limpio aquí, 
  // ya que la condición se evalúa después de la primera iteración.
  do {
    const sinE = Math.sin(E);
    const cosE = Math.cos(E);
    // Optimización: Reutilizar sinE y cosE
    delta = (E - e * sinE - M) / (1 - e * cosE);
    E -= delta;
  } while (Math.abs(delta) > tolerance);
  
  return E;
}

export function getOrbitalPosition(elements: OrbitalElements, JD: number): THREE.Vector3 {
  // Desestructuración limpia
  const { a, e, i, omega, w, M0, epoch, period } = elements;
  
  // Paso 1: Cálculo de Anomalía Media (M)
  const n = (2 * Math.PI) / period;
  const M = degToRad(M0) + n * (JD - epoch);
  const Mnorm = M % (2 * Math.PI);
  const E = solveKepler(Mnorm, e);

  // Paso 2: Trigonométricas base
  const iRad = degToRad(i);
  const omegaRad = degToRad(omega);
  const wRad = degToRad(w);
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  
  // Paso 3: Radio (r) y Anomalía Verdadera (v)
  const v = Math.atan2(Math.sqrt(1 - e * e) * sinE, cosE - e);
  const r = a * (1 - e * cosE);

  // Paso 4: Trigonométricas para la Rotación
  const cosOmega = Math.cos(omegaRad);
  const sinOmega = Math.sin(omegaRad);
  const cosI = Math.cos(iRad);
  const sinI = Math.sin(iRad);
  
  // Pre-calculamos la suma para evitar repetirla
  const WplusV = wRad + v; 
  const cosWplusV = Math.cos(WplusV);
  const sinWplusV = Math.sin(WplusV);

  // Paso 5: Coordenadas (Eclíptica -> Ecuatorial)
  const x = r * (cosOmega * cosWplusV - sinOmega * sinWplusV * cosI);
  const y = r * (sinOmega * cosWplusV + cosOmega * sinWplusV * cosI);
  const z = r * (sinWplusV * sinI);

  // Paso 6: Conversión y Escalado
  const positionAU = new THREE.Vector3(x, z, y);
  const positionKm = positionAU.multiplyScalar(KM_PER_AU);

  return new THREE.Vector3(
    toScaledValue(positionKm.x),
    toScaledValue(positionKm.y),
    toScaledValue(positionKm.z),
  );
}

export function getJulianDateFromSimulatedTime(startDate: Date, daysElapsed: number): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const julianUnixEpoch = 2440587.5;
  
  // La forma más limpia de calcular los días transcurridos desde el inicio de la Era Unix
  return julianUnixEpoch + (startDate.getTime() / msPerDay) + daysElapsed;
}