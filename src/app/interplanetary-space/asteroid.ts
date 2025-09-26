// Asteroid.ts
import * as THREE from 'three';
import { toScaledValue } from '../shared/helpers/scale.helper';
import { createPlanetLabel } from '../shared/helpers/label.helper';
import { getOrbitalPosition, OrbitalElements } from '../shared/helpers/kepler.helper';

export class Asteroid {
  mesh: THREE.Mesh;
  label!: THREE.Sprite;
  radius: number;

  private orbitalElements: OrbitalElements;

  constructor(name: string, radiusKm: number, orbitalElements?: Partial<OrbitalElements>) {
    this.radius = toScaledValue(radiusKm);

    // Aumentar segmentos para mejor visibilidad
    const geometry = new THREE.SphereGeometry(this.radius, 64, 64);
    const material = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    this.mesh = new THREE.Mesh(geometry, material);

    this.label = createPlanetLabel(name);

    this.orbitalElements = {
      a: 2.0, // UA, distancia media ficticia
      e: 0.1,
      i: 5,
      omega: 0,
      w: 0,
      M0: 0,
      epoch: 2451545.0,
      period: 365.25 * 1.5,
      ...orbitalElements,
    };
  }

  getPosition(JD: number): THREE.Vector3 {
    return getOrbitalPosition(this.orbitalElements, JD);
  }

  orbitPath(segments: number = 128): THREE.LineLoop {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const M = (i / segments) * 360;
      const JD = this.orbitalElements.epoch + (M / 360) * this.orbitalElements.period;
      points.push(this.getPosition(JD));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xffaa00 });
    return new THREE.LineLoop(geometry, material);
  }
}
