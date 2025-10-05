<script lang="ts">
  import type { Asteroids } from "$lib/interfaces/asteroid.interfaces";
  import AnimatedSpaceBg from "../components/AnimatedSpaceBg.svelte";
  import AsteroidList from "../components/AsteroidList.svelte";
  import Navbar from "../components/Navbar.svelte";
  import { OrbitIcon, TriangleAlertIcon, SatelliteIcon } from "@lucide/svelte";
  import { onMount } from "svelte";
  import Footer from "../components/Footer.svelte";

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
          <div class="flex items-start justify-between mb-3 md:mb-4">
            <div
              class="p-2 md:p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg"
            >
              <TriangleAlertIcon class="w-4 h-4 md:w-6 md:h-6 text-cyan-400" />
            </div>
          </div>
          <div class="text-xl md:text-3xl mb-1 text-white">0</div>
          <div class="text-xs md:text-sm text-gray-200">
            Asteroides peligrosos
          </div>
        </div>

        <div
          class="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-xl"
        >
          <div class="flex items-start justify-between mb-3 md:mb-4">
            <div
              class="p-2 md:p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg"
            >
              <OrbitIcon class="w-4 h-4 md:w-6 md:h-6 text-cyan-400" />
            </div>
          </div>
          <div class="text-xl md:text-3xl mb-1 text-white">0</div>
          <div class="text-xs md:text-sm text-gray-200">
            Asteroides cercanos a la Tierra
          </div>
        </div>

        <div
          class="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-xl"
        >
          <div class="flex items-start justify-between mb-3 md:mb-4">
            <div
              class="p-2 md:p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg"
            >
              <SatelliteIcon class="w-4 h-4 md:w-6 md:h-6 text-cyan-400" />
            </div>
          </div>
          <div class="text-xl md:text-3xl mb-1 text-white">0</div>
          <div class="text-xs md:text-sm text-gray-200">
            Asteroides en monitoreo
          </div>
        </div>
      {:else if data}
        <div
          class="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-xl"
        >
          <div class="flex items-start justify-between mb-3 md:mb-4">
            <div
              class="p-2 md:p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg"
            >
              <TriangleAlertIcon class="w-4 h-4 md:w-6 md:h-6 text-cyan-400" />
            </div>
          </div>
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
          <div class="flex items-start justify-between mb-3 md:mb-4">
            <div
              class="p-2 md:p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg"
            >
              <OrbitIcon class="w-4 h-4 md:w-6 md:h-6 text-cyan-400" />
            </div>
          </div>
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
          <div class="flex items-start justify-between mb-3 md:mb-4">
            <div
              class="p-2 md:p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg"
            >
              <SatelliteIcon class="w-4 h-4 md:w-6 md:h-6 text-cyan-400" />
            </div>
          </div>
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

  <AsteroidList />

  <Footer />
</div>
