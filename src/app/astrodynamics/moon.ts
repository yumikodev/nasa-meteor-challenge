import * as THREE from 'three';
import { toScaledValue } from '../shared/helpers/scale.helper';


export class Moon {
  mesh: THREE.Mesh;
  radius: number;
  orbitRadius: number;

  constructor() {
    // Datos reales
    const MOON_RADIUS_KM = 1_737;
    const MOON_DISTANCE_KM = 384_400;

    // Escalado
    this.radius = toScaledValue(MOON_RADIUS_KM);
    this.orbitRadius = toScaledValue(MOON_DISTANCE_KM);

    // Geometría y textura
    const geometry = new THREE.SphereGeometry(this.radius, 64, 64);
    const texture = new THREE.TextureLoader().load('/images/moon.jpg');
    const material = new THREE.MeshBasicMaterial({ map: texture });

    this.mesh = new THREE.Mesh(geometry, material);
  }

  // (Opcional) Devuelve una línea que representa su órbita alrededor de la Tierra
  orbitAroundEarth() {
    const points: THREE.Vector3[] = [];

    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      const x = Math.cos(angle) * this.orbitRadius;
      const z = Math.sin(angle) * this.orbitRadius;
      points.push(new THREE.Vector3(x, 0, z));
    }

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xcccccc });

    return new THREE.LineLoop(orbitGeometry, orbitMaterial);
  }
}
