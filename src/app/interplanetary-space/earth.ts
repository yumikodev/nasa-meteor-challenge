import * as THREE from 'three';
import { toScaledValue } from '../shared/helpers/scale.helper';
import { getOrbitalPosition, OrbitalElements } from '../shared/helpers/kepler.helper';

export class Earth {
  mesh: THREE.Mesh;
  radius: number;
  orbitRadius: number;

  private orbitalElements: OrbitalElements = {
    a: 1.000, // UA
    e: 0.0167,
    i: 1.57, // grados
    omega: -11.26064,
    w: 102.94719,
    M0: 100.46435,
    epoch: 2451545.0, // J2000
    period: 365.25,
  };

  constructor() {
    const EARTH_RADIUS_KM = 6371;
    const earthRadius = toScaledValue(EARTH_RADIUS_KM);
    this.radius = earthRadius;
    this.orbitRadius = toScaledValue(149_600_000);

    const geometry = new THREE.SphereGeometry(earthRadius, 64, 64);
    const texture = new THREE.TextureLoader().load('/images/earth.jpg');
    const material = new THREE.MeshBasicMaterial({ map: texture });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.rotation.z = THREE.MathUtils.degToRad(23.5);
  }

  getPosition(JD: number): THREE.Vector3 {
    return getOrbitalPosition(this.orbitalElements, JD);
  }

  orbit() {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const M = (i / 128) * 360;
      const JD = this.orbitalElements.epoch + (M / 360) * this.orbitalElements.period;
      const pos = getOrbitalPosition(this.orbitalElements, JD);
      points.push(pos);
    }

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x77f6ff });
    return new THREE.LineLoop(orbitGeometry, orbitMaterial);
  }
}
