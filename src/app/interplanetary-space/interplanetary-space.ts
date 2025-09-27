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
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sun } from './sun';
import { Earth } from './earth';
import { Moon } from './moon';
//Helpers en su mayoría
import { toScaledValue } from '../shared/helpers/scale.helper';
import { createPlanetLabel } from '../shared/helpers/label.helper';
import { createHighlightCircle } from '../shared/helpers/highlight.helper';
import { CAMERA_VIEWS } from './camera-views';
import { getJulianDateFromSimulatedTime } from '../shared/helpers/kepler.helper';
// NEO Facade (maneja todo el parsing de datos)
import { AsteroidFacade } from '../core/facades/asteroid.facade';
import { Asteroid } from '../core/models/neo.model';
import { NeoAdapter } from '../core/adapters/neo.adapter'; // ruta correcta


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
  constructor(
    private cdr: ChangeDetectorRef,
    private asteroidFacade: AsteroidFacade
  ) {}
  private asteroidData!: Asteroid | null;
    private asteroidMesh!: THREE.Mesh;
  private asteroidLabel!: THREE.Sprite;
  private asteroidOrbit!: THREE.LineLoop;
  
  public selectedAsteroidId: string | null = null;
  
  // NUEVAS PROPIEDADES PARA EL BUSCADOR
  public searchTerm: string = '';
  public filteredAsteroids: { id: string; name: string }[] = [];
  
  

  private sunLabel!: THREE.Sprite;
  private earthLabel!: THREE.Sprite;
  private moonLabel!: THREE.Sprite;

  private earthHighlight!: THREE.Mesh;
  private moonHighlight!: THREE.Mesh;

  private moonOrbit!: THREE.LineLoop;

  private rotateMesh(mesh: THREE.Object3D, periodDays: number, speedMultiplier?: number) {
    const factor = speedMultiplier ?? (2 * Math.PI / periodDays);
    mesh.rotation.y += factor * this.speed;
  }
  

  private cameraOffset = new THREE.Vector3(0, 3, 3);

  // Propiedades nuevas para controlar velocidad y límites
  public speed: number = 1; // Por defecto 1 segundo simulado = 1 segundo real
  public minSpeed: number = -90; // 3 meses ≈ -90 días
  public maxSpeed: number = 90; // 3 meses ≈ 90 días
  private lastFrameTime: number = performance.now();
	public showAsteroidSelector: boolean = true; // controla ventana al centro

 ngOnInit(): void {
    this.asteroidFacade.getAll().subscribe((asteroids: Asteroid[]) => {
      this.filteredAsteroids = asteroids.map(a => ({ id: a.id, name: a.name }));
    });
  }
 
   
 public onAsteroidChange() {
   if (this.selectedAsteroidId) {
     this.selectAsteroid(this.selectedAsteroidId);
   }
 }

public filterAsteroids() {
  if (!this.searchTerm) {
    this.asteroidFacade.getAll().subscribe(asteroids => {
      this.filteredAsteroids = asteroids.map(a => ({ id: a.id, name: a.name }));
    });
    return;
  }

  this.asteroidFacade.search(this.searchTerm).subscribe(asteroids => {
    this.filteredAsteroids = asteroids.map(a => ({ id: a.id, name: a.name }));
  });
}

public filterHazardous(onlyHazardous: boolean) {
  if (onlyHazardous) {
    this.asteroidFacade.getHazardous().subscribe(asteroids => {
      this.filteredAsteroids = asteroids.map(a => ({ id: a.id, name: a.name }));
    });
  } else {
    this.asteroidFacade.getAll().subscribe(asteroids => {
      this.filteredAsteroids = asteroids.map(a => ({ id: a.id, name: a.name }));
    });
  }
}

public selectFirstFilteredAsteroid() {
  if (this.filteredAsteroids.length > 0) {
    this.onAsteroidSelect(this.filteredAsteroids[0].id);
  }
}


public onAsteroidSelect(id: string) {
  this.searchTerm = '';
  this.selectAsteroid(id);
  this.showAsteroidSelector = false; // cerrar ventana central y empezar simulación
}


