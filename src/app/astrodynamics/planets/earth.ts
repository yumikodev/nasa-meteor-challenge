import * as THREE from 'three';

export class Earth {
  mesh: THREE.Mesh;

  constructor() {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const loader = new THREE.TextureLoader();
    const texture = loader.load('/images/earth.jpg');
    const material = new THREE.MeshBasicMaterial({ map: texture });
    this.mesh = new THREE.Mesh(geometry, material);
  }
}
