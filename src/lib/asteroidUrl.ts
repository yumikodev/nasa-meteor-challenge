import type { Asteroid } from "$lib/interfaces/asteroid.interfaces";

/**
 * Genera URL de simulación (ahora apuntando a /cartesian) a partir de uno o varios asteroides
 * @param asteroids Array de asteroides seleccionados
 * @returns URL string lista para usar en redirección
 */
export function getSimulationUrl(asteroids: Asteroid[]): string {
  const ids = asteroids.map(a => a.id);
  return `/cartesian/?ids=${ids.join(",")}`; // Cambio aquí
}
