import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import { createPlanetLabel } from '../../shared/helpers/label.helper';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sun } from './sun';
import { Earth } from './earth';
import { Moon } from './moon';
import { createHighlightCircle } from '../../shared/helpers/highlight.helper';
import { CAMERA_VIEWS } from './camera-views';

@Component({
  selector: 'app-interplanetary-space',
  templateUrl: './interplanetary-space.html',
  styleUrls: ['./interplanetary-space.css'],
  standalone: true,
})
export class InterplanetarySpaceComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLDivElement>;

  public scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;

  private time: number = 0;

  // Planetas
  private earth!: Earth;
  private moon!: Moon;

  // Labels
  private sunLabel!: THREE.Sprite;
  private earthLabel!: THREE.Sprite;
  private moonLabel!: THREE.Sprite;

  // Highlights
  private earthHighlight!: THREE.Mesh;
  private moonHighlight!: THREE.Mesh;

  // Offset fijo de la cámara respecto a la Tierra (como si orbitara junto a ella)
  private cameraOffset = new THREE.Vector3(0, 3, 3);

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initScene();

    // Sol
    const sun = new Sun();
    sun.mesh.position.set(0, 0, 0);
    this.scene.add(sun.mesh);

    this.sunLabel = createPlanetLabel('Sun');
    this.sunLabel.position.set(0, 10, 0);
    this.scene.add(this.sunLabel);

    // Tierra
    this.earth = new Earth();
    this.earth.mesh.position.set(this.earth.orbitRadius, 0, 0);
    this.scene.add(this.earth.mesh);
    this.scene.add(this.earth.orbit());

    this.earthLabel = createPlanetLabel('Earth');
    this.earthLabel.position.set(this.earth.orbitRadius, 10, 0);
    this.scene.add(this.earthLabel);

    this.earthHighlight = createHighlightCircle(this.earth.radius * 4, 0x00ccff);
    this.earthHighlight.position.copy(this.earth.mesh.position);
    this.scene.add(this.earthHighlight);

    // Luna
    this.moon = new Moon();
    this.moon.mesh.position.set(1, 0, 0);
    this.scene.add(this.moon.mesh);

    this.moonLabel = createPlanetLabel('Moon');
    this.moonLabel.position.set(this.moon.mesh.position.x, 5, this.moon.mesh.position.z);
    this.scene.add(this.moonLabel);

    this.moonHighlight = createHighlightCircle(this.moon.radius * 5, 0xffffff);
    this.moonHighlight.position.copy(this.moon.mesh.position);
    this.scene.add(this.moonHighlight);

    // Inicializar cámara relativa a la Tierra
    const earthView = CAMERA_VIEWS.earth(this.earth.mesh.position);
    this.camera.position.copy(earthView.position);
    this.controls.target.copy(earthView.target);
    this.controls.update();

    this.animate();
  }

  private initScene() {
    const width = this.canvasRef.nativeElement.clientWidth;
    const height = this.canvasRef.nativeElement.clientHeight;
  
    this.scene = new THREE.Scene();
  
    const loader = new THREE.TextureLoader();
    loader
      .loadAsync('/images/interplanetary-space.jpg')
      .then((texture) => {
        this.scene.background = texture;
      })
      .catch(() => {
        this.scene.background = new THREE.Color(0x000000);
      });
  
    this.camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.canvasRef.nativeElement.appendChild(this.renderer.domElement);
  
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
    this.controls.enableRotate = true;
  
    // 💡 Zoom + Rotación actualizada
    let previousDistance = this.camera.position.distanceTo(this.controls.target);
  
    this.controls.addEventListener('change', () => {
      const currentEarthPos = this.earth?.mesh.position;
  
      if (!currentEarthPos) return;
  
      const newOffset = this.camera.position.clone().sub(currentEarthPos);
      this.cameraOffset = newOffset;
  
      const currentDistance = this.camera.position.distanceTo(this.controls.target);
      previousDistance = currentDistance;
    });
  }
  

  private animate = () => {
    requestAnimationFrame(this.animate);

    this.time += 0.01;

    const earthSpeed = 0.01;
    const earthAngle = this.time * earthSpeed;

    // Posicionar la Tierra en su órbita
    if (this.earth) {
      this.earth.mesh.position.set(
        Math.cos(earthAngle) * this.earth.orbitRadius,
        0,
        Math.sin(earthAngle) * this.earth.orbitRadius
      );
      this.earth.mesh.rotation.y += 0.02;

      this.earthHighlight.position.copy(this.earth.mesh.position);
    }

    // Etiqueta de la Tierra
    if (this.earthLabel && this.earth) {
      this.earthLabel.position.set(
        this.earth.mesh.position.x,
        10,
        this.earth.mesh.position.z
      );
    }

    // Posicionar la Luna alrededor de la Tierra
    if (this.moon && this.earth) {
      const moonDistance = this.moon.orbitRadius;
      const moonSpeed = earthSpeed * (365 / 27.3);
      const moonAngle = this.time * moonSpeed;

      this.moon.mesh.position.set(
        this.earth.mesh.position.x + Math.cos(moonAngle) * moonDistance,
        0,
        this.earth.mesh.position.z + Math.sin(moonAngle) * moonDistance
      );
      this.moon.mesh.rotation.y = moonAngle;

      this.moonHighlight.position.copy(this.moon.mesh.position);
    }

    if (this.moonLabel && this.moon) {
      this.moonLabel.position.set(
        this.moon.mesh.position.x,
        5,
        this.moon.mesh.position.z
      );
    }

    // Etiqueta del Sol
    if (this.sunLabel) {
      this.sunLabel.position.set(0, 10, 0);
    }

    // 📌 Aquí fijamos la cámara en la misma órbita que la Tierra (offset relativo)
    if (this.earth) {
      const earthPosition = this.earth.mesh.position;
      const cameraPosition = earthPosition.clone().add(this.cameraOffset);
      this.camera.position.copy(cameraPosition);
      this.controls.target.copy(earthPosition);
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  setCameraView(view: keyof typeof CAMERA_VIEWS) {
    const viewDefinition = CAMERA_VIEWS[view];
    let pos: THREE.Vector3;
    let target: THREE.Vector3;

    if (typeof viewDefinition === 'function') {
      const viewData = viewDefinition(this.earth.mesh.position);
      pos = viewData.position;
      target = viewData.target;
    } else {
      pos = (viewDefinition as { position: THREE.Vector3; target: THREE.Vector3 }).position;
      target = (viewDefinition as { position: THREE.Vector3; target: THREE.Vector3 }).target;
    }

    this.cameraOffset = pos.clone().sub(target); // Nueva cámara "montada"
  }
}
