import * as THREE from 'three';

export function createPlanetLabel(text: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const width = 1024;
  const height = 512;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d')!;
  
  context.clearRect(0, 0, width, height);

  // Texto grande, negrita y blanco
  context.font = 'bold 180px Arial';
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  context.fillText(text, width / 2, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(material);
  
  // Mucho más grande (ajusta si quieres)
  sprite.scale.set(10, 5, 1);

  return sprite;
}
