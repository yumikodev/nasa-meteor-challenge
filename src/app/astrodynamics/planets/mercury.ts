import * as THREE from 'three';
import { toScaledValue } from '../../shared/helpers/scale.helper';

export class Mercury {
  mesh: THREE.Mesh;
  radius: number;
  orbitRadius: number;

  constructor() {
    const MERCURY_RADIUS_KM = 2_440;
    const MERCURY_ORBIT_KM = 57_910_000;

    const mercuryRadius = toScaledValue(MERCURY_RADIUS_KM);
    this.orbitRadius = toScaledValue(MERCURY_ORBIT_KM);
    this.radius = mercuryRadius;

    const geometry = new THREE.SphereGeometry(mercuryRadius, 64, 64);
    const texture = new THREE.TextureLoader().load('/images/mercury.jpg');
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
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xb5b5b5 });

    const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);
    return orbitLine;
  }
}
