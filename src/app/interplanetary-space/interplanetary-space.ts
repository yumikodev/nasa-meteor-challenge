import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import * as THREE from 'three';
import { createPlanetLabel } from '../shared/helpers/label.helper';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sun } from './sun';
import { Earth } from './earth';
import { Moon } from './moon';
import { createHighlightCircle } from '../shared/helpers/highlight.helper';
import { CAMERA_VIEWS } from './camera-views';
import { getJulianDateFromSimulatedTime } from '../shared/helpers/kepler.helper';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-interplanetary-space',
  templateUrl: './interplanetary-space.html',
  styleUrls: ['./interplanetary-space.css'],
  standalone: true,
  imports: [DatePipe],
})
export class InterplanetarySpaceComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLDivElement>;

  public scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;

  private simulationStartDate = new Date('2025-01-01T00:00:00Z'); // Fecha exacta
  private simulationStartDateMs = this.simulationStartDate.getTime();

  public time: number = 0; // días desde 1 enero 2025 a las 00:00
  public isPaused: boolean = false;

  public simulatedDate: Date = new Date(this.simulationStartDateMs); // Fecha simulada precisa

  private earth!: Earth;
  private moon!: Moon;

  private sunLabel!: THREE.Sprite;
  private earthLabel!: THREE.Sprite;
  private moonLabel!: THREE.Sprite;

  private earthHighlight!: THREE.Mesh;
  private moonHighlight!: THREE.Mesh;

  private moonOrbit!: THREE.LineLoop;

  private cameraOffset = new THREE.Vector3(0, 3, 3);

  // Propiedades nuevas para controlar velocidad y límites
  public speed: number = 1; // Por defecto 1 segundo simulado = 1 segundo real
  public minSpeed: number = -90; // 3 meses ≈ -90 días
  public maxSpeed: number = 90; // 3 meses ≈ 90 días
  private lastFrameTime: number = performance.now();

  constructor(private cdr: ChangeDetectorRef) {}

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
    const JD = getJulianDateFromSimulatedTime(this.simulationStartDate, time);

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
  
    const now = performance.now();
    const deltaSec = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;
  
    if (!this.isPaused) {
      let deltaDays = this.speed * deltaSec; // Velocidad ajustada con el tiempo real
      deltaDays = Math.max(this.minSpeed, Math.min(this.maxSpeed, deltaDays));
  
      let newTime = this.time + deltaDays;
      const simulatedDateCandidate = new Date(
        this.simulationStartDateMs + newTime * 24 * 60 * 60 * 1000
      );
  
      // Asegurando que el tiempo esté dentro del rango deseado
      if (simulatedDateCandidate.getFullYear() > 2029) {
        this.time =
          (new Date('2029-12-31T00:00:00Z').getTime() - this.simulationStartDateMs) /
          (24 * 60 * 60 * 1000);
      } else if (simulatedDateCandidate.getFullYear() < 2020) {
        this.time =
          (new Date('2020-01-01T00:00:00Z').getTime() - this.simulationStartDateMs) /
          (24 * 60 * 60 * 1000);
      } else {
        this.time = newTime;
      }
  
      this.simulatedDate = new Date(this.simulationStartDateMs + this.time * 24 * 60 * 60 * 1000);
      this.cdr.markForCheck();
    }
  
    this.updatePositions(this.time);
  
    // Rotación de la Tierra en función del tiempo simulado y la velocidad ajustada
    if (this.earth && !this.isPaused) {
      const rotationSpeed = 0.0001; // Ajustar según la velocidad deseada de rotación
      const earthRotationPerDay = 2 * Math.PI / 365; // La Tierra da una vuelta por día, 2*pi radianes por 24 horas
  
      // La rotación es proporcional a la velocidad del tiempo simulado
      this.earth.mesh.rotation.y += earthRotationPerDay * this.speed * deltaSec; // Ajustar la rotación por velocidad y tiempo transcurrido
    }
  
    // Rotación de la Luna sobre su propio eje
    if (this.moon && !this.isPaused) {
      const moonRotationSpeed = 0.0005; // Ajustar según la velocidad de rotación de la Luna
      const moonRotationPerDay = 2 * Math.PI / 27.3; // La Luna da una vuelta sobre su eje en aproximadamente 27.3 días
  
      // La rotación es proporcional a la velocidad del tiempo simulado
      this.moon.mesh.rotation.y += moonRotationPerDay * this.speed * deltaSec; // Ajustar la rotación de la Luna
    }
  
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  // Esta función es para manejar el slider de velocidad
  public setSpeedFromSlider(sliderValue: number) {
    // 50 es el valor medio donde 1 segundo real = 1 segundo simulado
    const mid = 50;
    if (sliderValue == mid) {
      this.speed = 1; // 1 segundo real = 1 segundo simulado
    } else if (sliderValue < mid) {
      // Ajustar velocidad para valores negativos (más lento)
      this.speed = ((sliderValue / mid) * (1 - this.minSpeed)) + this.minSpeed;
    } else {
      // Ajustar velocidad para valores positivos (más rápido)
      this.speed = (((sliderValue - mid) / (100 - mid)) * (this.maxSpeed - 1)) + 1;
    }
  }

  public togglePause() {
    this.isPaused = !this.isPaused;
  }

  public setSpeed(newSpeed: number) {
    // Ajustar la velocidad, con límites de mínimo y máximo
    this.speed = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, newSpeed));
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
    this.camera.position.copy(pos);
    this.controls.target.copy(target);
    this.controls.update();
  }

  public getSimulatedDate(): Date {
    return this.simulatedDate;
  }
}


 
