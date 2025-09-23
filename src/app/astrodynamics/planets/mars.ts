import * as THREE from 'three';
import { toScaledValue } from '../../shared/helpers/scale.helper';

export class Mars {
  mesh: THREE.Mesh;
  radius: number;
  orbitRadius: number;

  constructor() {
    const MARS_RADIUS_KM = 3_390;
    const MARS_ORBIT_KM = 227_900_000;

    const marsRadius = toScaledValue(MARS_RADIUS_KM);
    this.orbitRadius = toScaledValue(MARS_ORBIT_KM);
    this.radius = marsRadius;

    const geometry = new THREE.SphereGeometry(marsRadius, 64, 64);
    const texture = new THREE.TextureLoader().load('/images/mars.jpg');
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
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xff5733 }); // rojo marciano

    const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);
    return orbitLine;
  }
}
