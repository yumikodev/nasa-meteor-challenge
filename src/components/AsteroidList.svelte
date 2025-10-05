<script lang="ts">
  import type { Asteroids } from "$lib/interfaces/asteroid.interfaces";
  import { onMount } from "svelte";

  let data: Asteroids | null = null;
  let loading = true;
  let error: string | null = null;
  let emptyList = Array.from({ length: 12 }).map((_, i) => i);

  onMount(async () => {
    try {
      const res = await fetch(
        "https://nasa-meteor-challenge.koyeb.app/asteroids"
      );
      if (!res.ok) throw new Error("Error al cargar los datos");
      data = await res.json();
    } catch (e) {
      error = "No se pudieron cargar los datos";
    } finally {
      loading = false;
    }
  });
</script>

<section
  id="asteroids"
  class="max-w-7xl mx-auto px-4 md:px-6 py-14 relative z-20"
>
  <h3 class="text-center text-3xl font-semibold mb-8">Lista de asteroides</h3>

  <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
    {#if loading}
      {#each emptyList}
        <div class="card">
          <div
            class="text-lg font-semibold mb-2 bg-gray-50 animate-pulse h-[18px] w-10 rounded-md"
          ></div>
          <div
            class="text-sm bg-gray-300 mb-1 animate-pulse h-4 w-36 rounded-md"
          ></div>
          <div
            class="text-sm bg-gray-300 mb-1 animate-pulse h-4 w-24 rounded-md"
          ></div>
          <div
            class="text-sm bg-gray-300 mb-1 animate-pulse h-4 w-24 rounded-md"
          ></div>
          <div
            class="text-sm bg-gray-500 font-semibold animate-pulse h-4 w-16 rounded-md"
          ></div>
        </div>
      {/each}
    {:else if data}
      {#each data.asteroids as asteroid}
        <div class="card">
          <div class="text-lg font-semibold mb-2">{asteroid.name}</div>
          <div class="text-sm text-gray-300 mb-1">
            Diámetro: {asteroid.metadata.estimatedDiameter.min.toFixed(2)}m -{" "}
            {asteroid.metadata.estimatedDiameter.max.toFixed(2)}m
          </div>
          <div class="text-sm text-gray-300 mb-1">
            Fecha de acercamiento:{" "}
            {new Date(
              asteroid.closeApproachData[0].closeApproachDate
            ).toLocaleDateString("es-ES")}
          </div>
          <div class="text-sm text-gray-300 mb-1">
            Distancia mínima:{" "}
            {(asteroid.metadata.missDistance?.km ?? 0).toFixed(2)}{" "}
            km
          </div>
          <div
            class="text-sm font-semibold"
            class:text-red-400={asteroid.metadata.isPotentiallyHazardous}
            class:text-green-400={!asteroid.metadata.isPotentiallyHazardous}
          >
            {asteroid.metadata.isPotentiallyHazardous
              ? "Peligroso"
              : "No peligroso"}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</section>
