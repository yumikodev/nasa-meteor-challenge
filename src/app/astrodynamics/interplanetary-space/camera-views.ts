import * as THREE from 'three';
import { toScaledValue } from '../../shared/helpers/scale.helper';

export const CAMERA_VIEWS = {
  sun: {
    position: new THREE.Vector3(0, toScaledValue(20_000_000), toScaledValue(40_000_000)), // 20M y 40M km de altura/distancia
    target: new THREE.Vector3(0, 0, 0),
  },
  earth: (earthPosition: THREE.Vector3) => ({
    position: earthPosition.clone().add(new THREE.Vector3(
      0,
      toScaledValue(5_000_000), // 5 millones km arriba
      toScaledValue(10_000_000) // 10 millones km hacia atrás
    )),
    target: earthPosition.clone(),
  }),
};
