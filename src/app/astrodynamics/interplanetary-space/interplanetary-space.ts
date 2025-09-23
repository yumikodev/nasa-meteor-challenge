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

    // Actualizar posición orbital de la Tierra
    const distance = 3; // distancia fija al Sol
    const speed = 1; // velocidad orbital
    const angle = this.time * speed;

    if (this.earth) {
      this.earth.mesh.position.set(
        Math.cos(angle) * distance,
        0,
        Math.sin(angle) * distance
      );

      // Rotación de la Tierra sobre su propio eje
      this.earth.mesh.rotation.y += 0.02;
    }

    // Parámetros Luna
    const moonDistance = 1;  // distancia de la luna a la tierra
    const moonSpeed = 5;     // velocidad orbital de la luna alrededor de la tierra
    const moonAngle = this.time * moonSpeed;
    
    if (this.moon && this.earth) {
      // Posición de la luna relativa a la tierra
      this.moon.mesh.position.set(
        this.earth.mesh.position.x + Math.cos(moonAngle) * moonDistance,
        0,
        this.earth.mesh.position.z + Math.sin(moonAngle) * moonDistance
      );
      this.moon.mesh.rotation.y += 0.05;
    }

    // Actualiza los controles
    this.controls.update();

    // Renderiza la escena
    this.renderer.render(this.scene, this.camera);
  };
}
