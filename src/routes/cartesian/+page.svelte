<script lang="ts">
import { onMount } from "svelte";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { formatWithOptions } from "date-fns/fp";
import { createEarth, updateEarth } from "$lib/Earth";
import { createSun } from "$lib/Sun";
import { createAsteroid } from "$lib/Asteroid";
import { getOrbitPosition } from "$lib/AsteroidOrbital";
import type { AsteroidDetails } from "$lib/interfaces/asteroid.interfaces";
import type { OrbitalElements } from "$lib/AsteroidOrbital";
    import { Search } from "@lucide/svelte";

// --- Tipado del grupo de asteroide (extendemos Group para guardar elements/epoch) ---
interface AsteroidGroup extends THREE.Group {
  orbitalElements: OrbitalElements;
  epochMs?: number;
}

// --- Contenedor DOM ---
let container: HTMLDivElement | null = null;

// --- Tiempo base y simulación ---
const BASE_DATE = new Date("2025-10-01T00:00:00Z"); // comienzo de la vista
let simulatedDate = new Date(BASE_DATE);
let lastFrameTime = performance.now();

// speed: minutos simulados por segundo real
let speed = 30;
const minSpeed = 30;
const maxSpeed = 180;

// --- Datos y estructuras ---
let asteroidsData: AsteroidDetails[] = [];
let asteroidGroups: { group: AsteroidGroup; markers: THREE.Mesh[] }[] = [];
// --- Distancias en AU (actualizadas en cada frame) ---
let asteroidDistances: { name: string; distanceAU: number }[] = [];


const AU_IN_UNITS = 50; // solo para helpers visuales
const MS_PER_DAY = 1000 * 60 * 60 * 24;

// --- UI controles ---
let isPaused = false;
function togglePause() { isPaused = !isPaused; }
function setSpeedFromSlider(sliderValue: number) {
  speed = minSpeed + ((sliderValue / 100) * (maxSpeed - minSpeed));
}

// --- Julian date (JD) -> ms since unix epoch ---
function julianToMs(jd: number) {
  return (jd - 2440587.5) * MS_PER_DAY;
}

// --- onMount: cargar asteroides (ids por query param o archivo local) ---
onMount(async () => {
  try {
    const url = new URL(window.location.href);
    const idsParam = url.searchParams.getAll("id");

    if (idsParam.length > 0) {
      const ids = idsParam.map(s => s.trim()).filter(Boolean);
      const fetched: AsteroidDetails[] = await Promise.all(ids.map(id =>
        fetch(`https://nasa-meteor-challenge.koyeb.app/asteroids/${id}`).then(r => {
          if (!r.ok) throw new Error(`fetch failed for id ${id}`);
          return r.json();
        })
      ));

      asteroidsData = fetched;

    }
    initThreeJS();
  } catch (err) {
    console.error("Error inicializando asteroides:", err);
  }
});

console.log(asteroidsData);

