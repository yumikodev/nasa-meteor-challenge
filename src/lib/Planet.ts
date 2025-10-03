import * as THREE from "three";
import { toScaledValue } from "../simulacion/orbital";

export function createPlanet(
  name: string,
  radiusKm: number,
  color: number
): THREE.Group {
  const group = new THREE.Group();

  const radiusScaled = toScaledValue(radiusKm);

  // --- Esfera realista ---
  const geometry = new THREE.SphereGeometry(radiusScaled, 64, 64);
  const material = new THREE.MeshBasicMaterial({ color });
  const planetMesh = new THREE.Mesh(geometry, material);
  planetMesh.name = `${name}Mesh`;

  // --- Punto con Points ---
  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([0, 0, 0], 3)
  );

  const pointMaterial = new THREE.PointsMaterial({
    color,
    size: 10, // tamaño inicial en píxeles
    sizeAttenuation: true // cambia con distancia
  });

  const planetPoint = new THREE.Points(pointGeometry, pointMaterial);
  planetPoint.name = `${name}Point`;

  group.add(planetMesh);
  group.add(planetPoint);

  // --- Lógica de transición punto <-> planeta ---
  (group as any).update = (camera: THREE.Camera) => {
    const distance = camera.position.distanceTo(group.position);

    // El planeta es visible solo cuando estás lo bastante cerca
    const switchDistance = radiusScaled * 20;

    planetMesh.visible = distance < switchDistance;
    planetPoint.visible = !planetMesh.visible;

    // Ajustar el tamaño del punto según distancia
    if (planetPoint.visible) {
      (planetPoint.material as THREE.PointsMaterial).size =
        Math.min(distance * 0.05, 50); // ajusta 0.05 y 50 a gusto
    }
  };

  return group;
}
