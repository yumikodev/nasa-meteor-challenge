import * as THREE from 'three';

export class Sun {
  mesh: THREE.Mesh;

  constructor() {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    this.mesh = new THREE.Mesh(geometry, material);
  }
}