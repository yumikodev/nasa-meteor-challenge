import * as THREE from 'three';
import { toScaledValue } from '../../shared/helpers/scale.helper';

export class Venus {
  mesh: THREE.Mesh;
  radius: number;
  orbitRadius: number;

  constructor() {
    const VENUS_RADIUS_KM = 6_052;
    const VENUS_ORBIT_KM = 108_200_000;

    const venusRadius = toScaledValue(VENUS_RADIUS_KM);
    this.orbitRadius = toScaledValue(VENUS_ORBIT_KM);
    this.radius = venusRadius;

    const geometry = new THREE.SphereGeometry(venusRadius, 64, 64);
    const texture = new THREE.TextureLoader().load('/images/venus.jpg');
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
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffd580 });

    const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);
    return orbitLine;
  }
}
