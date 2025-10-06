<script lang="ts">
  import type { Asteroids } from "$lib/interfaces/asteroid.interfaces";
  import { getSimulationUrl } from "$lib/asteroidUrl";
  import {
    ChevronLeftIcon,
    ChevronRightIcon,
    HouseIcon,
    RulerIcon,
    CalendarIcon,
    RulerDimensionLineIcon,
  } from "@lucide/svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { t, locale } from "$lib/translations";

  let data: Asteroids | null = null;
  let loading = true;
  let emptyList = Array.from({ length: 12 }).map((_, i) => i);
  let selectedAsteroidsMap = new Map<string, string>();

  // Filtros
  let showOnlyHazardous = false;
  let limit = "";

  onMount(async () => {
    try {
      const res = await fetch(
        "https://nasa-meteor-challenge.koyeb.app/asteroids"
      );
      if (!res.ok) throw new Error("Error al cargar los datos");
      data = await res.json();
    } finally {
      loading = false;
    }
  });

  // Filtrado y limitación
  $: filteredAsteroids = data
    ? data.asteroids
        .filter(
          (a) =>
            !showOnlyHazardous ||
            a.metadata.isPotentiallyHazardous ||
            a.metadata.isSentryObject
        )
        .slice(0, limit && +limit > 0 ? Math.min(+limit, 50) : undefined)
    : [];

  // Contador seleccionados
  $: selectedCount = selectedAsteroidsMap.size;

  // Manejo de selección
  function toggleAsteroid(id: string) {
    if (selectedAsteroidsMap.has(id)) {
      selectedAsteroidsMap.delete(id);
    } else {
      selectedAsteroidsMap.set(id, id);
    }
    // Forzar reactividad
    selectedAsteroidsMap = new Map(selectedAsteroidsMap);
  }

  // Paginación
  let currentPage = 1;
  const ITEMS_PER_PAGE = 8;
  $: totalPages = filteredAsteroids.length
    ? Math.ceil(filteredAsteroids.length / ITEMS_PER_PAGE)
    : 1;

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
  }

  function prevPage() {
    if (currentPage > 1) currentPage--;
  }

  function nextPage() {
    if (currentPage < totalPages) currentPage++;
  }

  $: paginatedAsteroids = filteredAsteroids.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function goToCartesian() {
    const asteroidIds = Array.from(selectedAsteroidsMap.keys());
    if (asteroidIds.length === 0) return;
    const simulationUrl = getSimulationUrl(asteroidIds);
    goto(simulationUrl);
  }
</script>

<section
  id="asteroids"
  class="max-w-7xl mx-auto px-4 md:px-6 py-14 relative z-20"
