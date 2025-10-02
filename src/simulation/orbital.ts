import * as THREE from 'three';

// --- Constantes de Escala y Conversión (del primer prompt) ---
const SCALE_FACTOR: number = 1_000_000;
export function toScaledValue(realMeasure: number): number {
  return realMeasure / SCALE_FACTOR;
}
const KM_PER_AU: number = 149597870.7;

export interface OrbitalElements {
  a: number; // Semieje Mayor (AU)
  e: number; // Excentricidad (rad)
  i: number; // Inclinación (deg)
  omega: number; // Longitud del Nodo Ascendente (deg)
  w: number; // Argumento del Periastro (deg)
  M0: number; // Anomalía Media en la Época (deg)
  epoch: number; // Día Juliano de la Época (JD)
  period: number; // Período (días)
}

function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Función solveKepler (Asumimos que la tienes definida aquí o importada)
function solveKepler(M: number, e: number, tolerance: number = 1e-6): number {
  let E = M;
  let delta = 1;
  do {
    const sinE = Math.sin(E);
    const cosE = Math.cos(E);
    delta = (E - e * sinE - M) / (1 - e * cosE);
    E -= delta;
  } while (Math.abs(delta) > tolerance);
  return E;
}

// Función getOrbitalPosition (Asumimos que la tienes definida aquí o importada)
export function getOrbitalPosition(elements: OrbitalElements, JD: number): THREE.Vector3 {
  const { a, e, i, omega, w, M0, epoch, period } = elements;
  
  // Paso 1: Cálculo de Anomalía Media (M)
  // Como JD == epoch para el EM Bary, el término (JD - epoch) es 0.
  const n = (2 * Math.PI) / period;
  const M = degToRad(M0) + n * (JD - epoch); 
  const Mnorm = M % (2 * Math.PI);
  const E = solveKepler(Mnorm, e);

  // Paso 2: Cálculo de Radio (r) y Anomalía Verdadera (v)
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const v = Math.atan2(Math.sqrt(1 - e * e) * sinE, cosE - e);
  const r = a * (1 - e * cosE);

  // Paso 3: Conversión a Coordenadas (Eclíptica)
  const iRad = degToRad(i);
  const omegaRad = degToRad(omega);
  const wRad = degToRad(w);
  
  const cosOmega = Math.cos(omegaRad);
  const sinOmega = Math.sin(omegaRad);
  const cosI = Math.cos(iRad);
  const sinI = Math.sin(iRad);
  const WplusV = wRad + v; 
  const cosWplusV = Math.cos(WplusV);
  const sinWplusV = Math.sin(WplusV);

  // Coordenadas Eclípticas (X, Y, Z)
  const x = r * (cosOmega * cosWplusV - sinOmega * sinWplusV * cosI);
  const y = r * (sinOmega * cosWplusV + cosOmega * sinWplusV * cosI);
  const z = r * (sinWplusV * sinI);

  // Paso 4: Conversión y Escalado
  // Nota: Three.js (X, Y, Z) es a menudo (Right, Up, Forward). 
  // En astronomía (Eclíptica J2000), Z es perpendicular a la eclíptica.
  // Es común mapear X, Y (eclíptica) a X, Z (Three.js) y Z (eclíptica) a Y (Three.js).
  // La línea original que diste hacía: positionAU = new THREE.Vector3(x, z, y);
  const positionAU = new THREE.Vector3(x, z, y); 
  const positionKm = positionAU.multiplyScalar(KM_PER_AU);

  return new THREE.Vector3(
    toScaledValue(positionKm.x),
    toScaledValue(positionKm.y),
    toScaledValue(positionKm.z),
  );
}

// --- Lógica de Propagación del EM Bary (Tierra) ---

// Coeficientes que proporcionaste
// En un archivo de datos (e.g., 'earth-data.ts')

const EM_BARY_J2000_DATA = {
  // Elementos en la época J2000 (usando los valores de la TABLA 2a, más amplia)
  // [a (AU), e (rad), i (deg), L (deg), longPeri (deg), longNode (deg)]
  a: 1.00000018,         // Semieje Mayor (a)
  e: 0.01673163,         // Excentricidad (e)
  i: -0.00054346,        // Inclinación (i)
  L: 100.46691572,       // Longitud Media (L)
  longPeri: 102.93005885, // Longitud del Perihelio (long.peri)
  longNode: -5.11260389, // Longitud del Nodo Ascendente (long.node)

  // Las tasas de cambio también son necesarias. Debes incluirlas.
  // [a_rate (AU/Cy), e_rate (rad/Cy), i_rate (deg/Cy), L_rate (deg/Cy), longPeri_rate (deg/Cy), longNode_rate (deg/Cy)]
  a_rate: -0.00000003,
  e_rate: -0.00003661,
  i_rate: -0.01337178,
  L_rate: 35999.37306329,
  longPeri_rate: 0.31795260,
  longNode_rate: -0.24123856,
};

const JD_J2000: number = 2451545.0;
const DAYS_PER_JULIAN_CENTURY: number = 36525.0;

function propagateElement(elementJ2000: number, ratePerCentury: number, JD: number): number {
  const T: number = (JD - JD_J2000) / DAYS_PER_JULIAN_CENTURY;
  return elementJ2000 + (ratePerCentury * T);
}

// **Función clave para obtener los elementos propagados**
export function getEarthOrbitalElements(JD: number): OrbitalElements {
  // 1. Propagación
  const a = propagateElement(EM_BARY_J2000_DATA.a, EM_BARY_J2000_DATA.a_rate, JD);
  const e = propagateElement(EM_BARY_J2000_DATA.e, EM_BARY_J2000_DATA.e_rate, JD);
  const i = propagateElement(EM_BARY_J2000_DATA.i, EM_BARY_J2000_DATA.i_rate, JD);
  const longPeri = propagateElement(EM_BARY_J2000_DATA.longPeri, EM_BARY_J2000_DATA.longPeri_rate, JD);
  const longNode = propagateElement(EM_BARY_J2000_DATA.longNode, EM_BARY_J2000_DATA.longNode_rate, JD);
  const L = propagateElement(EM_BARY_J2000_DATA.L, EM_BARY_J2000_DATA.L_rate, JD);
  
  // 2. Cálculo de M0
  const M0 = L - longPeri; 
  
  // 3. Período
  const period = 365.256363004; 
  
  return {
    a: a,
    e: e,
    i: i,
    omega: longNode,  
    w: longPeri - longNode, 
    M0: M0,
    epoch: JD, // ¡CRÍTICO! Usar el JD actual como la nueva época
    period: period,
  };
}

// Función de utilidad para obtener el JD (Asumimos que la tienes definida aquí)
export function getJulianDateFromSimulatedTime(startDate: Date, daysElapsed: number): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const julianUnixEpoch = 2440587.5;
  return julianUnixEpoch + (startDate.getTime() / msPerDay) + daysElapsed;
}

/**
 * Función final que se llama desde el componente de Three.js.
 * @returns La posición 3D escalada del EM Bary.
 */
export function getEarthPosition(startDate: Date, daysElapsed: number): THREE.Vector3 {
    const JD = getJulianDateFromSimulatedTime(startDate, daysElapsed);
    const earthElements = getEarthOrbitalElements(JD);
    
    // Al usar JD == epoch, M0 ya representa la posición actual.
    // getOrbitalPosition simplemente convierte los elementos a coordenadas 3D.
    return getOrbitalPosition(earthElements, JD);
}