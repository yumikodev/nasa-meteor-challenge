// src/routes/api/+server.ts
import type { RequestHandler } from "@sveltejs/kit";
import type { AsteroidResponse } from "../../interfaces/neo.interfaces";

export const GET: RequestHandler = async () => {
  const res = await fetch("https://nasa-meteor-challenge.koyeb.app/asteroids");
  if (!res.ok) return new Response("Error fetching asteroids", { status: 500 });
  
  const data: AsteroidResponse = await res.json();

  // Filtramos peligrosos y no peligrosos
  const dangerous = data.asteroids.filter(a => a.metadata.isPotentiallyHazardous);
  const nonDangerous = data.asteroids.filter(a => !a.metadata.isPotentiallyHazardous);

  // Devolvemos ambos en un solo objeto
  return new Response(JSON.stringify({
    dangerous,
    nonDangerous
  }), {
    headers: { "Content-Type": "application/json" }
  });
};
