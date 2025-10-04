<script lang="ts">
import { onMount } from "svelte";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

import { createEarth, updateEarth } from "$lib/Earth";
import { createAsteroid, updateAsteroid } from "$lib/Asteroid";
import { createSun } from "$lib/Sun";
import type { OrbitalDataAPI } from "../../simulacion/AsteroidOrbital";

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

// --- Datos UI ---
let asteroidDistanceAU = 0;
let asteroidSpeedKms = 0;
let showAsteroidData = false;

const AU_IN_UNITS = 50; // 1 AU = 50 unidades Three.js

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

function calcDistanceAU(pos1: THREE.Vector3, pos2: THREE.Vector3) {
  return pos1.distanceTo(pos2) / AU_IN_UNITS;
}

function calcSpeedKms(prevPos: THREE.Vector3, newPos: THREE.Vector3, deltaSec: number) {
  const KM_PER_UNIT = 149_597_870.7 / AU_IN_UNITS;
  return prevPos.distanceTo(newPos) * KM_PER_UNIT / deltaSec;
}

// --- Datos orbitales de Apophis ---
const apophisOrbitalData: OrbitalDataAPI = {
  semi_major_axis: "1.532061831012513",
  eccentricity: ".3349196084403366",
  inclination: "4.01947843961312",
  ascending_node_longitude: "15.93152107851185",
  perihelion_argument: "316.0911979132686",
  mean_anomaly: "42.55852171148786",
  epoch_osculation: "2461000.5",
  orbital_period: "692.6484492957338",
  perihelion_time: "2460918.616405367275"
};

let asteroid: THREE.Group;

onMount(() => {
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

  // Asteroide Apophis
  asteroid = createAsteroid({
    scene,
    name: "Apophis",
    radiusKm: 0.25,
    color: 0xffaa00,
    orbitalData: apophisOrbitalData,
    maxTrailPoints: 1000
  });
  scene.add(asteroid);

  // Label click para mostrar datos
  const asteroidLabel = asteroid.children.find(c => c instanceof CSS2DObject) as CSS2DObject;
  asteroidLabel.element.style.cursor = "pointer";
  asteroidLabel.element.onclick = () => showAsteroidData = !showAsteroidData;

  scene.add(new THREE.GridHelper(20*AU_IN_UNITS, 20));
  scene.add(new THREE.AxesHelper(5*AU_IN_UNITS));

  let prevAsteroidPos = asteroid.position.clone();

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
    updateAsteroid(asteroid, daysElapsed);

    asteroidDistanceAU = calcDistanceAU(earth.position, asteroid.position);
    asteroidSpeedKms = calcSpeedKms(prevAsteroidPos, asteroid.position, deltaSec);
    prevAsteroidPos.copy(asteroid.position);

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
});
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
.panel {
  background-color: rgba(0,0,0,0.8);
  color:white;
  padding:1rem;
  border-radius:8px;
  max-width:300px;
}
</style>

<div bind:this={container} class="w-full h-screen relative"></div>

<div class="absolute top-4 left-4 flex flex-col gap-2 text-white z-50">
  <button on:click={togglePause} class="bg-gray-800 px-3 py-1 rounded hover:bg-gray-700 transition">
    {isPaused ? "Play" : "Pause"}
  </button>

  <span>{formatUTCDate(simulatedDate)}</span>

  <div class="bg-gray-800 p-2 rounded">
    <div>Asteroid: Apophis</div>
    <div>Distance to Earth: {asteroidDistanceAU.toFixed(6)} AU</div>
    <div>Speed: {asteroidSpeedKms.toFixed(2)} km/s</div>
  </div>

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

  {#if showAsteroidData}
    <div class="panel mt-2">
      <h3>Orbital Data</h3>
      {#each Object.entries(apophisOrbitalData) as [key, value]}
        <div><strong>{key}:</strong> {value}</div>
      {/each}
    </div>
  {/if}
</div>
