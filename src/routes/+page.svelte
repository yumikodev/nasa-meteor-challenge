<script lang="ts">
  import type { Asteroids } from "$lib/interfaces/asteroid.interfaces";
  import AnimatedSpaceBg from "../components/AnimatedSpaceBg.svelte";
  import Navbar from "../components/Navbar.svelte";
  import { onMount } from "svelte";

  let data: Asteroids | null = null;
  let loading = true;
  let error: string | null = null;

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

<div class="bg-[#0a0e1a] text-white">
  <Navbar />

  <section
    class="relative h-screen flex items-center justify-center overflow-hidden"
  >
    <!-- Fondo animado con planeta y meteoritos -->
    <AnimatedSpaceBg />

    <div class="relative z-10 text-center max-w-5xl mx-auto px-6 pt-6">
      <h1
        class="text-4xl md:text-6xl lg:text-8xl mb-6 bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent"
      >
        Detección y Monitoreo de Meteoritos
      </h1>
      <p class="text-lg md:text-xl text-white mb-8 max-w-2xl mx-auto px-4">
        Rastreo en tiempo real de objetos cercanos a la Tierra, meteoritos y
        asteroides. Impulsado por la red avanzada de detección de la NASA.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center px-4">
        <a class="btn-primary" href="#asteroids"> Ver asteroides cercanos </a>
      </div>
    </div>
  </section>

  <section class="max-w-7xl mx-auto px-4 md:px-6 mb-5 relative z-20">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
      {#if loading}
        <div
          class="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-xl"
        >
          <div class="text-xl md:text-3xl mb-1 text-white">0</div>
          <div class="text-xs md:text-sm text-gray-200">
            Asteroides peligrosos
          </div>
        </div>

        <div
          class="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-xl"
        >
          <div class="text-xl md:text-3xl mb-1 text-white">0</div>
          <div class="text-xs md:text-sm text-gray-200">
            Asteroides cercanos a la Tierra
          </div>
        </div>

        <div
          class="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-xl"
        >
          <div class="text-xl md:text-3xl mb-1 text-white">0</div>
          <div class="text-xs md:text-sm text-gray-200">
            Asteroides en monitoreo
          </div>
        </div>
      {:else if data}
        <div
          class="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-xl"
        >
          <div class="text-xl md:text-3xl mb-1 text-white">
            {data.metadata.hazardousCount}
          </div>
          <div class="text-xs md:text-sm text-gray-200">
            Asteroides peligrosos
          </div>
        </div>

        <div
          class="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-xl"
        >
          <div class="text-xl md:text-3xl mb-1 text-white">
            {data.metadata.totalCount}
          </div>
          <div class="text-xs md:text-sm text-gray-200">
            Asteroides cercanos a la Tierra
          </div>
        </div>

        <div
          class="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-xl"
        >
          <div class="text-xl md:text-3xl mb-1 text-white">
            {data.metadata.sentryCount}
          </div>
          <div class="text-xs md:text-sm text-gray-200">
            Asteroides en monitoreo
          </div>
        </div>
      {/if}
    </div>
  </section>

  <section
    id="asteroids"
    class="max-w-7xl mx-auto px-4 md:px-6 py-14 relative z-20"
  >
    <h3 class="text-center text-3xl font-semibold">Lista de asteroides</h3>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      {#if data}
        {#each data.asteroids as asteroid}
          <div
            class="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-xl"
          >
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
</div>
