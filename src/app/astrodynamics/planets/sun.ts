import * as THREE from 'three';

export class Sun {
  mesh: THREE.Mesh;

  constructor() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('/images/sun.jpg');
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    this.mesh = new THREE.Mesh(geometry, material);
  }
}
