<script lang="ts">
import { onMount } from "svelte";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

import { createEarth, updateEarth } from "$lib/Earth";
import { createSun } from "$lib/Sun";

import { page } from '$app/stores';
import { get } from 'svelte/store';

// --- Interfaces de asteroide ---
import type { AsteroidDetail, CloseApproachDataDetail, OrbitalData } from '$lib/interfaces/asteroid.interfaces';

let container: HTMLDivElement;

// --- Variables de control de tiempo ---
let daysElapsed = 0;
let isPaused = false;
let speed = 1; // en minutos por segundo real
const minSpeed = 1;   // 1 minuto por segundo real
const maxSpeed = 60;  // 60 minutos por segundo real
let simulatedDate = new Date();
let lastFrameTime = performance.now();

// --- Variables para recibir asteroide ---
let selectedAsteroidId: string | null = null;
let selectedAsteroidDate: string | null = null;
let asteroidDetail: AsteroidDetail | null = null;
let approachOnDate: CloseApproachDataDetail | null = null;

// --- Límites de simulación ---
let simulationMinDate: Date | null = null;
let simulationMaxDate: Date | null = null;

// --- Tipado del state ---
interface MyPageState {
  asteroid?: {
    id: string;
    nextCloseApproach: string;
  }
}

// --- Obtener asteroid del state y fetch ---
onMount(async () => {
  const p = get(page) as { state: MyPageState };
  if (p.state?.asteroid) {
    selectedAsteroidId = p.state.asteroid.id;
    selectedAsteroidDate = p.state.asteroid.nextCloseApproach;
    console.log("Asteroid received:", selectedAsteroidId, selectedAsteroidDate);

    // --- Fetch detalle del asteroide ---
    try {
      const res = await fetch(`/api?id=${selectedAsteroidId}`);
      if (!res.ok) throw new Error("Failed to fetch asteroid detail");
      asteroidDetail = await res.json() as AsteroidDetail;

      // --- Filtrar closeApproachData por la fecha ---
      approachOnDate = asteroidDetail.closeApproachData.find(cad => cad.closeApproachDate === selectedAsteroidDate) || null;

      console.log("Asteroid detail:", asteroidDetail);
      console.log("Approach on selected date:", approachOnDate);

      if (approachOnDate) {
        simulationMaxDate = new Date(approachOnDate.closeApproachDate);
        simulationMinDate = new Date(simulationMaxDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 días antes

        // Empezamos la simulación desde el mínimo
        simulatedDate = new Date(simulationMinDate);
        daysElapsed = 0;
      }
    } catch (err) {
      console.error("Error fetching asteroid detail:", err);
    }
  }

  initThreeJS();
});

// --- Funciones ---
function formatUTCDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
}

function togglePause() { isPaused = !isPaused; }

function setSpeedFromSlider(sliderValue: number) {
  // Slider de 0 a 100
  speed = minSpeed + ((sliderValue / 100) * (maxSpeed - minSpeed));
}

// --- Constantes ---
const AU_IN_UNITS = 50; // 1 AU = 50 unidades Three.js

// --- Inicialización de Three.js ---
function initThreeJS() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.001, 5000);
  camera.position.set(3 * AU_IN_UNITS, 3 * AU_IN_UNITS, 3 * AU_IN_UNITS);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
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
  controls.enablePan = true;
  controls.minDistance = 0.1;
  controls.maxDistance = 5000;

  // Sol
  const sunGroup = createSun();
  scene.add(sunGroup);
  const sunLight = new THREE.PointLight(0xffffff, 2);
  sunLight.position.set(0, 0, 0);
  sunGroup.add(sunLight);
  const sunLabel = new CSS2DObject(document.createElement("div"));
  sunLabel.element.className = "label";
  sunLabel.element.textContent = "Sun";
  sunGroup.add(sunLabel);

  // Tierra
  const earth = createEarth({ scene });
  scene.add(earth);
  const earthLabel = new CSS2DObject(document.createElement("div"));
  earthLabel.element.className = "label";
  earthLabel.element.textContent = "Earth";
  earth.add(earthLabel);

  //Asteroid
  

  scene.add(new THREE.GridHelper(20 * AU_IN_UNITS, 20));
  scene.add(new THREE.AxesHelper(5 * AU_IN_UNITS));

  // --- Animación ---
  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const deltaSec = (now - lastFrameTime) / 1000;
    lastFrameTime = now;

    if (!isPaused) {
      // 1 segundo real = speed minutos
      const deltaDays = (speed / (24 * 60)) * deltaSec; // convertimos minutos a días
      daysElapsed += deltaDays;

      let newSimulatedDate = new Date(simulationMinDate!.getTime() + daysElapsed * 24 * 60 * 60 * 1000);

      if (simulationMaxDate && newSimulatedDate > simulationMaxDate) {
        newSimulatedDate = new Date(simulationMaxDate);
        daysElapsed = (simulationMaxDate.getTime() - simulationMinDate!.getTime()) / (24 * 60 * 60 * 1000);
      }

      simulatedDate = newSimulatedDate;
    }

    (sunGroup as any).update(camera);
    (earth as any).update(camera, daysElapsed);
    updateEarth(earth, daysElapsed);

    controls.target.copy(earth.position);
    controls.update();

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }

  animate();

  window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    labelRenderer.setSize(container.clientWidth, container.clientHeight);
  });
}
</script>

<style>
:global(.label) {
  color: white;
  font-size: 14px;
  font-family: sans-serif;
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 6px;
  border-radius: 4px;
  pointer-events: auto;
  cursor: pointer;
}
</style>

<div bind:this={container} class="w-full h-screen relative"></div>

<div class="absolute top-4 left-4 flex flex-col gap-2 text-white z-50">
  <button on:click={togglePause} class="bg-gray-800 px-3 py-1 rounded hover:bg-gray-700 transition">
    {isPaused ? "Play" : "Pause"}
  </button>

  <span>{formatUTCDate(simulatedDate)}</span>

  <!-- Slider -->
  <div class="bg-gray-800 p-2 rounded flex flex-col gap-1">
    <div class="flex justify-between items-center">
      <span>Simulation Speed</span>
      <span>{speed.toFixed(2)} min/s</span>
    </div>
    <input type="range" min="0" max="100" value="50"
      on:input={(e) => setSpeedFromSlider((e.target as HTMLInputElement).valueAsNumber)}
      class="w-32"
    />
    <div class="text-xs text-gray-300">min/s = minutos por segundo real</div>
  </div>
</div>
