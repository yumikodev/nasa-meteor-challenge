import type { Asteroid } from "$lib/interfaces/asteroid.interfaces";

/**
 * Genera URL de simulación (ahora apuntando a /cartesian) a partir de uno o varios asteroides
 * @param asteroids Array de asteroides seleccionados
 * @returns URL string lista para usar en redirección
 */
export function getSimulationUrl(asteroidIds: string[]): string {
  const query = new URLSearchParams();
  for (const id of asteroidIds) {
    query.append("id", id);
  }
  return `/cartesian?${query.toString()}`;
}
