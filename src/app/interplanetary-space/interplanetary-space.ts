import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import { createPlanetLabel } from '../shared/helpers/label.helper';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sun } from './sun';
import { Earth } from './earth';
import { Moon } from './moon';
import { createHighlightCircle } from '../shared/helpers/highlight.helper';
import { CAMERA_VIEWS } from './camera-views';
import { getJulianDateFromSimulatedTime } from '../shared/helpers/kepler.helper';

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

  private simulationStartDateMs = new Date('2025-01-01T00:00:00Z').getTime();
  public time: number = 0; // días desde 1 enero 2025
  public isPaused: boolean = false;

  private earth!: Earth;
  private moon!: Moon;

  private sunLabel!: THREE.Sprite;
  private earthLabel!: THREE.Sprite;
  private moonLabel!: THREE.Sprite;

  private earthHighlight!: THREE.Mesh;
  private moonHighlight!: THREE.Mesh;

  private moonOrbit!: THREE.LineLoop;

  private cameraOffset = new THREE.Vector3(0, 3, 3);

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initScene();

    const sun = new Sun();
    sun.mesh.position.set(0, 0, 0);
    this.scene.add(sun.mesh);

    this.sunLabel = createPlanetLabel('Sun');
    this.sunLabel.position.set(0, 10, 0);
    this.scene.add(this.sunLabel);

    this.earth = new Earth();
    this.scene.add(this.earth.mesh);
    this.scene.add(this.earth.orbit());

    this.earthLabel = createPlanetLabel('Earth');
    this.scene.add(this.earthLabel);

    this.earthHighlight = createHighlightCircle(this.earth.radius * 4, 0x00ccff);
    this.scene.add(this.earthHighlight);

    this.moon = new Moon();
    this.scene.add(this.moon.mesh);

    this.moonLabel = createPlanetLabel('Moon');
    this.scene.add(this.moonLabel);

    this.moonHighlight = createHighlightCircle(this.moon.radius * 5, 0xffffff);
    this.scene.add(this.moonHighlight);

    this.moonOrbit = this.moon.orbitAroundEarth();
    this.scene.add(this.moonOrbit);

    const earthView = CAMERA_VIEWS.earth(new THREE.Vector3(0, 0, 0));
    this.camera.position.copy(earthView.position);
    this.controls.target.copy(earthView.target);
    this.controls.update();

    this.updatePositions(this.time);
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

    this.camera = new THREE.PerspectiveCamera(30, width / height, 0.001, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.canvasRef.nativeElement.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
    this.controls.enableRotate = true;

    this.controls.addEventListener('change', () => {
      const earthPos = this.earth?.mesh.position;
      if (earthPos) {
        this.cameraOffset = this.camera.position.clone().sub(earthPos);
      }
    });
  }

  private updatePositions(time: number) {
    const JD = getJulianDateFromSimulatedTime(new Date(this.simulationStartDateMs), time);

    if (this.earth) {
      const earthPos = this.earth.getPosition(JD);
      this.earth.mesh.position.copy(earthPos);
      this.earthHighlight.position.copy(earthPos);
      this.earthLabel.position.set(earthPos.x, 10, earthPos.z);
    }

    if (this.moon && this.earth) {
      const moonRel = this.moon.getRelativePosition(JD);
      const moonWorld = this.earth.mesh.position.clone().add(moonRel);

      this.moon.mesh.position.copy(moonWorld);
      this.moon.mesh.rotation.y += 0.01;
      this.moonHighlight.position.copy(moonWorld);
      this.moonLabel.position.set(moonWorld.x, 5, moonWorld.z);

      this.moonOrbit.position.copy(this.earth.mesh.position);
    }

    if (this.earth) {
      const camPos = this.earth.mesh.position.clone().add(this.cameraOffset);
      this.camera.position.copy(camPos);
      this.controls.target.copy(this.earth.mesh.position);
      this.controls.update();
    }

    if (this.sunLabel) {
      this.sunLabel.position.set(0, 10, 0);
    }
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    if (!this.isPaused) {
      this.time += 0.01;
    }

    this.updatePositions(this.time);

    if (this.earth && !this.isPaused) {
      this.earth.mesh.rotation.y += 0.02;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  public togglePause() {
    this.isPaused = !this.isPaused;
  }

  public setCameraView(view: keyof typeof CAMERA_VIEWS) {
    const viewDefinition = CAMERA_VIEWS[view];
    let pos: THREE.Vector3;
    let target: THREE.Vector3;

    if (typeof viewDefinition === 'function') {
      const vd = viewDefinition(this.earth.mesh.position);
      pos = vd.position;
      target = vd.target;
    } else {
      const vd = viewDefinition as { position: THREE.Vector3; target: THREE.Vector3 };
      pos = vd.position;
      target = vd.target;
    }

    this.cameraOffset = pos.clone().sub(target);
  }

  public getSimulatedDate(): Date {
    return new Date(this.simulationStartDateMs + this.time * 24 * 60 * 60 * 1000);
  }
}
