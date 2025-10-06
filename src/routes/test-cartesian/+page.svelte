<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

  let container: HTMLDivElement | null = null;

  onMount(() => {
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202020);

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Luz
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // Cubo controlable
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    cube.position.set(0, 0.5, 0);
    scene.add(cube);

    // Referencias visuales: líneas de plano 3D
    const gridSize = 200;
    const divisions = 20;
    const gridHelperXY = new THREE.GridHelper(gridSize, divisions, 0x888888, 0x444444);
    gridHelperXY.rotation.x = Math.PI / 2; // XY
    scene.add(gridHelperXY);

    const gridHelperXZ = new THREE.GridHelper(gridSize, divisions, 0x888888, 0x444444);
    scene.add(gridHelperXZ); // XZ plano

    const gridHelperYZ = new THREE.GridHelper(gridSize, divisions, 0x888888, 0x444444);
    gridHelperYZ.rotation.z = Math.PI / 2; // YZ
    scene.add(gridHelperYZ);

    // Cámara con OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 1.5;
    controls.minPolarAngle = Math.PI / 8;

    // Variables de movimiento
    const speed = 0.2;
    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener("mousemove", (event) => {
      const halfWidth = window.innerWidth / 2;
      const halfHeight = window.innerHeight / 2;
      mouseX = (event.clientX - halfWidth) / halfWidth; // -1 a 1
      mouseY = (event.clientY - halfHeight) / halfHeight; // -1 a 1
    });

    function animate() {
      requestAnimationFrame(animate);

      // girar cubo según mouse
      cube.rotation.y -= mouseX * 0.03; // izquierda/derecha
      cube.rotation.x -= mouseY * 0.03; // arriba/abajo

      // siempre avanza hacia adelante
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyEuler(cube.rotation);
      cube.position.add(forward.multiplyScalar(speed));

      // cámara detrás del cubo
      const offset = new THREE.Vector3(0, 5, 10);
      const cameraPos = cube.position.clone().add(offset.applyEuler(cube.rotation));
      camera.position.lerp(cameraPos, 0.1);
      controls.target.lerp(cube.position, 0.1);
      controls.update();

      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener("resize", () => {
      camera.aspect = container!.clientWidth / container!.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container!.clientWidth, container!.clientHeight);
    });
  });
</script>

<style>
  div {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    cursor: grab;
  }
</style>

<div bind:this={container}></div>
