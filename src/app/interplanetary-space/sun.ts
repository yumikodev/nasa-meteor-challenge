import * as THREE from 'three';
import { toScaledValue } from '../shared/helpers/scale.helper';

export class Sun {
  mesh: THREE.Mesh;

  constructor() {
    const SUN_RADIUS_KM = 696_000;
    const sunRadius = toScaledValue(SUN_RADIUS_KM);
    const texture = new THREE.TextureLoader().load('/images/sun.jpg');
    const geometry = new THREE.SphereGeometry(sunRadius, 64, 64);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    this.mesh = new THREE.Mesh(geometry, material);
  }
}
