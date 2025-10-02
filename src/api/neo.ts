import type { AsteroidResponse } from "./neo.interfaces";

const BASE_URL = "https://nasa-mc-api.deno.dev/feed"; // tu backend

export async function getNeoFeed(): Promise<AsteroidResponse> {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Error al obtener datos del backend");
  return res.json() as Promise<AsteroidResponse>;
}
