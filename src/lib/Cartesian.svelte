<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
  import { createEarth, updateEarth } from "$lib/Earth";
  import { createSun, updateSun } from "$lib/Sun";

  let container: HTMLDivElement;

  // --- Variables de control de tiempo ---
  let daysElapsed = 0;
  let isPaused = false;
  let speed = 1;         // días simulados por segundo real
  let minSpeed = -90;
  let maxSpeed = 90;
  const simulationStartDate = new Date("2025-01-01T00:00:00Z");
  let simulatedDate = new Date(simulationStartDate.getTime());
  let lastFrameTime = performance.now();

  // --- Funciones de control de tiempo ---
  function togglePause() {
    isPaused = !isPaused;
  }

  function setSpeed(newSpeed: number) {
    speed = Math.max(minSpeed, Math.min(maxSpeed, newSpeed));
  }

  function setSpeedFromSlider(sliderValue: number) {
    const mid = 50;
    if (sliderValue === mid) speed = 1;
    else if (sliderValue < mid) speed = ((sliderValue / mid) * (1 - minSpeed)) + minSpeed;
    else speed = (((sliderValue - mid) / (100 - mid)) * (maxSpeed - 1)) + 1;
  }

  onMount(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      5000
    );
    camera.position.set(100, 100, 100);

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

    // --- Sol ---
    const sunGroup = createSun();
    scene.add(sunGroup);
    const sunLight = new THREE.PointLight(0xffffff, 2);
    sunLight.position.set(0, 0, 0);
    sunGroup.add(sunLight);
    const sunDiv = document.createElement("div");
    sunDiv.className = "label";
    sunDiv.textContent = "Sun";
    const sunLabel = new CSS2DObject(sunDiv);
    sunLabel.position.set(0, 10, 0);
    sunGroup.add(sunLabel);

    // --- Tierra ---
    const earth = createEarth();
    scene.add(earth);
    const earthDiv = document.createElement("div");
    earthDiv.className = "label";
    earthDiv.textContent = "Earth";
    const earthLabel = new CSS2DObject(earthDiv);
    earthLabel.position.set(0, 10, 0);
    earth.add(earthLabel);

    // --- Helpers ---
    scene.add(new THREE.AxesHelper(50));
    scene.add(new THREE.GridHelper(500, 50));

    // --- Animación con control de tiempo ---
    function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const deltaSec = (now - lastFrameTime) / 1000;
  lastFrameTime = now;

  if (!isPaused) {
    let deltaDays = speed * deltaSec;

    // Actualizamos días simulados
    daysElapsed += deltaDays;

    // --- Límite inferior: 1 enero 2020 ---
    const minDate = new Date("2020-01-01T00:00:00Z").getTime();
    if (simulationStartDate.getTime() + daysElapsed * 24*60*60*1000 < minDate) {
      daysElapsed = (minDate - simulationStartDate.getTime()) / (24*60*60*1000);
    }

    // --- Límite superior: 31 diciembre 2029 ---
    const maxDate = new Date("2029-12-31T00:00:00Z").getTime();
    if (simulationStartDate.getTime() + daysElapsed * 24*60*60*1000 > maxDate) {
      daysElapsed = (maxDate - simulationStartDate.getTime()) / (24*60*60*1000);
    }

    // Actualizamos la fecha simulada
    simulatedDate = new Date(simulationStartDate.getTime() + daysElapsed * 24*60*60*1000);
  }

  (sunGroup as any).update(camera);
  (earth as any).update(camera);
  updateEarth(earth, daysElapsed);
  updateSun(sunGroup);

  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

    animate();

    // --- Resize ---
    window.addEventListener("resize", () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      labelRenderer.setSize(container.clientWidth, container.clientHeight);
    });
  });
</script>

<style>
  :global(.label) {
    color: white;
    font-size: 14px;
    font-family: sans-serif;
    background: rgba(0, 0, 0, 0.5);
    padding: 2px 6px;
    border-radius: 4px;
    pointer-events: none;
  }
</style>

<!-- Contenedor de la simulación -->
<div bind:this={container} class="w-full h-screen relative"></div>

<!-- Controles de tiempo -->
<div class="absolute top-4 left-4 flex gap-2 items-center text-white z-50">
  <button
    on:click={togglePause}
    class="bg-gray-800 px-3 py-1 rounded hover:bg-gray-700 transition"
  >
    {isPaused ? "Play" : "Pause"}
  </button>
  <input
    type="range"
    min="0"
    max="100"
    value="50"
    on:input={(e) => setSpeedFromSlider((e.target as HTMLInputElement).valueAsNumber)}
    class="w-32"
  />
  <span class="ml-2">{simulatedDate.toDateString()}</span>
</div>
