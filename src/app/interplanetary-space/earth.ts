import * as THREE from 'three';
import { toScaledValue } from '../shared/helpers/scale.helper';

export class Earth {
  mesh: THREE.Mesh;
  radius: number;
  orbitRadius: number;

  constructor() {
    const EARTH_RADIUS_KM = 6_371;
    const EARTH_ORBIT_KM = 149_600_000;
    const earthRadius = toScaledValue(EARTH_RADIUS_KM);
    this.orbitRadius = toScaledValue(EARTH_ORBIT_KM);
    this.radius = earthRadius;
    const geometry = new THREE.SphereGeometry(earthRadius, 64, 64);
    const texture = new THREE.TextureLoader().load('/images/earth.jpg');
    const material = new THREE.MeshBasicMaterial({ map: texture });
    this.mesh = new THREE.Mesh(geometry, material);
  }

  orbit() {
    const orbitRadius = this.orbitRadius;
    const points: THREE.Vector3[] = [];

    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      const x = Math.cos(angle) * orbitRadius;
      const z = Math.sin(angle) * orbitRadius;
      points.push(new THREE.Vector3(x, 0, z));
    }

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x77f6ff });

    const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);
    return orbitLine;
  }
}
