import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { createPlanetLabel } from '../shared/helpers/label.helper';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sun } from './sun';
import { Earth } from './earth';
import { Moon } from './moon';
import { createHighlightCircle } from '../shared/helpers/highlight.helper';
import { CAMERA_VIEWS } from './camera-views';
import { getJulianDateFromSimulatedTime } from '../shared/helpers/kepler.helper';
import { AsteroidService } from '../assets/asteroid.service';
import { Asteroid } from '../assets/asteroid.model';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-interplanetary-space',
  templateUrl: './interplanetary-space.html',
  styleUrls: ['./interplanetary-space.css'],
  standalone: true,
  imports: [DatePipe, CommonModule, FormsModule],
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
  private asteroidData!: Asteroid; // datos de JSON
  private asteroidMesh!: THREE.Mesh;
  private asteroidLabel!: THREE.Sprite;
  private asteroidOrbit!: THREE.LineLoop;
  
  

  public asteroidList: { id: string; name: string; file: string }[] = [];
  public selectedAsteroidId: string | null = null;
  

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

  constructor(
    private cdr: ChangeDetectorRef,
    private asteroidService: AsteroidService
  ) {}
  

 ngOnInit(): void {
   this.asteroidService.getAsteroidList().subscribe(list => {
     console.log('Asteroids from JSON:', list); // <--- depuración
     this.asteroidList = list.map(a => ({
       id: a.id.toString(),
       name: a.name,
       file: a.file
     }));
 
     if (this.asteroidList.length > 0) {
       this.selectedAsteroidId = this.asteroidList[0].id; // <--- muy importante
       this.selectAsteroid(this.asteroidList[0]);
     }
   });
 }
 
  
 public onAsteroidChange() {
   console.log('Selected asteroid id:', this.selectedAsteroidId);
   const entry = this.asteroidList.find(a => a.id === this.selectedAsteroidId);
   console.log('Found asteroid entry:', entry);
   if (entry) this.selectAsteroid(entry);
 }
 
  
  // Cuando seleccionas un asteroide
  public selectAsteroid(entry: { id: string; name: string; file: string }) {
    this.selectedAsteroidId = entry.id;
  
    this.asteroidService.getAsteroidById(entry.file).subscribe(data => {
      if (!data) return; // No se encontró el asteroide
  
      // eliminar meshes antiguos si existen
      if (this.asteroidMesh) {
        this.scene.remove(this.asteroidMesh);
        this.scene.remove(this.asteroidLabel);
        this.scene.remove(this.asteroidOrbit);
      }
  
      // Crear mesh dinámico
      const radius = data.geometry.radius || 1;
      const geometry = new THREE.SphereGeometry(radius, 16, 16);
      const material = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
      this.asteroidMesh = new THREE.Mesh(geometry, material);
      this.scene.add(this.asteroidMesh);
  
      // Crear label
      this.asteroidLabel = createPlanetLabel(data.name);
      this.scene.add(this.asteroidLabel);
  
      // Crear órbita
      this.asteroidOrbit = this.createOrbitPath(radius * 50);
      this.scene.add(this.asteroidOrbit);
  
      // Guardar datos para animación
      this.asteroidData = data;
    });
  }
  
  
  

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
    this.scene.add(this.earth.mesh);
    this.scene.add(this.earth.orbit());
  
    this.earthLabel = createPlanetLabel('Earth');
    this.scene.add(this.earthLabel);
  
    this.earthHighlight = createHighlightCircle(this.earth.radius * 4, 0x00ccff);
    this.scene.add(this.earthHighlight);
  
    // Luna
    this.moon = new Moon();
    this.scene.add(this.moon.mesh);
  
    this.moonLabel = createPlanetLabel('Moon');
    this.scene.add(this.moonLabel);
  
    this.moonHighlight = createHighlightCircle(this.moon.radius * 5, 0xffffff);
    this.scene.add(this.moonHighlight);
  
    this.moonOrbit = this.moon.orbitAroundEarth();
    this.scene.add(this.moonOrbit);
  
    // Configuración inicial de cámara
    const earthView = CAMERA_VIEWS.earth(new THREE.Vector3(0, 0, 0));
    this.camera.position.copy(earthView.position);
    this.controls.target.copy(earthView.target);
    this.controls.update();
  
    // Actualizar posiciones iniciales y empezar animación
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
  
    // Tierra
    if (this.earth) {
      const earthPos = this.earth.getPosition(JD);
      this.earth.mesh.position.copy(earthPos);
      this.earthHighlight.position.copy(earthPos);
      this.earthLabel.position.set(earthPos.x, 10, earthPos.z);
  
      // Cámara sigue a la Tierra
      const camPos = earthPos.clone().add(this.cameraOffset);
      this.camera.position.copy(camPos);
      this.controls.target.copy(earthPos);
    }
  
    // Luna
    if (this.moon && this.earth) {
      const moonWorld = this.earth.mesh.position.clone().add(this.moon.getRelativePosition(JD));
      this.moon.mesh.position.copy(moonWorld);
      this.moon.mesh.rotation.y += 0.01;
      this.moonHighlight.position.copy(moonWorld);
      this.moonLabel.position.set(moonWorld.x, 5, moonWorld.z);
      this.moonOrbit.position.copy(this.earth.mesh.position);
    }
  
    // Sol (si queremos mantener fijo, solo se asegura la altura de la etiqueta)
    if (this.sunLabel) {
      this.sunLabel.position.set(0, 10, 0);
    }
  
    // Asteroide (solo si se ha seleccionado alguno)
    if (this.asteroidMesh && this.asteroidData) {
      // posición simple: órbita circular a radio fijo alrededor del sol
      const radius = this.asteroidData.geometry.radius * 50;
      const angle = (JD / 365) * 2 * Math.PI; // 1 año = 2π
      const pos = new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    
      this.asteroidMesh.position.copy(pos);
      this.asteroidLabel.position.set(pos.x, 5, pos.z);
      this.asteroidOrbit.position.set(0, 0, 0); // órbita fija
    }
  
    this.controls.update();
  }
  

  private animate = () => {
    requestAnimationFrame(this.animate);
  
    const now = performance.now();
    const deltaSec = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;
  
    if (!this.isPaused) {
      // Actualizamos tiempo simulado con límites
      let deltaDays = this.speed * deltaSec;
      deltaDays = Math.max(this.minSpeed, Math.min(this.maxSpeed, deltaDays));
  
      let newTime = this.time + deltaDays;
      const simulatedDateCandidate = new Date(
        this.simulationStartDateMs + newTime * 24 * 60 * 60 * 1000
      );
  
      if (simulatedDateCandidate.getFullYear() > 2029) {
        this.time = (new Date('2029-12-31T00:00:00Z').getTime() - this.simulationStartDateMs) /
                    (24 * 60 * 60 * 1000);
      } else if (simulatedDateCandidate.getFullYear() < 2020) {
        this.time = (new Date('2020-01-01T00:00:00Z').getTime() - this.simulationStartDateMs) /
                    (24 * 60 * 60 * 1000);
      } else {
        this.time = newTime;
      }
  
      this.simulatedDate = new Date(this.simulationStartDateMs + this.time * 24 * 60 * 60 * 1000);
      this.cdr.markForCheck();
    }
  
    // Actualizamos posiciones de todos los cuerpos
    this.updatePositions(this.time);
  
    // Rotaciones proporcionales a la velocidad simulada
    const rotations: { mesh?: THREE.Object3D; periodDays: number; speedMultiplier?: number }[] = [
      { mesh: this.earth?.mesh, periodDays: 1 },
      { mesh: this.moon?.mesh, periodDays: 27.3 },
      { mesh: this.asteroidMesh, periodDays: 10000, speedMultiplier: 0.0001 }
    ];
    
  
    rotations.forEach(r => {
      if (r.mesh && !this.isPaused) {
        const speedFactor = r.speedMultiplier ?? (2 * Math.PI / r.periodDays);
        r.mesh.rotation.y += speedFactor * this.speed;
      }
    });
  
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
  
  private createOrbitPath(radius: number): THREE.LineLoop {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * 2 * Math.PI;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xffaa00 });
    return new THREE.LineLoop(geometry, material);
  }
  
}


 
