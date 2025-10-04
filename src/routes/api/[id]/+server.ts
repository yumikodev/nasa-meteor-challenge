import type { RequestHandler } from "@sveltejs/kit";
import type { AsteroidDetails } from "$lib/interfaces/asteroid.interfaces";

export const GET: RequestHandler = async ({ params }) => {
  const { id } = params;

  const res = await fetch(
    `https://nasa-meteor-challenge.koyeb.app/asteroids/${id}`
  );
  if (!res.ok) return new Response("Error fetching asteroids", { status: 500 });

  const data: AsteroidDetails = await res.json();

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
};
