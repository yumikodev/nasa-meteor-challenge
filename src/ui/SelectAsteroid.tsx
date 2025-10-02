import { useEffect, useState } from "react";
import { getNeoFeed } from "../api/neo";
import type { Asteroid } from "../api/neo.interfaces";
import { AsteroidList } from "./AsteroidList";

export function SelectAsteroid() {
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [filter, setFilter] = useState<"dangerous" | "safe" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNeoFeed()
      .then((data) => {
        console.log("Respuesta API:", data);
        setAsteroids(data.asteroids); // 👈 ya no uses near_earth_objects
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center">Cargando...</p>;

  const filtered = filter
    ? asteroids.filter((a) =>
        filter === "dangerous"
          ? a.metadata.isPotentiallyHazardous
          : !a.metadata.isPotentiallyHazardous
      )
    : [];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      {!filter ? (
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-center">
            ¿Qué asteroides quieres ver?
          </h1>
          <button
            onClick={() => setFilter("dangerous")}
            className="px-6 py-3 bg-red-500 text-white rounded shadow hover:bg-red-600"
          >
            Peligrosos 🚨
          </button>
          <button
            onClick={() => setFilter("safe")}
            className="px-6 py-3 bg-green-500 text-white rounded shadow hover:bg-green-600"
          >
            No peligrosos ✅
          </button>
        </div>
      ) : (
        <div className="w-full max-w-lg">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Lista de asteroides ({filter === "dangerous" ? "Peligrosos" : "No peligrosos"})
          </h2>
          <AsteroidList asteroids={filtered} />
          <button
            onClick={() => setFilter(null)}
            className="mt-6 px-4 py-2 bg-gray-300 rounded shadow hover:bg-gray-400 w-full"
          >
            Volver
          </button>
        </div>
      )}
    </div>
  );
}
