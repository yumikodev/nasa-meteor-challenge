import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sun } from '../planets/sun';
import { Earth } from '../planets/earth';
import { Moon } from '../moon';

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

  // Para animación orbital
  private time: number = 0;

  // Guardamos referencia para actualizar posición
  private earth!: Earth;
  private moon!: Moon;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initScene();

    // Crear y agregar el Sol
    const sun = new Sun();
    sun.mesh.position.set(0, 0, 0);
    this.scene.add(sun.mesh);

    // Crear la Tierra y agregarla a la escena
    this.earth = new Earth();
    // La posición inicial la pondremos con la animación
    this.earth.mesh.position.set(3, 0, 0);
    this.scene.add(this.earth.mesh);

    // Luna
    this.moon = new Moon();
    this.moon.mesh.position.set(1, 0, 0); // Posición inicial relativa a la Tierra
    this.scene.add(this.moon.mesh);
    this.scene.add(this.earth.orbit());

    this.animate();
  }

  private initScene() {
    const width = this.canvasRef.nativeElement.clientWidth;
    const height = this.canvasRef.nativeElement.clientHeight;

    // Escena
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

    // Cámara
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 2, 10);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.canvasRef.nativeElement.appendChild(this.renderer.domElement);

    // Controles de cámara
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // suaviza movimiento
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
  
    this.time += 0.01; // Incremento del tiempo de animación
  
    // Parámetros Tierra
    const earthDistance = 3; // distancia fija al Sol
    const earthSpeed = 0.01; // velocidad orbital Tierra
    const earthAngle = this.time * earthSpeed;
  
    if (this.earth) {
      this.earth.mesh.position.set(Math.cos(earthAngle) * earthDistance, 0, Math.sin(earthAngle) * earthDistance);
  
      // Rotación de la Tierra sobre su propio eje
      this.earth.mesh.rotation.y += 0.02;
    }
  
    // Parámetros Luna
    const moonDistance = this.moon.orbitRadius;
    const moonSpeed = earthSpeed * (365 / 27.3); // velocidad orbital luna relativa a la tierra
    const moonAngle = this.time * moonSpeed;
  
    if (this.moon && this.earth) {
      this.moon.mesh.position.set(
        this.earth.mesh.position.x + Math.cos(moonAngle) * moonDistance, 0, this.earth.mesh.position.z + Math.sin(moonAngle) * moonDistance
      );
  
      // Rotación sincrónica de la Luna (siempre muestra la misma cara a la Tierra)
      this.moon.mesh.rotation.y = moonAngle;
    }
  
    // Actualiza los controles
    this.controls.update();
  
    // Renderiza la escena
    this.renderer.render(this.scene, this.camera);
  };
}
