import * as THREE from 'three';

export class Earth {
  mesh: THREE.Mesh;

  constructor() {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    this.mesh = new THREE.Mesh(geometry, material);
  }
}
