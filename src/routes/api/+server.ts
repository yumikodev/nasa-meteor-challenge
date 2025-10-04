// src/routes/api/+server.ts
import type { RequestHandler } from "@sveltejs/kit";
import type { AsteroidResponse } from "../../interfaces/neo.interfaces";

export const GET: RequestHandler = async () => {
  const res = await fetch("https://nasa-meteor-challenge.koyeb.app/feed");
  if (!res.ok) return new Response("Error fetching asteroids", { status: 500 });
  
  const data: AsteroidResponse = await res.json();
  // Filtramos solo los peligrosos
  const dangerous = data.asteroids.filter(a => a.metadata.isPotentiallyHazardous);

  return new Response(JSON.stringify(dangerous), {
    headers: { "Content-Type": "application/json" }
  });
};
