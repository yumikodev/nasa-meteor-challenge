import type { Asteroid } from "./api/neo.interfaces";

interface Props {
  asteroids: Asteroid[];
}

export function AsteroidList({ asteroids }: Props) {
  return (
    <ul className="space-y-2">
      {asteroids.map((asteroid) => (
        <li
          key={asteroid.id}
          className="p-2 border rounded bg-gray-100 shadow"
        >
          <p className="font-semibold">{asteroid.name}</p>
          <p className="text-sm text-gray-600">
            Magnitud absoluta: {asteroid.metadata.absoluteMagnitude}
          </p>
          <p className="text-sm text-gray-600">
            Diámetro estimado: {asteroid.metadata.estimatedDiameter.min.toFixed(2)} -{" "}
            {asteroid.metadata.estimatedDiameter.max.toFixed(2)} km
          </p>
          <p className="text-sm text-gray-600">
            Próximo acercamiento: {asteroid.closeApproachData[0]?.closeApproachDate}
          </p>
        </li>
      ))}
    </ul>
  );
}
