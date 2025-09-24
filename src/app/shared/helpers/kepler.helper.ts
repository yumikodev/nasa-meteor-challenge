import * as THREE from 'three';
import { toScaledValue } from './scale.helper';

const KM_PER_AU = 149597870.7;

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

function solveKepler(M: number, e: number, tolerance = 1e-6): number {
  let E = M;
  let delta = 1;
  while (Math.abs(delta) > tolerance) {
    delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= delta;
  }
  return E;
}

export function getOrbitalPosition(elements: OrbitalElements, JD: number): THREE.Vector3 {
  const { a, e, i, omega, w, M0, epoch, period } = elements;
  const n = (2 * Math.PI) / period;
  const M = degToRad(M0) + n * (JD - epoch);
  const Mnorm = M % (2 * Math.PI);
  const E = solveKepler(Mnorm, e);

  const xPrime = a * (Math.cos(E) - e);
  const yPrime = a * Math.sqrt(1 - e * e) * Math.sin(E);

  const iRad = degToRad(i);
  const omegaRad = degToRad(omega);
  const wRad = degToRad(w);
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const v = Math.atan2(Math.sqrt(1 - e * e) * sinE, cosE - e);
  const r = a * (1 - e * cosE);

  const cosOmega = Math.cos(omegaRad);
  const sinOmega = Math.sin(omegaRad);
  const cosI = Math.cos(iRad);
  const sinI = Math.sin(iRad);
  const cosWplusV = Math.cos(wRad + v);
  const sinWplusV = Math.sin(wRad + v);

  const x = r * (cosOmega * cosWplusV - sinOmega * sinWplusV * cosI);
  const y = r * (sinOmega * cosWplusV + cosOmega * sinWplusV * cosI);
  const z = r * (sinWplusV * sinI);

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
  return julianUnixEpoch + (startDate.getTime() + daysElapsed * msPerDay) / msPerDay;
}