// --- Inicializar ThreeJS y escena ---
function initThreeJS() {
  if (!container) {
    console.error("container DOM no ligado");
    return;
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.001, 5000);
  camera.position.set(3 * AU_IN_UNITS, 3 * AU_IN_UNITS, 3 * AU_IN_UNITS);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x000000, 1);
  container.appendChild(renderer.domElement);

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(container.clientWidth, container.clientHeight);
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.top = "0px";
  labelRenderer.domElement.style.pointerEvents = "none";
  container.appendChild(labelRenderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // --- Sol ---
  const sunGroup = createSun();
  // Si createSun ya añade luz, esto no hará daño; si no, añadimos luz de respaldo:
  const sunLight = new THREE.PointLight(0xffffff, 2);
  sunLight.position.set(0, 0, 0);
  sunGroup.add(sunLight);
  const sunLabel = new CSS2DObject(document.createElement("div"));
  sunLabel.element.className = "label";
  sunLabel.element.textContent = "Sun";
  sunGroup.add(sunLabel);
  scene.add(sunGroup);

  // --- Tierra (creada con tus orbital elements internos) ---
  const earth = createEarth({ scene });
  const earthLabel = new CSS2DObject(document.createElement("div"));
  earthLabel.element.className = "label";
  earthLabel.element.textContent = "Earth";
  earth.add(earthLabel);
  scene.add(earth);

  // --- Crear asteroides (cada uno con su orbitalData) ---
  asteroidGroups = [];

  asteroidsData.forEach(detail => {
    // aseguramos orbitalData normalizado
    const orbitalAPI = (detail as any).orbitalData ?? detail.orbitalData;

    // crear el grupo visual (createAsteroid dibuja la órbita fija)
    const group = createAsteroid({
      scene,
      orbitalData: orbitalAPI,
      detail,
      estimatedDiameterKm: detail.metadata?.estimatedDiameter
    }) as AsteroidGroup;

    // obtener elementos orbitales (AU, grados, periodo)
    const elements = orbitalAPI;

    // epoch en ms a partir de JD (epoch_osculation se espera en JD en tus datos)
    const epochMs = julianToMs(orbitalAPI.epoch_osculation);

    // guardamos orbitalElements en formato que usa getOrbitPosition
    group.orbitalElements = {
      a: elements.a,       // AU (mapOrbitalDataToElements retorna el valor directo)
      e: elements.e,
      i: elements.i,       // grados (mapOrbitalDataToElements used deg)
      omega: elements.omega,
      w: elements.w,
      M0: elements.M0,
      epoch: elements.epoch,
      period: elements.period
    };
    group.epochMs = epochMs;

    // añadir un label 2D (nombre) directamente al grupo
    const nameDiv = document.createElement("div");
    nameDiv.className = "label";
    nameDiv.textContent = detail.name ?? detail.designation ?? "Unnamed";
    const nameLabel = new CSS2DObject(nameDiv);
    nameLabel.position.set(0, 0, 0);
    group.add(nameLabel);


    scene.add(group);

    // close approach markers (rojos) si los hay
    const markers: THREE.Mesh[] = [];
    (detail.closeApproachData ?? []).forEach(cad => {
      const daysFromEpoch = (new Date(cad.closeApproachDate).getTime() - epochMs) / MS_PER_DAY;
      const pos = getOrbitPosition(group.orbitalElements, daysFromEpoch);

      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.08),
        new THREE.MeshBasicMaterial({ color: 0xff4444 })
      );
      marker.position.copy(pos);
      scene.add(marker);

      // etiqueta con la fecha de aproximación en UTC (si quieres la pones)
      const l = document.createElement("div");
      l.className = "label";
      l.textContent = new Date(cad.closeApproachDate).toUTCString();
      (marker as any).add(new CSS2DObject(l));

      markers.push(marker);
    });

    asteroidGroups.push({ group, markers });
  });

  // helpers visuales
  scene.add(new THREE.GridHelper(20 * AU_IN_UNITS, 20));
  scene.add(new THREE.AxesHelper(5 * AU_IN_UNITS));

  // --- Animación principal ---
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
    const now = performance.now();
    const deltaSec = (now - lastFrameTime) / 1000;
    lastFrameTime = now;

    if (!isPaused) {
      // speed = minutos simulados por segundo real -> convertimos a minutos por frame y movemos la fecha simulada
      const deltaMinutes = speed * deltaSec;
      simulatedDate = new Date(simulatedDate.getTime() + deltaMinutes * 60 * 1000);
    }

    // actualizamos asteroides: calculamos daysSinceEpoch para cada uno usando simulatedDate
    asteroidGroups.forEach(item => {
      const epochMs = item.group.epochMs ?? BASE_DATE.getTime();
      const daysSinceEpoch = (simulatedDate.getTime() - epochMs) / MS_PER_DAY;
      const pos = getOrbitPosition(item.group.orbitalElements, daysSinceEpoch);
      item.group.position.set(pos.x, pos.y, pos.z);
    });

        // --- Calcular distancias Tierra ↔ asteroide ---
    asteroidDistances = asteroidGroups.map(item => {
      const asteroidPos = item.group.position.clone();
      const earthPos = earth.position.clone();

      const distanceInUnits = asteroidPos.distanceTo(earthPos);
      const distanceAU = distanceInUnits / AU_IN_UNITS;

      const name = item.group.name || "Unnamed";
      return { name, distanceAU };
    });


    // Hacemos que la Tierra esté en su posición para la fecha simulada
    const daysSinceBase = (simulatedDate.getTime() - BASE_DATE.getTime()) / MS_PER_DAY;
    updateEarth(earth, daysSinceBase);

    controls.target.copy(earth.position);
    controls.update();

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }

  animate();

  // resize
  window.addEventListener("resize", () => {
    camera.aspect = container!.clientWidth / container!.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container!.clientWidth, container!.clientHeight);
    labelRenderer.setSize(container!.clientWidth, container!.clientHeight);
  });
}
</script>

<style>
:global(.label) {
  color: white;
  font-size: 12px;
  font-family: sans-serif;
  background: rgba(0,0,0,0.6);
  padding: 2px 6px;
  border-radius: 4px;
  pointer-events: none;
  white-space: nowrap;
}
</style>

<div bind:this={container} class="w-full h-screen relative"></div>

<!-- Control panel -->
<div class="absolute top-4 left-4 flex flex-col gap-3 text-white z-50 bg-gray-900 bg-opacity-70 p-3 rounded-lg shadow-lg">
  <button on:click={togglePause} class="bg-gray-800 px-3 py-1 rounded hover:bg-gray-700 transition">
    {isPaused ? "Play" : "Pause"}
  </button>

  <div class="text-sm">
    🕐 <strong>Simulated date (UTC):</strong> {simulatedDate.toISOString().replace("T", " ").slice(0, 19)} UTC
  </div>

  <div class="flex flex-col gap-2">
    <div class="flex justify-between text-sm">
      <span>Speed</span>
      <span>{speed.toFixed(0)} min/s</span>
    </div>
    <input
      type="range"
      min="0"
      max="100"
      value="50"
      on:input={(e) => setSpeedFromSlider((e.target as HTMLInputElement).valueAsNumber)}
      class="w-40"
    />
    <div class="text-xs text-gray-300">min/s = minutos simulados por segundo real (min {minSpeed} — max {maxSpeed})</div>
  </div>
    {#if asteroidDistances.length > 0}
      <div class="mt-2 text-sm">
        <strong>Distances from Earth (AU):</strong>
        <ul class="list-disc list-inside">
          {#each asteroidDistances as d}
            <li>{d.name}: {d.distanceAU.toFixed(3)} AU</li>
          {/each}
        </ul>
      </div>
    {/if}
</div>
