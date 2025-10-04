// src/routes/api/+server.ts
import type { RequestHandler } from "@sveltejs/kit";
import type { AsteroidResponse } from "../../interfaces/neo.interfaces";

export const GET: RequestHandler = async ({ url }) => {
  const asteroidId = url.searchParams.get("id"); // Si se pasa ?id=2247517

  const res = await fetch("https://nasa-meteor-challenge.koyeb.app/asteroids");
  if (!res.ok) return new Response("Error fetching asteroids", { status: 500 });

  const data: AsteroidResponse = await res.json();

  if (asteroidId) {
    const asteroid = data.asteroids.find(a => a.id === asteroidId);
    if (!asteroid) return new Response("Asteroid not found", { status: 404 });
    return new Response(JSON.stringify(asteroid), {
      headers: { "Content-Type": "application/json" }
    });
  }

  // Filtramos peligrosos y no peligrosos
  const dangerous = data.asteroids.filter(a => a.metadata.isPotentiallyHazardous);
  const nonDangerous = data.asteroids.filter(a => !a.metadata.isPotentiallyHazardous);

  return new Response(JSON.stringify({ dangerous, nonDangerous }), {
    headers: { "Content-Type": "application/json" }
  });
};