private computePosition(asteroid: Asteroid, JD: number): THREE.Vector3 {
  if (!asteroid.orbit) return new THREE.Vector3(0, 0, 0);

  const a = asteroid.orbit.semiMajorAxis;
  const e = asteroid.orbit.eccentricity;
  const i = asteroid.orbit.inclination;

  // cálculo simplificado de posición en XY
  const theta = (JD % 365) / 365 * 2 * Math.PI;
  const x = a * (1 - e * e) / (1 + e * Math.cos(theta)) * Math.cos(theta);
  const y = a * (1 - e * e) / (1 + e * Math.cos(theta)) * Math.sin(theta);
  const z = Math.sin(i * Math.PI / 180) * y;
  return new THREE.Vector3(x, z, y);
}
 
 public selectAsteroid(id: string) {
   this.selectedAsteroidId = id;
 
   this.asteroidFacade.getById(id).subscribe((asteroid: Asteroid | undefined) => {
     if (!asteroid) return; // o simplemente: if (!asteroid) { } 
   
     // Limpiar asteroide anterior
     if (this.asteroidMesh) {
       this.scene.remove(this.asteroidMesh);
       this.asteroidMesh.geometry.dispose();
       (this.asteroidMesh.material as THREE.Material).dispose();
   
       this.scene.remove(this.asteroidLabel);
       this.scene.remove(this.asteroidOrbit);
     }
   
     // Crear nuevo asteroide
     const size = toScaledValue(asteroid.diameterKm);
     this.asteroidMesh = new THREE.Mesh(
       new THREE.SphereGeometry(size, 16, 16),
       new THREE.MeshStandardMaterial({ color: asteroid.isPotentiallyHazardous ? 0xff3300 : 0xffaa00 })
     );
     this.scene.add(this.asteroidMesh);
   
     const JD = getJulianDateFromSimulatedTime(this.simulationStartDate, this.time);
     const pos = this.computePosition(asteroid, JD);
     this.asteroidLabel = createPlanetLabel(asteroid.name);
     this.asteroidLabel.position.set(pos.x, pos.y + size * 2, pos.z);
     this.scene.add(this.asteroidLabel);
   
     if (!asteroid.orbit) return;
   
     const a = toScaledValue(asteroid.orbit.semiMajorAxis);
     const b = a * Math.sqrt(1 - asteroid.orbit.eccentricity ** 2);
     this.asteroidOrbit = this.createOrbitEllipse(a, b, asteroid.orbit.inclination);
     this.scene.add(this.asteroidOrbit);
   
     this.asteroidData = asteroid;
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
  
	this.earthHighlight = createHighlightCircle(toScaledValue(this.earth.radius * 4), 0x00ccff);
    this.scene.add(this.earthHighlight);
  
    // Luna
    this.moon = new Moon();
    this.scene.add(this.moon.mesh);
  
    this.moonLabel = createPlanetLabel('Moon');
    this.scene.add(this.moonLabel);
  
	this.moonHighlight = createHighlightCircle(toScaledValue(this.moon.radius * 5), 0xffffff);
    this.scene.add(this.moonHighlight);
  
    this.moonOrbit = this.moon.orbitAroundEarth();
    this.scene.add(this.moonOrbit);

    this.earth.mesh.castShadow = true;
    this.earth.mesh.receiveShadow = true;
    
    this.moon.mesh.castShadow = true;
    this.moon.mesh.receiveShadow = true;

    if (this.asteroidMesh) {
      this.asteroidMesh.castShadow = true;
      this.asteroidMesh.receiveShadow = true;
    }
    

	//Volumen y sobra a tierra y asteroides
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);
    
    const sunLight = new THREE.PointLight(0xffffff, 1.5, 0, 2);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;  // <-- línea nueva
    this.scene.add(sunLight);
      
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
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
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
      const earthLabelOffset = Math.max(toScaledValue(this.earth.radius * 4), 1.5);
      this.earthLabel.position.set(earthPos.x, earthPos.y + earthLabelOffset, earthPos.z);
  
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
      const moonLabelOffset = Math.max(toScaledValue(this.moon.radius * 4), 1);
      this.moonLabel.position.set(moonWorld.x, moonWorld.y + moonLabelOffset, moonWorld.z);
      this.moonOrbit.position.copy(this.earth.mesh.position);
    }
  
    // Sol (si queremos mantener fijo, solo se asegura la altura de la etiqueta)
    if (this.sunLabel) {
      this.sunLabel.position.set(0, 10, 0);
    }
  
    // Asteroide
    if (this.asteroidMesh && this.asteroidData) {
      const pos = this.computePosition(this.asteroidData, JD);
      this.asteroidMesh.position.copy(pos);
      this.asteroidLabel.position.set(pos.x, pos.y + toScaledValue(this.asteroidData.diameterKm), pos.z);
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
      this.time += deltaDays;
        
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
        this.rotateMesh(r.mesh, r.periodDays, r.speedMultiplier);
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
  
  private createOrbitEllipse(a: number, b: number, inclination: number = 0): THREE.LineLoop {
    const segments = 256; // más suave
    const points: THREE.Vector3[] = [];
  
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      points.push(new THREE.Vector3(Math.cos(angle) * a, 0, Math.sin(angle) * b));
    }
  
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({
      color: 0xffaa00,
      dashSize: 0.05,
      gapSize: 0.025
    });
    const ellipse = new THREE.LineLoop(geometry, material);
    ellipse.computeLineDistances(); // necesario para LineDashedMaterial
    ellipse.rotateX(inclination * Math.PI / 180);
    return ellipse;
  }
  
    
}


 
