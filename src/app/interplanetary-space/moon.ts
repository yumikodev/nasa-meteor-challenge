import * as THREE from 'three';
import { toScaledValue } from '../shared/helpers/scale.helper';
import { getOrbitalPosition, OrbitalElements } from '../shared/helpers/kepler.helper';

export class Moon {
  mesh: THREE.Mesh;
  radius: number;
  orbitRadius: number;

  private orbitalElements: OrbitalElements = {
    a: 384400 / 149597870.7, // km -> UA
    e: 0.0549,
    i: 5.145,
    omega: 125.08,
    w: 318.15,
    M0: 115.3654,
    epoch: 2451545.0,
    period: 27.32,
  };

  constructor() {
    const MOON_RADIUS_KM = 1737;
    const MOON_DISTANCE_KM = 384_400;

    this.radius = toScaledValue(MOON_RADIUS_KM);
    this.orbitRadius = toScaledValue(MOON_DISTANCE_KM);

    const geometry = new THREE.SphereGeometry(this.radius, 64, 64);
    const texture = new THREE.TextureLoader().load('/images/moon.jpg');
    const material = new THREE.MeshBasicMaterial({ map: texture });

    this.mesh = new THREE.Mesh(geometry, material);
  }

  getRelativePosition(JD: number): THREE.Vector3 {
    return getOrbitalPosition(this.orbitalElements, JD);
  }

  orbitAroundEarth() {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const JD = this.orbitalElements.epoch + (i / 128) * this.orbitalElements.period;
      const pos = getOrbitalPosition(this.orbitalElements, JD);
      points.push(pos);
    }

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xcccccc });

    return new THREE.LineLoop(orbitGeometry, orbitMaterial);
  }
}
