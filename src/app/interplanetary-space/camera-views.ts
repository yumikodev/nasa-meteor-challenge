import * as THREE from 'three';

export const CAMERA_VIEWS = {
  earth: (earthPosition: THREE.Vector3) => ({
    position: earthPosition.clone().add(new THREE.Vector3(
      0,
      1,  // Altura sobre la Tierra (más cerca)
      1  // Distancia hacia atrás (más cerca)
    )),
    target: earthPosition.clone(),
  }),
};
