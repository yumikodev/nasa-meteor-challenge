<script lang="ts">
  import { onMount } from "svelte";
  import type { Asteroid } from "../interfaces/neo.interfaces";

  let dangerousAsteroids: Asteroid[] = [];
  let nonDangerousAsteroids: Asteroid[] = [];
  let loadingAsteroids = true;

  async function fetchAsteroids() {
    try {
      const res = await fetch("/api/");
      if (!res.ok) throw new Error("Error fetching asteroids");
      const data = await res.json();
      dangerousAsteroids = data.dangerous;
      nonDangerousAsteroids = data.nonDangerous;
    } catch (err) {
      console.error("Error obteniendo asteroides:", err);
    } finally {
      loadingAsteroids = false;
    }
  }

  onMount(() => {
    fetchAsteroids();
  });

  function formatUTCDate(date: Date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
  }
</script>

<style>
  :global(body) {
    background-color: #1e3a8a; /* fondo azul */
    margin: 0;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    min-height: 100vh;
    gap: 4rem;
  }

  .asteroid-btn {
    text-align: left;
    border-radius: 0.375rem;
    border: 1px solid #444;
    background-color: #2563eb; /* azul más claro */
    color: #fff;
    box-shadow: 0 1px 2px rgba(0,0,0,0.5);
    transition: background 0.2s;
    cursor: default;
    padding: 1rem;
  }

  .asteroid-btn:hover {
    background-color: #1d4ed8;
  }

  .grid-asteroids {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
    gap: 1rem;
    justify-items: center; /* centra cada botón dentro de la grid */
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
    text-align: center; /* centra los títulos */
  }
</style>

<div class="container">
  <!-- Asteroides peligrosos -->
  <div class="flex flex-col items-center w-full max-w-6xl gap-4">
    <h2 class="section-title">Asteroides peligrosos</h2>
    {#if loadingAsteroids}
      <p>Cargando...</p>
    {:else}
      <div class="grid-asteroids w-full">
        {#each dangerousAsteroids as asteroid (asteroid.id)}
          <button class="asteroid-btn">
            <p class="font-semibold">{asteroid.name}</p>
            <p class="text-sm">Magnitud absoluta: {asteroid.metadata.absoluteMagnitude}</p>
            <p class="text-sm">
              Diámetro estimado: {asteroid.metadata.estimatedDiameter.min.toFixed(2)} - 
              {asteroid.metadata.estimatedDiameter.max.toFixed(2)} km
            </p>
            <p class="text-sm">
              Próximo acercamiento: {asteroid.closeApproachData[0]?.closeApproachDate}
            </p>
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Asteroides no peligrosos -->
  <div class="flex flex-col items-center w-full max-w-6xl gap-4">
    <h2 class="section-title">Asteroides no peligrosos</h2>
    {#if loadingAsteroids}
      <p>Cargando...</p>
    {:else}
      <div class="grid-asteroids w-full">
        {#each nonDangerousAsteroids as asteroid (asteroid.id)}
          <button class="asteroid-btn">
            <p class="font-semibold">{asteroid.name}</p>
            <p class="text-sm">Magnitud absoluta: {asteroid.metadata.absoluteMagnitude}</p>
            <p class="text-sm">
              Diámetro estimado: {asteroid.metadata.estimatedDiameter.min.toFixed(2)} - 
              {asteroid.metadata.estimatedDiameter.max.toFixed(2)} km
            </p>
            <p class="text-sm">
              Próximo acercamiento: {asteroid.closeApproachData[0]?.closeApproachDate}
            </p>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Cartesian comentado por ahora -->
<!-- <Cartesian /> -->
