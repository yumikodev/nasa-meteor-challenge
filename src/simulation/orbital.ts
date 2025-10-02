import * as THREE from 'three';

// --- Constantes de Escala ---
const SCALE_FACTOR: number = 10_000; // Escala para Three.js
export const KM_PER_AU: number = 149_597_870.7; // km por Unidad Astronómica

// --- Conversión ---
export function toScaledValue(realMeasure: number): number {
    return realMeasure / SCALE_FACTOR;
}

// --- Constants ---
export const ASTRONOMICAL_CONSTANTS = {
    // Earth
    EARTH_RADIUS_KM: 6371,
    EARTH_TILT: 23.4366,
    EARTH_SIDEREAL_DAY: 23.9344696, // hours
    EARTH_ORBIT_PERIOD: 365.256363004, // days

    // Moon
    MOON_RADIUS_KM: 1737.1,
    MOON_DISTANCE_KM: 384399,
    MOON_ORBIT_TILT: 5.145,
    MOON_SIDEREAL_PERIOD: 27.321661, // days
    MOON_SYNODIC_PERIOD: 29.530589,  // days
    
    // Sun
    SUN_RADIUS_KM: 696340,
    SUN_ROTATION_PERIOD: 27 // days at equator
};

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

// --- Utilities ---
function degToRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

// Resolver la ecuación de Kepler: M = E - e sin(E)
function solveKepler(M: number, e: number, tol = 1e-6): number {
    let E = M;
    let delta = 1;
    do {
        const sinE = Math.sin(E);
        const cosE = Math.cos(E);
        delta = (E - e * sinE - M) / (1 - e * cosE);
        E -= delta;
    } while (Math.abs(delta) > tol);
    return E;
}

// Obtener posición 3D en AU y luego escalada
export function getOrbitalPosition(elements: OrbitalElements, JD: number): THREE.Vector3 {
    const { a, e, i, omega, w, M0, epoch, period } = elements;

    // Anomalía media
    const n = (2 * Math.PI) / period; // rad/día
    const M = degToRad(M0) + n * (JD - epoch);
    const Mnorm = M % (2 * Math.PI);
    const E = solveKepler(Mnorm, e);

    // Anomalía verdadera y radio
    const cosE = Math.cos(E);
    const sinE = Math.sin(E);
    const v = Math.atan2(Math.sqrt(1 - e * e) * sinE, cosE - e);
    const r = a * (1 - e * cosE);

    // Transformación a coordenadas eclípticas
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

    const x = r * (cosOmega * cosWplusV - sinOmega * sinWplusV * cosI);
    const y = r * (sinOmega * cosWplusV + cosOmega * sinWplusV * cosI);
    const z = r * (sinWplusV * sinI);

    // Mapear a Three.js: X,Y,Z
    const positionAU = new THREE.Vector3(x, z, y);
    const positionKm = positionAU.multiplyScalar(KM_PER_AU);

    return new THREE.Vector3(
        toScaledValue(positionKm.x),
        toScaledValue(positionKm.y),
        toScaledValue(positionKm.z),
    );
}

// --- Datos de la Tierra (EM Bary) ---
const EM_BARY_J2000_DATA = {
    a: 1.00000018,
    e: 0.01673163,
    i: -0.00054346,
    L: 100.46691572,
    longPeri: 102.93005885,
    longNode: -5.11260389,
    a_rate: -0.00000003,
    e_rate: -0.00003661,
    i_rate: -0.01337178,
    L_rate: 35999.37306329,
    longPeri_rate: 0.31795260,
    longNode_rate: -0.24123856,
};

// --- Constantes de tiempo ---
const JD_J2000 = 2451545.0;
const DAYS_PER_JULIAN_CENTURY = 36525.0;

// Propagación lineal de elementos
function propagateElement(elementJ2000: number, ratePerCentury: number, JD: number): number {
    const T = (JD - JD_J2000) / DAYS_PER_JULIAN_CENTURY;
    return elementJ2000 + ratePerCentury * T;
}

// Obtener elementos orbitales propagados de la Tierra
export function getEarthOrbitalElements(JD: number): OrbitalElements {
    const a = propagateElement(EM_BARY_J2000_DATA.a, EM_BARY_J2000_DATA.a_rate, JD);
    const e = propagateElement(EM_BARY_J2000_DATA.e, EM_BARY_J2000_DATA.e_rate, JD);
    const i = propagateElement(EM_BARY_J2000_DATA.i, EM_BARY_J2000_DATA.i_rate, JD);
    const longPeri = propagateElement(EM_BARY_J2000_DATA.longPeri, EM_BARY_J2000_DATA.longPeri_rate, JD);
    const longNode = propagateElement(EM_BARY_J2000_DATA.longNode, EM_BARY_J2000_DATA.longNode_rate, JD);
    const L = propagateElement(EM_BARY_J2000_DATA.L, EM_BARY_J2000_DATA.L_rate, JD);

    const M0 = L - longPeri;
    const period = 365.256363004;

    return {
        a,
        e,
        i,
        omega: longNode,
        w: longPeri - longNode,
        M0,
        epoch: JD,
        period,
    };
}

// --- Conversión de tiempo ---
export function getJulianDateFromSimulatedTime(startDate: Date, daysElapsed: number): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const julianUnixEpoch = 2440587.5;
    return julianUnixEpoch + startDate.getTime() / msPerDay + daysElapsed;
}

// --- Final positions ---
export function getEarthPosition(startDate: Date, daysElapsed: number): THREE.Vector3 {
    const JD = getJulianDateFromSimulatedTime(startDate, daysElapsed);
    const elements = getEarthOrbitalElements(JD);
    return getOrbitalPosition(elements, JD);
}

// Moon's position relative to Earth
export function getMoonRelativePosition(JD: number): THREE.Vector3 {
    const { MOON_DISTANCE_KM, MOON_ORBIT_TILT, MOON_SIDEREAL_PERIOD } = ASTRONOMICAL_CONSTANTS;
    
    // Convert Moon's distance to scaled units
    const scaledDistance = toScaledValue(MOON_DISTANCE_KM);
    
    // Calculate Moon's position in its orbit
    const moonAngle = (JD % MOON_SIDEREAL_PERIOD) * (2 * Math.PI / MOON_SIDEREAL_PERIOD);
    const orbitTilt = degToRad(MOON_ORBIT_TILT);
    
    // Calculate position considering orbital tilt
    const x = scaledDistance * Math.cos(moonAngle);
    const y = scaledDistance * Math.sin(moonAngle) * Math.sin(orbitTilt);
    const z = scaledDistance * Math.sin(moonAngle) * Math.cos(orbitTilt);
    
    return new THREE.Vector3(x, y, z);
}

// Get Moon's absolute position by combining Earth's position and Moon's relative position
export function getMoonPosition(startDate: Date, daysElapsed: number): THREE.Vector3 {
    const JD = getJulianDateFromSimulatedTime(startDate, daysElapsed);
    const earthPos = getEarthPosition(startDate, daysElapsed);
    const moonRelativePos = getMoonRelativePosition(JD);
    
    return earthPos.add(moonRelativePos);
}
