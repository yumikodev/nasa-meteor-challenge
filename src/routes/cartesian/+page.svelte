<script lang="ts">
import { onMount } from "svelte";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

import { createEarth, updateEarth } from "$lib/Earth";
import { createSun } from "$lib/Sun";
import {
  createAsteroidMesh,
  getOrbitPosition,
  mapOrbitalDataToElements,
  createCloseApproachMarkers
} from "$lib/AsteroidOrbital";

import type { AsteroidDetails, CloseApproachDatum, OrbitalData } from "$lib/interfaces/asteroid.interfaces";

let container: HTMLDivElement;

// --- Control de tiempo ---
let daysElapsed = 0;
let isPaused = false;
let speed = 1;
const minSpeed = 1;
const maxSpeed = 60;
let simulatedDate = new Date();
let lastFrameTime = performance.now();

// --- Asteroides seleccionados ---
let selectedAsteroidIds: string[] = [];
let asteroidDetails: AsteroidDetails[] = [];
let orbitalDataList: OrbitalData[] = [];

// --- Límites de simulación ---
let simulationMinDate: Date | null = null;
let simulationMaxDate: Date | null = null;

// --- Control de velocidad ---
function togglePause() { isPaused = !isPaused; }
function setSpeedFromSlider(sliderValue: number) {
  speed = minSpeed + ((sliderValue / 100) * (maxSpeed - minSpeed));
}

const AU_IN_UNITS = 50;

// --- Parsear fechas de la API de forma segura ---
function parseAsteroidDetail(json: any): AsteroidDetails {
  const orbital = json.orbitalData || {};
  return {
    ...json,
    closeApproachData: (json.closeApproachData || []).map((cad: any) => ({
      ...cad,
      closeApproachDate: cad.closeApproachDate ? new Date(cad.closeApproachDate) : new Date()
    })),
    orbitalData: {
      ...orbital,
      orbitDeterminationDate: orbital.orbitDeterminationDate ? new Date(orbital.orbitDeterminationDate) : new Date(),
      first_observation_date: orbital.first_observation_date ? new Date(orbital.first_observation_date) : new Date(),
      last_observation_date: orbital.last_observation_date ? new Date(orbital.last_observation_date) : new Date(),
    }
  };
}

// --- Map orbitalData seguro ---
function mapToOrbitalDataAPI(data: OrbitalData) {
  return {
    semi_major_axis: data.semiMajorAxis ?? 1,
    eccentricity: data.eccentricity ?? 0,
    inclination: data.inclination ?? 0,
    ascending_node_longitude: data.ascendingNodeLongitude ?? 0,
    perihelion_argument: data.perihelionArgument ?? 0,
    mean_anomaly: data.meanAnomaly ?? 0,
    epoch_osculation: data.epochOsculation ?? Date.now(),
    orbital_period: data.orbitalPeriod ?? 365
  };
}

// --- onMount ---
onMount(async () => {
  const url = new URL(window.location.href);
  const idsParam = url.searchParams.get("ids");
  if (!idsParam) return;
  selectedAsteroidIds = idsParam.split(",");

  asteroidDetails = await Promise.all(
    selectedAsteroidIds.map(async id => {
      const res = await fetch(`/api?id=${id}`);
      if (!res.ok) throw new Error(`Error fetching asteroid ${id}`);
      const json = await res.json();
      return parseAsteroidDetail(json);
    })
  );

  orbitalDataList = asteroidDetails.map(a => a.orbitalData);

  const dates = asteroidDetails
    .flatMap(a => a.closeApproachData.map(c => c.closeApproachDate.getTime()))
    .filter(Boolean);

  if (dates.length > 0) {
    simulationMaxDate = new Date(Math.max(...dates));
    simulationMinDate = new Date(simulationMaxDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    simulatedDate = new Date(simulationMinDate);
  }

  initThreeJS();
});

// --- Three.js ---
function initThreeJS() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000); // fondo negro

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
  scene.add(sunGroup);
  const sunLight = new THREE.PointLight(0xffffff, 2);
  sunLight.position.set(0, 0, 0);
  sunGroup.add(sunLight);

  const sunLabel = new CSS2DObject(document.createElement("div"));
  sunLabel.element.className = "label";
  sunLabel.element.textContent = "Sun";
  sunGroup.add(sunLabel);

  // --- Tierra ---
  const earth = createEarth({ scene });
  scene.add(earth);
  const earthLabel = new CSS2DObject(document.createElement("div"));
  earthLabel.element.className = "label";
  earthLabel.element.textContent = "Earth";
  earth.add(earthLabel);

  // --- Asteroides ---
  asteroidDetails.forEach((asteroidDetail, i) => {
    const orbitalAPI = mapToOrbitalDataAPI(orbitalDataList[i]);
    const elements = mapOrbitalDataToElements(orbitalAPI);

    const diameterKm = (asteroidDetail.metadata.estimatedDiameter.min + asteroidDetail.metadata.estimatedDiameter.max) / 2;
    const position = getOrbitPosition(elements, 0);

    const asteroidMesh = createAsteroidMesh(position, diameterKm);
    scene.add(asteroidMesh);

    const closeApproaches = asteroidDetail.closeApproachData.map(cad => {
      const epochDate = new Date(orbitalAPI.epoch_osculation);
      const cadDate = new Date(cad.closeApproachDate);
      const daysFromEpoch = (cadDate.getTime() - epochDate.getTime()) / (1000*60*60*24);
      return { daysFromEpoch, label: cadDate.toUTCString() };
    });

    const markers = createCloseApproachMarkers(elements, closeApproaches);
    markers.forEach(m => {
      const label = new CSS2DObject(document.createElement("div"));
      label.element.className = "label";
      label.element.textContent = m.label ?? '';
      label.position.copy(m.position);
      asteroidMesh.add(label);
    });
  });

  scene.add(new THREE.GridHelper(20 * AU_IN_UNITS, 20));
  scene.add(new THREE.AxesHelper(5 * AU_IN_UNITS));

  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const deltaSec = (now - lastFrameTime) / 1000;
    lastFrameTime = now;

    if (!isPaused && simulationMinDate && simulationMaxDate) {
      const deltaDays = (speed / (24 * 60)) * deltaSec;
      daysElapsed += deltaDays;

      let newSimulatedDate = new Date(simulationMinDate.getTime() + daysElapsed * 24 * 60 * 60 * 1000);
      if (newSimulatedDate > simulationMaxDate) {
        newSimulatedDate = new Date(simulationMaxDate);
        daysElapsed = (simulationMaxDate.getTime() - simulationMinDate.getTime()) / (24*60*60*1000);
      }
      simulatedDate = newSimulatedDate;
    }

    (sunGroup as any).update?.(camera);
    (earth as any).update?.(camera, daysElapsed);
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

  <span>{simulatedDate.toUTCString()}</span>

  <div class="bg-gray-800 p-2 rounded flex flex-col gap-1">
    <div class="flex justify-between items-center">
      <span>Simulation Speed</span>
      <span>{speed.toFixed(2)} min/s</span>
    </div>
    <input
      type="range"
      min="0"
      max="100"
      value="50"
      on:input={(e) => setSpeedFromSlider((e.target as HTMLInputElement).valueAsNumber)}
      class="w-32"
    />
    <div class="text-xs text-gray-300">min/s = minutos por segundo real</div>
  </div>
</div>
