import * as THREE from 'three';

export function createHighlightCircle(radius: number, color: number = 0xffff00): THREE.Mesh {
  // Un anillo con un "grosor" notable: el radio interno y externo definen ese grosor
  const innerRadius = radius * 0.85;
  const outerRadius = radius * 1.15;
  
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
  const material = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  });

  const ring = new THREE.Mesh(geometry, material);
  ring.rotation.x = Math.PI / 2; // Plano horizontal XZ

  return ring;
}