>
  <h3 class="text-center text-4xl font-bold mb-2">
    {$t("asteroidList.title")}
  </h3>

  <p class="text-center mb-8 max-w-2xl mx-auto text-gray-300">
    {$t("asteroidList.description")}
  </p>

  <div
    class="flex flex-col md:flex-row items-center justify-between mb-6 gap-4"
  >
    <div class="flex items-center gap-2">
      <label class="text-sm font-medium"
        >{$t("asteroidList.filter.view")}:

        <select
          class="bg-gray-800 border border-gray-600 rounded px-2 py-1"
          bind:value={showOnlyHazardous}
        >
          <option value={false}>{$t("asteroidList.filter.all")}</option>
          <option value={true}>{$t("asteroidList.filter.hazardous")}</option>
        </select>
      </label>
      <label class="text-sm font-medium ml-4"
        >{$t("asteroidList.filter.limit")}:
        <input
          type="number"
          min="1"
          max="50"
          class="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-20"
          bind:value={limit}
          placeholder={$t("asteroidList.filter.noLimit")}
        />
      </label>
    </div>
    <div class="flex items-center gap-4">
      <p class="text-lg font-semibold">
        {$t("asteroidList.selected")}: {selectedCount}
      </p>
      <button
        class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        on:click={goToCartesian}
        disabled={selectedCount === 0}
      >
        {$t("asteroidList.simulation")}
      </button>
    </div>
  </div>

  <div
    class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
  >
    {#if loading}
      {#each emptyList}
        <div class="card">
          <div
            class="text-lg font-semibold mb-2 bg-gray-50 animate-pulse h-[18px] w-10 rounded-md"
          ></div>
          <div
            class="text-sm bg-gray-300 mb-1 animate-pulse h-4 w-full md:w-36 rounded-md"
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
      {#each paginatedAsteroids as asteroid}
        <input
          id={asteroid.id}
          type="checkbox"
          class="peer sr-only"
          checked={selectedAsteroidsMap.has(asteroid.id)}
          on:change={() => toggleAsteroid(asteroid.id)}
        />
        <label
          for={asteroid.id}
          class="card cursor-pointer"
          class:card-focus={selectedAsteroidsMap.has(asteroid.id)}
        >
          <div class="text-lg font-semibold mb-2">{asteroid.name}</div>
          <div class="flex items-start gap-2 text-sm text-gray-300 mb-1">
            <RulerIcon class="size-4" />
            {$t("asteroidList.diameter")}: {(
              asteroid.metadata.estimatedDiameter.min * 1000
            ).toFixed(2)}m -{" "}
            {(asteroid.metadata.estimatedDiameter.max * 1000).toFixed(2)}m
          </div>
          <div class="flex items-start gap-2 text-sm text-gray-300 mb-1">
            <CalendarIcon class="size-4" />
            {$t("asteroidList.approachDate")}:{" "}
            {new Date(
              asteroid.closeApproachData[0].closeApproachDate
            ).toLocaleDateString($locale === "en" ? "en-US" : "es-ES")}
          </div>
          <div class="flex items-start gap-2 text-sm text-gray-300 mb-1">
            <RulerDimensionLineIcon class="size-4" />
            {$t("asteroidList.minDistance")}:{" "}
            {(asteroid.metadata.missDistance?.km ?? 0).toFixed(2)}{" "}
            km
          </div>
          <div
            class="font-semibold"
            class:badge-info={asteroid.metadata.isSentryObject}
            class:badge-danger={asteroid.metadata.isPotentiallyHazardous}
            class:badge-success={!asteroid.metadata.isSentryObject &&
              !asteroid.metadata.isPotentiallyHazardous}
          >
            {asteroid.metadata.isPotentiallyHazardous
              ? $t("asteroidList.status.hazardous")
              : asteroid.metadata.isSentryObject
                ? $t("asteroidList.status.sentry")
                : $t("asteroidList.status.safe")}
          </div>
        </label>
      {/each}
    {/if}
  </div>

  <!-- Paginación -->
  {#if !loading && filteredAsteroids.length > 0}
    <div class="flex justify-center items-center gap-2 mt-8">
      <button
        class="p-2 rounded hover:bg-gray-700 disabled:opacity-50"
        on:click={() => goToPage(1)}
        disabled={currentPage === 1}
        aria-label={$t("asteroidList.pagination.first")}
      >
        <HouseIcon size={20} />
      </button>
      <button
        class="p-2 rounded hover:bg-gray-700 disabled:opacity-50"
        on:click={prevPage}
        disabled={currentPage === 1}
        aria-label={$t("asteroidList.pagination.prev")}
      >
        <ChevronLeftIcon size={20} />
      </button>
      <span class="mx-2 text-lg font-semibold">
        {$t("asteroidList.pagination.page")}
        {currentPage}
        {$t("asteroidList.pagination.of")}
        {totalPages}
      </span>
      <button
        class="p-2 rounded hover:bg-gray-700 disabled:opacity-50"
        on:click={nextPage}
        disabled={currentPage === totalPages}
        aria-label={$t("asteroidList.pagination.next")}
      >
        <ChevronRightIcon size={20} />
      </button>
    </div>
  {/if}
</section>
