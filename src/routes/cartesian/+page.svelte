<script lang="ts">
import { onMount } from "svelte";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

import { createEarth, updateEarth } from "$lib/Earth";
import { createSun } from "$lib/Sun";

import { page } from '$app/stores';
import { get } from 'svelte/store';

let container: HTMLDivElement;

// --- Variables de control de tiempo ---
let daysElapsed = 0;
let isPaused = false;
let speed = 1;
let minSpeed = -90;
let maxSpeed = 90;
const simulationStartDate = new Date("2025-01-01T00:00:00Z");
let simulatedDate = new Date(simulationStartDate.getTime());
let lastFrameTime = performance.now();

// --- Variables para recibir asteroide ---
let selectedAsteroidId: string | null = null;
let selectedAsteroidDate: string | null = null;

// --- Tipado del state ---
interface MyPageState {
  asteroid?: {
    id: string;
    nextCloseApproach: string;
  }
}

// --- Obtener asteroid del state al montar ---
onMount(() => {
  const p = get(page) as { state: MyPageState };
  if (p.state?.asteroid) {
    selectedAsteroidId = p.state.asteroid.id;
    selectedAsteroidDate = p.state.asteroid.nextCloseApproach;
    console.log("Asteroid received:", selectedAsteroidId, selectedAsteroidDate);
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
  const mid = 50;
  if (sliderValue === mid) speed = 0;
  else if (sliderValue < mid) speed = minSpeed + (sliderValue / mid) * (0 - minSpeed);
  else speed = 0 + ((sliderValue - mid) / (100 - mid)) * (maxSpeed - 0);
}

const AU_IN_UNITS = 50; // 1 AU = 50 unidades Three.js

// --- Inicialización de Three.js ---
function initThreeJS() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(75, container.clientWidth/container.clientHeight, 0.001, 5000);
  camera.position.set(3*AU_IN_UNITS, 3*AU_IN_UNITS, 3*AU_IN_UNITS);

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
  sunLight.position.set(0,0,0);
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

  scene.add(new THREE.GridHelper(20*AU_IN_UNITS, 20));
  scene.add(new THREE.AxesHelper(5*AU_IN_UNITS));

  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const deltaSec = (now - lastFrameTime)/1000;
    lastFrameTime = now;

    if (!isPaused) {
      daysElapsed += speed * deltaSec;
      simulatedDate = new Date(simulationStartDate.getTime() + daysElapsed*24*60*60*1000);
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
    camera.aspect = container.clientWidth/container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    labelRenderer.setSize(container.clientWidth, container.clientHeight);
  });
}
</script>

<style>
:global(.label) {
  color:white;
  font-size:14px;
  font-family:sans-serif;
  background: rgba(0,0,0,0.5);
  padding:2px 6px;
  border-radius:4px;
  pointer-events:auto;
  cursor:pointer;
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
      <span>{speed.toFixed(2)} d/s</span>
    </div>
    <input type="range" min="0" max="100" value="50"
      on:input={(e)=>setSpeedFromSlider((e.target as HTMLInputElement).valueAsNumber)}
      class="w-32"
    />
    <div class="text-xs text-gray-300">d/s = days per second real | negative = reverse</div>
  </div>
</div>
