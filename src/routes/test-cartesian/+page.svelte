<script lang="ts">
  import { onMount } from "svelte";
  import { getSimulationUrl } from "$lib/asteroidUrl";
  import type { Asteroid, Asteroids } from "$lib/interfaces/asteroid.interfaces";

  let data: Asteroids | null = null;
  let loading = true;
  let error: string | null = null;
  let simulationUrl = "";
  let selectedAsteroids: Asteroid[] = []; // Aquí guardamos los seleccionados

  // Fetch de asteroides
  onMount(async () => {
    try {
      const res = await fetch("/api"); // tu endpoint principal
      if (!res.ok) throw new Error("Error al cargar los datos");

      const json = await res.json();
      data = {
        asteroids: [...json.dangerous, ...json.nonDangerous],
        metadata: json.metadata,
      };

      // Seleccionamos los primeros 2 asteroides como ejemplo
      selectedAsteroids = data.asteroids.slice(0, 2) as Asteroid[];
      simulationUrl = getSimulationUrl(selectedAsteroids);
    } catch (e) {
      error = "No se pudieron cargar los datos";
    } finally {
      loading = false;
    }
  });

  function goToCartesian() {
    if (!simulationUrl) return;
    window.location.href = simulationUrl; // Redirige a /cartesian con ?ids=...
  }
</script>

<div class="p-6">
  {#if loading}
    <p>Cargando asteroides...</p>
  {:else if error}
    <p class="text-red-500">{error}</p>
  {:else}
    <p>URL generada automáticamente:</p>
    <pre>{simulationUrl}</pre>

    <button on:click={goToCartesian} class="btn-primary mt-4">
      Ir a simulación Cartesian
    </button>
  {/if}
</div>
